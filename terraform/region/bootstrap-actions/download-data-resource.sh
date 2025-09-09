#!/bin/bash
set -e -o pipefail
# Required env vars
DATA_RESOURCE_ID=${DATA_RESOURCE_ID:?DATA_RESOURCE_ID is required as env var}
DATA_RESOURCE_URL=${DATA_RESOURCE_URL:?DATA_RESOURCE_URL is required as env var}
DATA_RESOURCE_LAST_UPDATED=${DATA_RESOURCE_LAST_UPDATED:?DATA_RESOURCE_LAST_UPDATED is required as env var}
APIKEY=${APIKEY:?AWS_SECRET_ID is required as env var}

# Optional env vars
DYNAMODB_FILE_HISTORY_TABLE=${DYNAMODB_FILE_HISTORY_TABLE:-vbp_pipelines}
OUTPUT_FOLDER=${OUTPUT_FOLDER:-/data/dwca-export}

# Download a single Data Resource and update metadata in DynamoDB
OUTPUT_LOCATION="${OUTPUT_FOLDER}/${DATA_RESOURCE_ID}/${DATA_RESOURCE_ID}.zip"

mkdir -p "${OUTPUT_FOLDER}/${DATA_RESOURCE_ID}"

# Download dataresource
echo "Downloading ${DATA_RESOURCE_ID} from ${DATA_RESOURCE_URL}"

curl -o "${OUTPUT_LOCATION}" -z "${OUTPUT_LOCATION}" -w "${DATA_RESOURCE_ID} returned status code: %{response_code}" "${DATA_RESOURCE_URL}"

# Update Dataresource metadata
FILE_SIZE=$(stat --printf="%s" "${OUTPUT_LOCATION}")
FILE_HASH=$(md5sum "${OUTPUT_LOCATION}" | cut -d ' ' -f 1)

echo "Finished downloading ${DATA_RESOURCE_ID} with size of ${FILE_SIZE} and hash ${FILE_HASH}"

aws dynamodb update-item --table-name "${DYNAMODB_FILE_HISTORY_TABLE}" \
  --key '{"PK": {"S": "'DataResource#$DATA_RESOURCE_ID'"},"SK": {"S": "'ProcessingState#$DATA_RESOURCE_LAST_UPDATED'"}}' \
  --update-expression 'SET FileSize = :size, FileHash = :hash' \
  --expression-attribute-values '{
    ":size": {"N": "'${FILE_SIZE}'"},
    ":hash": {"S": "'${FILE_HASH}'"}
  }'
