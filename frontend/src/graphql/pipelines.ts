import { gql } from "../__generated__/biocache-index-management";

export const GET_ALL_PIPELINES = gql(`
  query GetAllPipelines($status: PipelineStatus) {
    pipelines(status: $status) {
      id
      executionArn
      status
      startedAt
      stoppedAt
    }
  }
`);

export const GET_PIPELINE = gql(`
  query GetPipeline($id: ID!) {
    pipeline(id: $id) {
      id
      executionArn
      status
      startedAt
      stoppedAt
      input
      output
      error
      cause
    }
  }
`);

export const START_PIPELINE = gql(`
  mutation StartPipeline($input: StartPipelineInput!) {
    startPipeline(input: $input) {
      pipeline {
      id
      status
      startedAt
      stoppedAt
      input
      output
      error
      cause
      }
    }
  }
`);

export const CANCEL_PIPELINE = gql(`
  mutation CancelPipeline($input: CancelPipelineInput!) {
    cancelPipeline(input: $input) {
      pipeline {
      id
      status
      startedAt
      stoppedAt
      input
      output
      error
      cause
      }
    }
  }
`);

export const GET_PIPELINE_PROGRESS = gql(`
  query GetPipelineProgress($id: ID!) {
    pipeline(id: $id) {
      id
      executionArn
      status
      startedAt
      stoppedAt
      input
      output
      error
      cause

      stats {
        total {
          total
          queued
          running
          succeeded
          skipped
          failed
        }

        steps {
          step
          total
          queued
          running
          succeeded
          skipped
          failed
        }
      }
    }
  }
`);

export const GET_PIPELINE_DATA_RESOURCE_PROGRESS = gql(`
  query GetPipelineDataResourceProgress($step: PipelineStep!, $state: PipelineStepState, $id: ID!, $first: Int, $after: ID) {
    pipeline(id: $id) {
      dataResourceProgress(step: $step, state: $state, first: $first, after: $after) {
        pageInfo {
          endCursor
          hasNextPage
        }
        edges {
          node {
            dataResource {
              id
              name
            }
            step
            state
            timestamp
            error
            cause
          }
        }
      }
    }
  }
`);

export const GET_PIPELINE_DATA_RESOURCE_DETAILS = gql(`
  query GetPipelineDataResourceDetails($pipelineId: ID!, $dataResourceId: ID!) {
    pipeline(id: $pipelineId) {
      dataResource(id: $dataResourceId) {
        dataResource {
          id
          name
        }
        steps {
          step
          state
          timestamp
          error
          cause
        }
      }
    }
  }
`);

export const PIPELINE_FRAGMENT = gql(`
  fragment PipelineFragment on Pipeline {
    id
    executionArn
    status
    startedAt
    stoppedAt
    input
    output
    error
    cause
  }
`);
