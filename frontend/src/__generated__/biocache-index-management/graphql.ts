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
  id: Scalars['ID']['output'];
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
  id: Scalars['ID']['output'];
};

export type Query = {
  __typename?: 'Query';
  activeIndex?: Maybe<Index>;
  dataResourceHistory: DataResourceHistoryOutput;
  index?: Maybe<Index>;
  indices: Array<Index>;
  pipeline?: Maybe<Pipeline>;
  pipelines: Array<Pipeline>;
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

export type SetActiveIndexInput = {
  indexId: Scalars['ID']['input'];
};

export type SetActiveIndexOutput = {
  __typename?: 'SetActiveIndexOutput';
  indexId: Scalars['ID']['output'];
};

export type StartPipelineInput = {
  dataResourceIds: Array<Scalars['ID']['input']>;
  solrCollection?: InputMaybe<Scalars['String']['input']>;
};

export type StartPipelineOutput = {
  __typename?: 'StartPipelineOutput';
  pipeline: Pipeline;
};

export type GetIndicesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetIndicesQuery = { __typename?: 'Query', indices: Array<{ __typename?: 'Index', id: string }> };


export const GetIndicesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetIndices"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"indices"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<GetIndicesQuery, GetIndicesQueryVariables>;