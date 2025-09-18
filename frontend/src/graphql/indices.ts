import { gql } from "../__generated__/biocache-index-management";

export const GET_INDICES = gql(`
  query GetIndices {
    indices {
      id
      active
      counts {
        total
        dataResourceCounts {
          dataResourceId
          count
        }
      }
    }
  }
`);

export const SET_ACTIVE_INDEX = gql(`
  mutation SetActiveIndex($input: SetActiveIndexInput!) {
    setActiveIndex(input: $input) {
      index {
        id
        active
      }
    }
  }
`);

export const DELETE_INDEX = gql(`
  mutation DeleteIndex($input: DeleteIndexInput!) {
    deleteIndex(input: $input) {
      indexId
    }
  }
`);
