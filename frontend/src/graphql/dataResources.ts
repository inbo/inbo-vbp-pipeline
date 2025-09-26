import { gql } from "../__generated__/biocache-index-management";

export const GET_ALL_DATA_RESOURCES = gql(`
  query GetAllDataResources {
    dataResources {
      id
      name
    }
  }
`);

export const GET_DATA_RESOURCE = gql(`
  query GetDataResource($id: ID!) {
    dataResource(id: $id) {
      id
      name
	    url
	    createdAt
	    checkedAt
	    updatedAt
	    processedAt
    }
  }
`);

export const GET_DATA_RESOURCE_HISTORY = gql(`
  query GetDataResourceHistory($input: DataResourceHistoryInput!) {
    dataResourceHistory(input: $input) {
      events {
        event
      }
    }
  }
`);
