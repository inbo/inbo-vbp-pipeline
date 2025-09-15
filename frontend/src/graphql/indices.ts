import { gql } from "../__generated__/biocache-index-management/gql";
export const GET_INDICES = gql(`
  query GetIndices {
    indices {
      id
    }
  }
`);
