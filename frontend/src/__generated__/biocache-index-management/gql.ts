/* eslint-disable */
import * as types from './graphql';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  query GetAllDataResources {\n    dataResources {\n      id\n      name\n    }\n  }\n": typeof types.GetAllDataResourcesDocument,
    "\n  query GetDataResource($id: ID!) {\n    dataResource(id: $id) {\n      id\n      name\n    }\n  }\n": typeof types.GetDataResourceDocument,
    "\n  query GetDataResourceHistory($input: DataResourceHistoryInput!) {\n    dataResourceHistory(input: $input) {\n      events {\n        event\n      }\n    }\n  }\n": typeof types.GetDataResourceHistoryDocument,
    "\n  query GetIndices {\n    indices {\n      id\n      active\n      counts {\n        total\n        dataResourceCounts {\n          dataResourceId\n          count\n        }\n      }\n    }\n  }\n": typeof types.GetIndicesDocument,
    "\n  mutation SetActiveIndex($input: SetActiveIndexInput!) {\n    setActiveIndex(input: $input) {\n      index {\n        id\n        active\n      }\n    }\n  }\n": typeof types.SetActiveIndexDocument,
    "\n  mutation DeleteIndex($input: DeleteIndexInput!) {\n    deleteIndex(input: $input) {\n      indexId\n    }\n  }\n": typeof types.DeleteIndexDocument,
    "\n  query GetAllPipelines {\n    pipelines {\n      id\n      status\n      startedAt\n      stoppedAt\n      \n    }\n  }\n": typeof types.GetAllPipelinesDocument,
    "\n  query GetPipeline($id: ID!) {\n    pipeline(id: $id) {\n      id\n      status\n      startedAt\n      stoppedAt\n      input\n      output\n      error\n      cause\n    }\n  }\n": typeof types.GetPipelineDocument,
    "\n  mutation StartPipeline($input: StartPipelineInput!) {\n    startPipeline(input: $input) {\n      pipeline {\n      id\n      status\n      startedAt\n      stoppedAt\n      input\n      output\n      error\n      cause\n      }\n    }\n  }\n": typeof types.StartPipelineDocument,
    "\n  mutation CancelPipeline($input: CancelPipelineInput!) {\n    cancelPipeline(input: $input) {\n      pipeline {\n      id\n      status\n      startedAt\n      stoppedAt\n      input\n      output\n      error\n      cause\n      }\n    }\n  }\n": typeof types.CancelPipelineDocument,
};
const documents: Documents = {
    "\n  query GetAllDataResources {\n    dataResources {\n      id\n      name\n    }\n  }\n": types.GetAllDataResourcesDocument,
    "\n  query GetDataResource($id: ID!) {\n    dataResource(id: $id) {\n      id\n      name\n    }\n  }\n": types.GetDataResourceDocument,
    "\n  query GetDataResourceHistory($input: DataResourceHistoryInput!) {\n    dataResourceHistory(input: $input) {\n      events {\n        event\n      }\n    }\n  }\n": types.GetDataResourceHistoryDocument,
    "\n  query GetIndices {\n    indices {\n      id\n      active\n      counts {\n        total\n        dataResourceCounts {\n          dataResourceId\n          count\n        }\n      }\n    }\n  }\n": types.GetIndicesDocument,
    "\n  mutation SetActiveIndex($input: SetActiveIndexInput!) {\n    setActiveIndex(input: $input) {\n      index {\n        id\n        active\n      }\n    }\n  }\n": types.SetActiveIndexDocument,
    "\n  mutation DeleteIndex($input: DeleteIndexInput!) {\n    deleteIndex(input: $input) {\n      indexId\n    }\n  }\n": types.DeleteIndexDocument,
    "\n  query GetAllPipelines {\n    pipelines {\n      id\n      status\n      startedAt\n      stoppedAt\n      \n    }\n  }\n": types.GetAllPipelinesDocument,
    "\n  query GetPipeline($id: ID!) {\n    pipeline(id: $id) {\n      id\n      status\n      startedAt\n      stoppedAt\n      input\n      output\n      error\n      cause\n    }\n  }\n": types.GetPipelineDocument,
    "\n  mutation StartPipeline($input: StartPipelineInput!) {\n    startPipeline(input: $input) {\n      pipeline {\n      id\n      status\n      startedAt\n      stoppedAt\n      input\n      output\n      error\n      cause\n      }\n    }\n  }\n": types.StartPipelineDocument,
    "\n  mutation CancelPipeline($input: CancelPipelineInput!) {\n    cancelPipeline(input: $input) {\n      pipeline {\n      id\n      status\n      startedAt\n      stoppedAt\n      input\n      output\n      error\n      cause\n      }\n    }\n  }\n": types.CancelPipelineDocument,
};

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = gql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function gql(source: string): unknown;

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetAllDataResources {\n    dataResources {\n      id\n      name\n    }\n  }\n"): (typeof documents)["\n  query GetAllDataResources {\n    dataResources {\n      id\n      name\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetDataResource($id: ID!) {\n    dataResource(id: $id) {\n      id\n      name\n    }\n  }\n"): (typeof documents)["\n  query GetDataResource($id: ID!) {\n    dataResource(id: $id) {\n      id\n      name\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetDataResourceHistory($input: DataResourceHistoryInput!) {\n    dataResourceHistory(input: $input) {\n      events {\n        event\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetDataResourceHistory($input: DataResourceHistoryInput!) {\n    dataResourceHistory(input: $input) {\n      events {\n        event\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetIndices {\n    indices {\n      id\n      active\n      counts {\n        total\n        dataResourceCounts {\n          dataResourceId\n          count\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetIndices {\n    indices {\n      id\n      active\n      counts {\n        total\n        dataResourceCounts {\n          dataResourceId\n          count\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation SetActiveIndex($input: SetActiveIndexInput!) {\n    setActiveIndex(input: $input) {\n      index {\n        id\n        active\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation SetActiveIndex($input: SetActiveIndexInput!) {\n    setActiveIndex(input: $input) {\n      index {\n        id\n        active\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation DeleteIndex($input: DeleteIndexInput!) {\n    deleteIndex(input: $input) {\n      indexId\n    }\n  }\n"): (typeof documents)["\n  mutation DeleteIndex($input: DeleteIndexInput!) {\n    deleteIndex(input: $input) {\n      indexId\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetAllPipelines {\n    pipelines {\n      id\n      status\n      startedAt\n      stoppedAt\n      \n    }\n  }\n"): (typeof documents)["\n  query GetAllPipelines {\n    pipelines {\n      id\n      status\n      startedAt\n      stoppedAt\n      \n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetPipeline($id: ID!) {\n    pipeline(id: $id) {\n      id\n      status\n      startedAt\n      stoppedAt\n      input\n      output\n      error\n      cause\n    }\n  }\n"): (typeof documents)["\n  query GetPipeline($id: ID!) {\n    pipeline(id: $id) {\n      id\n      status\n      startedAt\n      stoppedAt\n      input\n      output\n      error\n      cause\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation StartPipeline($input: StartPipelineInput!) {\n    startPipeline(input: $input) {\n      pipeline {\n      id\n      status\n      startedAt\n      stoppedAt\n      input\n      output\n      error\n      cause\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation StartPipeline($input: StartPipelineInput!) {\n    startPipeline(input: $input) {\n      pipeline {\n      id\n      status\n      startedAt\n      stoppedAt\n      input\n      output\n      error\n      cause\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation CancelPipeline($input: CancelPipelineInput!) {\n    cancelPipeline(input: $input) {\n      pipeline {\n      id\n      status\n      startedAt\n      stoppedAt\n      input\n      output\n      error\n      cause\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation CancelPipeline($input: CancelPipelineInput!) {\n    cancelPipeline(input: $input) {\n      pipeline {\n      id\n      status\n      startedAt\n      stoppedAt\n      input\n      output\n      error\n      cause\n      }\n    }\n  }\n"];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;