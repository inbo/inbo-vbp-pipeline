#!/bin/bash
set -e -o pipefail
# Required env vars
DATA_RESOURCE_ID=${DATA_RESOURCE_ID:?DATA_RESOURCE_ID is required as env var}
DATA_RESOURCE_URL=${DATA_RESOURCE_URL:?DATA_RESOURCE_URL is required as env var}
DATA_RESOURCE_LAST_UPDATED=${DATA_RESOURCE_LAST_UPDATED:?DATA_RESOURCE_LAST_UPDATED is required as env var}
DOWNLOADED_EVENT_TIMESTAMP=${DOWNLOADED_EVENT_TIMESTAMP:?DOWNLOADED_EVENT_TIMESTAMP is required as env var}
ROOT_PIPELINE_NAME=${ROOT_PIPELINE_NAME:?ROOT_PIPELINE_NAME is required as env var}
EXECUTION_PIPELINE_ID=${EXECUTION_PIPELINE_ID:?EXECUTION_PIPELINE_ID is required as env var}
APIKEY=${APIKEY:?APIKEY is required as env var}
S3_BUCKET_LOCATION=${S3_BUCKET_LOCATION:?S3_BUCKET_LOCATION is required as env var}

# Optional env vars
DYNAMODB_FILE_HISTORY_TABLE=${DYNAMODB_FILE_HISTORY_TABLE:-vbp_pipelines}
OUTPUT_FOLDER=${OUTPUT_FOLDER:-/data/dwca}

# Get actual locations
OUTPUT_LOCATION="${OUTPUT_FOLDER}/${DATA_RESOURCE_ID}.zip"

mkdir -p "${OUTPUT_FOLDER}"

# Decide how to obtain the data resource based on the URL
# - If the URL contains "/collectory/upload" -> treat as a local path and create a symlink to the source file at OUTPUT_LOCATION
# - file:// or absolute local path -> create a symlink
# - otherwise -> download over http(s) to OUTPUT_LOCATION (use conditional GET if file exists)

# extract path starting with /collectory if present in the URL
extract_collectory_path() {
  # if URL contains /collectory/... return that part
  echo "${DATA_RESOURCE_URL}" | sed -n 's@.*/\(collectory/.*\)@\1@p'
}

