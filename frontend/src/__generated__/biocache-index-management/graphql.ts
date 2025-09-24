/* eslint-disable */
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  Date: { input: any; output: any; }
};

export type CancelPipelineInput = {
  id: Scalars['ID']['input'];
};

export type CancelPipelineOutput = {
  __typename?: 'CancelPipelineOutput';
  pipeline: Pipeline;
};

export type ClearDataResourceFromIndexInput = {
  dataResourceId: Scalars['ID']['input'];
  indexId: Scalars['ID']['input'];
};

export type ClearDataResourceFromIndexOutput = {
  __typename?: 'ClearDataResourceFromIndexOutput';
  dataResourceId: Scalars['ID']['output'];
  indexId: Scalars['ID']['output'];
};

export type DataResource = {
  __typename?: 'DataResource';
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name?: Maybe<Scalars['String']['output']>;
};

export type DataResourceCount = {
  __typename?: 'DataResourceCount';
  count: Scalars['Int']['output'];
  dataResourceId: Scalars['ID']['output'];
};

export type DataResourceEvent = {
  __typename?: 'DataResourceEvent';
  dataResourceId: Scalars['ID']['output'];
  event: Scalars['String']['output'];
  executionId: Scalars['ID']['output'];
  lastUpdated: Scalars['String']['output'];
  rootPipelineId: Scalars['ID']['output'];
  timestamp: Scalars['String']['output'];
};

export type DataResourceHistoryInput = {
  dataResourceId: Scalars['ID']['input'];
};

export type DataResourceHistoryOutput = {
  __typename?: 'DataResourceHistoryOutput';
  events: Array<DataResourceEvent>;
};

export type DataResourceProgress = {
  __typename?: 'DataResourceProgress';
  dataResource?: Maybe<DataResource>;
  startedAt?: Maybe<Scalars['String']['output']>;
  state: DataResourceProgressState;
  step: DataResourceProgressStep;
  stoppedAt?: Maybe<Scalars['String']['output']>;
};

export enum DataResourceProgressState {
  Completed = 'COMPLETED',
  Failed = 'FAILED',
  Queued = 'QUEUED',
  Running = 'RUNNING'
}

export enum DataResourceProgressStep {
  Download = 'DOWNLOAD',
  Index = 'INDEX',
  Sample = 'SAMPLE',
  Solr = 'SOLR'
}

export type DeleteIndexInput = {
  indexId: Scalars['ID']['input'];
};

export type DeleteIndexOutput = {
  __typename?: 'DeleteIndexOutput';
  indexId: Scalars['ID']['output'];
};

export type GetOrCreateIndexInput = {
  indexId: Scalars['ID']['input'];
};

export type GetOrCreateIndexOutput = {
  __typename?: 'GetOrCreateIndexOutput';
  indexId: Scalars['ID']['output'];
};

export type Index = {
  __typename?: 'Index';
  active?: Maybe<Scalars['Boolean']['output']>;
  counts?: Maybe<IndexCounts>;
  id: Scalars['ID']['output'];
};

export type IndexCounts = {
  __typename?: 'IndexCounts';
  dataResourceCounts: Array<DataResourceCount>;
  total: Scalars['Int']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  cancelPipeline: CancelPipelineOutput;
  clearDataResourceFromIndex: ClearDataResourceFromIndexOutput;
  deleteIndex: DeleteIndexOutput;
  getOrCreateIndex: GetOrCreateIndexOutput;
  setActiveIndex: SetActiveIndexOutput;
  startPipeline: StartPipelineOutput;
};


export type MutationCancelPipelineArgs = {
  input: CancelPipelineInput;
};


export type MutationClearDataResourceFromIndexArgs = {
  input: ClearDataResourceFromIndexInput;
};


export type MutationDeleteIndexArgs = {
  input: DeleteIndexInput;
};


