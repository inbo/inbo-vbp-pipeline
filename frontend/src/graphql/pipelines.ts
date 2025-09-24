import { gql } from "../__generated__/biocache-index-management";

export const GET_ALL_PIPELINES = gql(`
  query GetAllPipelines($status: PipelineStatus) {
    pipelines(status: $status) {
      id
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
      status
      startedAt
      stoppedAt
      input
      output
      error
      cause

      progress {
        total
        completed
        failed

        stepProgress {
          step
          queued
          running
          completed
          failed
        }
      }
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
      progress {
        total
        completed
        failed

        stepProgress {
          step
          queued
          running
          completed
          failed
        }
        
        dataResourceProgress {
          dataResource {
            id
            name
          }
          state
          startedAt
          stoppedAt
        }
      }
    }
  }
`);