# Main decision
if echo "${DATA_RESOURCE_URL}" | grep -q "/collectory/upload"; then
  # URL references the collectory upload area -> symlink to local path
  SRC_PATH="/data/$(extract_collectory_path)"
  if [ -z "${SRC_PATH}" ]; then
    # fallback: if it's a file:// URL strip prefix
    if [[ "${DATA_RESOURCE_URL}" == file://* ]]; then
      SRC_PATH="${DATA_RESOURCE_URL#file://}"
    else
      # last resort: take the whole value as a path
      SRC_PATH="${DATA_RESOURCE_URL}"
    fi
  fi
  echo "Linking ${DATA_RESOURCE_ID} from collectory path ${SRC_PATH} to ${OUTPUT_LOCATION}"
  ln -sf "${SRC_PATH}" "${OUTPUT_LOCATION}"
elif [[ "${DATA_RESOURCE_URL}" == file://* ]]; then
  # file:// explicit local path
  SRC_PATH="${DATA_RESOURCE_URL#file://}"
  echo "Linking ${DATA_RESOURCE_ID} from local file ${SRC_PATH} to ${OUTPUT_LOCATION}"
  ln -sf "${SRC_PATH}" "${OUTPUT_LOCATION}"
elif [[ "${DATA_RESOURCE_URL}" == /* ]]; then
  # absolute path without scheme -> local
  SRC_PATH="${DATA_RESOURCE_URL}"
  echo "Linking ${DATA_RESOURCE_ID} from local path ${SRC_PATH} to ${OUTPUT_LOCATION}"
  ln -sf "${SRC_PATH}" "${OUTPUT_LOCATION}"
else
  # Otherwise assume it's an http(s) URL (or other remote URL) and download
  echo "Downloading ${DATA_RESOURCE_ID} from ${DATA_RESOURCE_URL} to ${OUTPUT_LOCATION} (atomic)"

  # Create a temporary file for atomic download
  TMPFILE=$(mktemp "${OUTPUT_LOCATION}.tmp.XXXXXX")
  # ensure cleanup on exit
  cleanup_tmp() {
    rm -f -- "${TMPFILE}" || true
  }
  trap cleanup_tmp EXIT

  # Build curl arguments; we download to TMPFILE and only move into place if TMPFILE is non-empty
  CURL_ARGS=( -fSL --retry 3 --retry-delay 2 )
  # Use conditional GET against the existing OUTPUT_LOCATION if present
  if [ -e "${OUTPUT_LOCATION}" ]; then
    echo "Local file exists at ${OUTPUT_LOCATION}; using conditional request to only download if remote is newer"
    CURL_ARGS+=( -z "${OUTPUT_LOCATION}" )
  fi

  # Perform the download into the temp file
  set +e
  # Capture HTTP status code via --write-out while sending response body to TMPFILE
  HTTP_CODE=$(curl "${CURL_ARGS[@]}" -o "${TMPFILE}" -w '%{http_code}' -s --show-error "${DATA_RESOURCE_URL}")
  CURL_EXIT=$?
  set -e

  if [ ${CURL_EXIT} -ne 0 ]; then
    echo "ERROR: curl failed (exit ${CURL_EXIT}) while downloading ${DATA_RESOURCE_URL}" >&2
    # cleanup will run via trap
    exit ${CURL_EXIT}
  fi

  echo "curl HTTP status: ${HTTP_CODE}"

  # If TMPFILE is non-empty, move it into place atomically. If it's empty and OUTPUT_LOCATION exists, assume remote was not modified.
  if [ -s "${TMPFILE}" ]; then
    # non-empty tmpfile means data was downloaded
    echo "Download completed (HTTP ${HTTP_CODE}); moving ${TMPFILE} -> ${OUTPUT_LOCATION}"
    mv -f -- "${TMPFILE}" "${OUTPUT_LOCATION}"
    # remove the trap so cleanup doesn't try to remove the moved file
    trap - EXIT
  else
    # empty tmpfile: check HTTP code to determine if it was a 304 Not Modified or an unexpected empty response
    if [ "${HTTP_CODE}" = "304" ] && [ -e "${OUTPUT_LOCATION}" ]; then
      echo "Remote not modified since last download (HTTP 304); keeping existing ${OUTPUT_LOCATION}"
      rm -f -- "${TMPFILE}" || true
      trap - EXIT
    elif [ -e "${OUTPUT_LOCATION}" ]; then
      # No new content but existing file exists; be conservative and keep existing file
      echo "No new data received (HTTP ${HTTP_CODE}); keeping existing ${OUTPUT_LOCATION}"
      rm -f -- "${TMPFILE}" || true
      trap - EXIT
    else
      echo "ERROR: download produced empty file (HTTP ${HTTP_CODE}) and no existing ${OUTPUT_LOCATION} to fall back to" >&2
      exit 1
    fi
  fi
fi

# Compute file size and hash (follow symlink to actual file when needed)
if [ -L "${OUTPUT_LOCATION}" ]; then
  TARGET_PATH=$(readlink -f "${OUTPUT_LOCATION}")
else
  TARGET_PATH="${OUTPUT_LOCATION}"
fi

if [ -e "${TARGET_PATH}" ]; then
  FILE_SIZE=$(stat --printf="%s" "${TARGET_PATH}")
  FILE_HASH=$(md5sum "${TARGET_PATH}" | cut -d ' ' -f 1)
else
  echo "ERROR: expected file at ${TARGET_PATH} but it does not exist" >&2
  exit 1
fi

# Update METADATA
echo "Updating DWCA ${DATA_RESOURCE_ID} stats with size of ${FILE_SIZE} and hash ${FILE_HASH}"
aws dynamodb put-item \
  --table-name "${DYNAMODB_FILE_HISTORY_TABLE}" \
  --item "$(cat <<EOF
{
  "PK": {
    "S": "DATA_RESOURCE#${DATA_RESOURCE_ID}"
  },
  "SK": {
    "S": "HISTORY#${DATA_RESOURCE_LAST_UPDATED}#${DOWNLOADED_EVENT_TIMESTAMP}#DOWNLOADED"
  },
  "RootPipelineName": {
    "S": "${ROOT_PIPELINE_NAME}"
  },
  "ExecutionId": {
    "S": "${EXECUTION_PIPELINE_ID}"
  },
  "DataResourceId": {
    "S": "${DATA_RESOURCE_ID}"
  },
  "Timestamp": {
    "S": "${DOWNLOADED_EVENT_TIMESTAMP}"
  },
  "Event": {
    "S": "DOWNLOADED"
  },
  "FileHash": {
    "S": "${FILE_HASH}"
  },
  "FileSize": {
    "N": "${FILE_SIZE}"
  }
}
EOF
)"