export type MutationGetOrCreateIndexArgs = {
  input: GetOrCreateIndexInput;
};


export type MutationSetActiveIndexArgs = {
  input: SetActiveIndexInput;
};


export type MutationStartPipelineArgs = {
  input: StartPipelineInput;
};

export type Pipeline = {
  __typename?: 'Pipeline';
  cause?: Maybe<Scalars['String']['output']>;
  error?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  input?: Maybe<Scalars['String']['output']>;
  output?: Maybe<Scalars['String']['output']>;
  progress?: Maybe<PipelineProgress>;
  startedAt?: Maybe<Scalars['Date']['output']>;
  status: PipelineStatus;
  stoppedAt?: Maybe<Scalars['Date']['output']>;
};

export type PipelineProgress = {
  __typename?: 'PipelineProgress';
  completed: Scalars['Int']['output'];
  dataResourceProgress: Array<DataResourceProgress>;
  failed: Scalars['Int']['output'];
  stepProgress: Array<PipelineStepProgress>;
  total: Scalars['Int']['output'];
};

export enum PipelineStatus {
  Aborted = 'ABORTED',
  Failed = 'FAILED',
  Running = 'RUNNING',
  Succeeded = 'SUCCEEDED',
  TimedOut = 'TIMED_OUT'
}

export type PipelineStepProgress = {
  __typename?: 'PipelineStepProgress';
  completed: Scalars['Int']['output'];
  failed: Scalars['Int']['output'];
  queued: Scalars['Int']['output'];
  running: Scalars['Int']['output'];
  step: DataResourceProgressStep;
};

export type Query = {
  __typename?: 'Query';
  activeIndex?: Maybe<Index>;
  dataResource?: Maybe<DataResource>;
  dataResourceHistory: DataResourceHistoryOutput;
  dataResources: Array<DataResource>;
  index?: Maybe<Index>;
  indices: Array<Index>;
  pipeline?: Maybe<Pipeline>;
  pipelines: Array<Pipeline>;
};


export type QueryDataResourceArgs = {
  id: Scalars['ID']['input'];
};


export type QueryDataResourceHistoryArgs = {
  input: DataResourceHistoryInput;
};


export type QueryIndexArgs = {
  id: Scalars['ID']['input'];
};


export type QueryPipelineArgs = {
  id: Scalars['ID']['input'];
};


export type QueryPipelinesArgs = {
  status?: InputMaybe<PipelineStatus>;
};

export type SetActiveIndexInput = {
  indexId: Scalars['ID']['input'];
};

export type SetActiveIndexOutput = {
  __typename?: 'SetActiveIndexOutput';
  index: Index;
};

export type StartPipelineInput = {
  dataResourceIds: Array<Scalars['ID']['input']>;
  solrCollection?: InputMaybe<Scalars['String']['input']>;
};

export type StartPipelineOutput = {
  __typename?: 'StartPipelineOutput';
  pipeline: Pipeline;
};

export type GetAllDataResourcesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAllDataResourcesQuery = { __typename?: 'Query', dataResources: Array<{ __typename?: 'DataResource', id: string, name?: string | null }> };

export type GetDataResourceQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetDataResourceQuery = { __typename?: 'Query', dataResource?: { __typename?: 'DataResource', id: string, name?: string | null } | null };

export type GetDataResourceHistoryQueryVariables = Exact<{
  input: DataResourceHistoryInput;
}>;


export type GetDataResourceHistoryQuery = { __typename?: 'Query', dataResourceHistory: { __typename?: 'DataResourceHistoryOutput', events: Array<{ __typename?: 'DataResourceEvent', event: string }> } };

export type GetIndicesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetIndicesQuery = { __typename?: 'Query', indices: Array<{ __typename?: 'Index', id: string, active?: boolean | null, counts?: { __typename?: 'IndexCounts', total: number, dataResourceCounts: Array<{ __typename?: 'DataResourceCount', dataResourceId: string, count: number }> } | null }> };

export type SetActiveIndexMutationVariables = Exact<{
  input: SetActiveIndexInput;
}>;


export type SetActiveIndexMutation = { __typename?: 'Mutation', setActiveIndex: { __typename?: 'SetActiveIndexOutput', index: { __typename?: 'Index', id: string, active?: boolean | null } } };

export type DeleteIndexMutationVariables = Exact<{
  input: DeleteIndexInput;
}>;


export type DeleteIndexMutation = { __typename?: 'Mutation', deleteIndex: { __typename?: 'DeleteIndexOutput', indexId: string } };

export type GetAllPipelinesQueryVariables = Exact<{
  status?: InputMaybe<PipelineStatus>;
}>;


export type GetAllPipelinesQuery = { __typename?: 'Query', pipelines: Array<{ __typename?: 'Pipeline', id: string, status: PipelineStatus, startedAt?: any | null, stoppedAt?: any | null }> };

export type GetPipelineQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetPipelineQuery = { __typename?: 'Query', pipeline?: { __typename?: 'Pipeline', id: string, status: PipelineStatus, startedAt?: any | null, stoppedAt?: any | null, input?: string | null, output?: string | null, error?: string | null, cause?: string | null, progress?: { __typename?: 'PipelineProgress', total: number, completed: number, failed: number, stepProgress: Array<{ __typename?: 'PipelineStepProgress', step: DataResourceProgressStep, queued: number, running: number, completed: number, failed: number }> } | null } | null };

export type StartPipelineMutationVariables = Exact<{
  input: StartPipelineInput;
}>;


export type StartPipelineMutation = { __typename?: 'Mutation', startPipeline: { __typename?: 'StartPipelineOutput', pipeline: { __typename?: 'Pipeline', id: string, status: PipelineStatus, startedAt?: any | null, stoppedAt?: any | null, input?: string | null, output?: string | null, error?: string | null, cause?: string | null } } };

export type CancelPipelineMutationVariables = Exact<{
  input: CancelPipelineInput;
}>;


export type CancelPipelineMutation = { __typename?: 'Mutation', cancelPipeline: { __typename?: 'CancelPipelineOutput', pipeline: { __typename?: 'Pipeline', id: string, status: PipelineStatus, startedAt?: any | null, stoppedAt?: any | null, input?: string | null, output?: string | null, error?: string | null, cause?: string | null } } };

export type GetPipelineProgressQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetPipelineProgressQuery = { __typename?: 'Query', pipeline?: { __typename?: 'Pipeline', id: string, progress?: { __typename?: 'PipelineProgress', total: number, completed: number, failed: number, stepProgress: Array<{ __typename?: 'PipelineStepProgress', step: DataResourceProgressStep, queued: number, running: number, completed: number, failed: number }>, dataResourceProgress: Array<{ __typename?: 'DataResourceProgress', state: DataResourceProgressState, startedAt?: string | null, stoppedAt?: string | null, dataResource?: { __typename?: 'DataResource', id: string, name?: string | null } | null }> } | null } | null };


export const GetAllDataResourcesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetAllDataResources"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"dataResources"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<GetAllDataResourcesQuery, GetAllDataResourcesQueryVariables>;
export const GetDataResourceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetDataResource"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"dataResource"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<GetDataResourceQuery, GetDataResourceQueryVariables>;
export const GetDataResourceHistoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetDataResourceHistory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DataResourceHistoryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"dataResourceHistory"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"events"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"event"}}]}}]}}]}}]} as unknown as DocumentNode<GetDataResourceHistoryQuery, GetDataResourceHistoryQueryVariables>;
export const GetIndicesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetIndices"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"indices"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"active"}},{"kind":"Field","name":{"kind":"Name","value":"counts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"dataResourceCounts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"dataResourceId"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetIndicesQuery, GetIndicesQueryVariables>;
export const SetActiveIndexDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetActiveIndex"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SetActiveIndexInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setActiveIndex"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"index"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"active"}}]}}]}}]}}]} as unknown as DocumentNode<SetActiveIndexMutation, SetActiveIndexMutationVariables>;
export const DeleteIndexDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteIndex"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DeleteIndexInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteIndex"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"indexId"}}]}}]}}]} as unknown as DocumentNode<DeleteIndexMutation, DeleteIndexMutationVariables>;
export const GetAllPipelinesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetAllPipelines"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"status"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"PipelineStatus"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pipelines"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"Variable","name":{"kind":"Name","value":"status"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"startedAt"}},{"kind":"Field","name":{"kind":"Name","value":"stoppedAt"}}]}}]}}]} as unknown as DocumentNode<GetAllPipelinesQuery, GetAllPipelinesQueryVariables>;
export const GetPipelineDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetPipeline"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pipeline"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"startedAt"}},{"kind":"Field","name":{"kind":"Name","value":"stoppedAt"}},{"kind":"Field","name":{"kind":"Name","value":"input"}},{"kind":"Field","name":{"kind":"Name","value":"output"}},{"kind":"Field","name":{"kind":"Name","value":"error"}},{"kind":"Field","name":{"kind":"Name","value":"cause"}},{"kind":"Field","name":{"kind":"Name","value":"progress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"completed"}},{"kind":"Field","name":{"kind":"Name","value":"failed"}},{"kind":"Field","name":{"kind":"Name","value":"stepProgress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"step"}},{"kind":"Field","name":{"kind":"Name","value":"queued"}},{"kind":"Field","name":{"kind":"Name","value":"running"}},{"kind":"Field","name":{"kind":"Name","value":"completed"}},{"kind":"Field","name":{"kind":"Name","value":"failed"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetPipelineQuery, GetPipelineQueryVariables>;
export const StartPipelineDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"StartPipeline"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"StartPipelineInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"startPipeline"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pipeline"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"startedAt"}},{"kind":"Field","name":{"kind":"Name","value":"stoppedAt"}},{"kind":"Field","name":{"kind":"Name","value":"input"}},{"kind":"Field","name":{"kind":"Name","value":"output"}},{"kind":"Field","name":{"kind":"Name","value":"error"}},{"kind":"Field","name":{"kind":"Name","value":"cause"}}]}}]}}]}}]} as unknown as DocumentNode<StartPipelineMutation, StartPipelineMutationVariables>;
export const CancelPipelineDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CancelPipeline"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CancelPipelineInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cancelPipeline"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pipeline"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"startedAt"}},{"kind":"Field","name":{"kind":"Name","value":"stoppedAt"}},{"kind":"Field","name":{"kind":"Name","value":"input"}},{"kind":"Field","name":{"kind":"Name","value":"output"}},{"kind":"Field","name":{"kind":"Name","value":"error"}},{"kind":"Field","name":{"kind":"Name","value":"cause"}}]}}]}}]}}]} as unknown as DocumentNode<CancelPipelineMutation, CancelPipelineMutationVariables>;
export const GetPipelineProgressDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetPipelineProgress"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pipeline"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"progress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"completed"}},{"kind":"Field","name":{"kind":"Name","value":"failed"}},{"kind":"Field","name":{"kind":"Name","value":"stepProgress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"step"}},{"kind":"Field","name":{"kind":"Name","value":"queued"}},{"kind":"Field","name":{"kind":"Name","value":"running"}},{"kind":"Field","name":{"kind":"Name","value":"completed"}},{"kind":"Field","name":{"kind":"Name","value":"failed"}}]}},{"kind":"Field","name":{"kind":"Name","value":"dataResourceProgress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"dataResource"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"startedAt"}},{"kind":"Field","name":{"kind":"Name","value":"stoppedAt"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetPipelineProgressQuery, GetPipelineProgressQueryVariables>;