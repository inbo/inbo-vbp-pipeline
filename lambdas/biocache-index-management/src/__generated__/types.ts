import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
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



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;



/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  CancelPipelineInput: CancelPipelineInput;
  CancelPipelineOutput: ResolverTypeWrapper<CancelPipelineOutput>;
  ClearDataResourceFromIndexInput: ClearDataResourceFromIndexInput;
  ClearDataResourceFromIndexOutput: ResolverTypeWrapper<ClearDataResourceFromIndexOutput>;
  DataResource: ResolverTypeWrapper<DataResource>;
  DataResourceCount: ResolverTypeWrapper<DataResourceCount>;
  DataResourceEvent: ResolverTypeWrapper<DataResourceEvent>;
  DataResourceHistoryInput: DataResourceHistoryInput;
  DataResourceHistoryOutput: ResolverTypeWrapper<DataResourceHistoryOutput>;
  DataResourceProgress: ResolverTypeWrapper<DataResourceProgress>;
  DataResourceProgressState: DataResourceProgressState;
  DataResourceProgressStep: DataResourceProgressStep;
  Date: ResolverTypeWrapper<Scalars['Date']['output']>;
  DeleteIndexInput: DeleteIndexInput;
  DeleteIndexOutput: ResolverTypeWrapper<DeleteIndexOutput>;
  GetOrCreateIndexInput: GetOrCreateIndexInput;
  GetOrCreateIndexOutput: ResolverTypeWrapper<GetOrCreateIndexOutput>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Index: ResolverTypeWrapper<Index>;
  IndexCounts: ResolverTypeWrapper<IndexCounts>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  Mutation: ResolverTypeWrapper<{}>;
  Pipeline: ResolverTypeWrapper<Pipeline>;
  PipelineProgress: ResolverTypeWrapper<PipelineProgress>;
  PipelineStatus: PipelineStatus;
  PipelineStepProgress: ResolverTypeWrapper<PipelineStepProgress>;
  Query: ResolverTypeWrapper<{}>;
  SetActiveIndexInput: SetActiveIndexInput;
  SetActiveIndexOutput: ResolverTypeWrapper<SetActiveIndexOutput>;
  StartPipelineInput: StartPipelineInput;
  StartPipelineOutput: ResolverTypeWrapper<StartPipelineOutput>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Boolean: Scalars['Boolean']['output'];
  CancelPipelineInput: CancelPipelineInput;
  CancelPipelineOutput: CancelPipelineOutput;
  ClearDataResourceFromIndexInput: ClearDataResourceFromIndexInput;
  ClearDataResourceFromIndexOutput: ClearDataResourceFromIndexOutput;
  DataResource: DataResource;
  DataResourceCount: DataResourceCount;
  DataResourceEvent: DataResourceEvent;
  DataResourceHistoryInput: DataResourceHistoryInput;
  DataResourceHistoryOutput: DataResourceHistoryOutput;
  DataResourceProgress: DataResourceProgress;
  Date: Scalars['Date']['output'];
  DeleteIndexInput: DeleteIndexInput;
  DeleteIndexOutput: DeleteIndexOutput;
  GetOrCreateIndexInput: GetOrCreateIndexInput;
  GetOrCreateIndexOutput: GetOrCreateIndexOutput;
  ID: Scalars['ID']['output'];
  Index: Index;
  IndexCounts: IndexCounts;
  Int: Scalars['Int']['output'];
  Mutation: {};
  Pipeline: Pipeline;
  PipelineProgress: PipelineProgress;
  PipelineStepProgress: PipelineStepProgress;
  Query: {};
  SetActiveIndexInput: SetActiveIndexInput;
  SetActiveIndexOutput: SetActiveIndexOutput;
  StartPipelineInput: StartPipelineInput;
  StartPipelineOutput: StartPipelineOutput;
  String: Scalars['String']['output'];
};

export type CancelPipelineOutputResolvers<ContextType = any, ParentType extends ResolversParentTypes['CancelPipelineOutput'] = ResolversParentTypes['CancelPipelineOutput']> = {
  pipeline?: Resolver<ResolversTypes['Pipeline'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ClearDataResourceFromIndexOutputResolvers<ContextType = any, ParentType extends ResolversParentTypes['ClearDataResourceFromIndexOutput'] = ResolversParentTypes['ClearDataResourceFromIndexOutput']> = {
  dataResourceId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  indexId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DataResourceResolvers<ContextType = any, ParentType extends ResolversParentTypes['DataResource'] = ResolversParentTypes['DataResource']> = {
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DataResourceCountResolvers<ContextType = any, ParentType extends ResolversParentTypes['DataResourceCount'] = ResolversParentTypes['DataResourceCount']> = {
  count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  dataResourceId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DataResourceEventResolvers<ContextType = any, ParentType extends ResolversParentTypes['DataResourceEvent'] = ResolversParentTypes['DataResourceEvent']> = {
  dataResourceId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  event?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  executionId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lastUpdated?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  rootPipelineId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  timestamp?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DataResourceHistoryOutputResolvers<ContextType = any, ParentType extends ResolversParentTypes['DataResourceHistoryOutput'] = ResolversParentTypes['DataResourceHistoryOutput']> = {
  events?: Resolver<Array<ResolversTypes['DataResourceEvent']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DataResourceProgressResolvers<ContextType = any, ParentType extends ResolversParentTypes['DataResourceProgress'] = ResolversParentTypes['DataResourceProgress']> = {
  dataResource?: Resolver<Maybe<ResolversTypes['DataResource']>, ParentType, ContextType>;
  startedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  state?: Resolver<ResolversTypes['DataResourceProgressState'], ParentType, ContextType>;
  step?: Resolver<ResolversTypes['DataResourceProgressStep'], ParentType, ContextType>;
  stoppedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface DateScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Date'], any> {
  name: 'Date';
}

export type DeleteIndexOutputResolvers<ContextType = any, ParentType extends ResolversParentTypes['DeleteIndexOutput'] = ResolversParentTypes['DeleteIndexOutput']> = {
  indexId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GetOrCreateIndexOutputResolvers<ContextType = any, ParentType extends ResolversParentTypes['GetOrCreateIndexOutput'] = ResolversParentTypes['GetOrCreateIndexOutput']> = {
  indexId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type IndexResolvers<ContextType = any, ParentType extends ResolversParentTypes['Index'] = ResolversParentTypes['Index']> = {
  active?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  counts?: Resolver<Maybe<ResolversTypes['IndexCounts']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type IndexCountsResolvers<ContextType = any, ParentType extends ResolversParentTypes['IndexCounts'] = ResolversParentTypes['IndexCounts']> = {
  dataResourceCounts?: Resolver<Array<ResolversTypes['DataResourceCount']>, ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  cancelPipeline?: Resolver<ResolversTypes['CancelPipelineOutput'], ParentType, ContextType, RequireFields<MutationCancelPipelineArgs, 'input'>>;
  clearDataResourceFromIndex?: Resolver<ResolversTypes['ClearDataResourceFromIndexOutput'], ParentType, ContextType, RequireFields<MutationClearDataResourceFromIndexArgs, 'input'>>;
  deleteIndex?: Resolver<ResolversTypes['DeleteIndexOutput'], ParentType, ContextType, RequireFields<MutationDeleteIndexArgs, 'input'>>;
  getOrCreateIndex?: Resolver<ResolversTypes['GetOrCreateIndexOutput'], ParentType, ContextType, RequireFields<MutationGetOrCreateIndexArgs, 'input'>>;
  setActiveIndex?: Resolver<ResolversTypes['SetActiveIndexOutput'], ParentType, ContextType, RequireFields<MutationSetActiveIndexArgs, 'input'>>;
  startPipeline?: Resolver<ResolversTypes['StartPipelineOutput'], ParentType, ContextType, RequireFields<MutationStartPipelineArgs, 'input'>>;
};

export type PipelineResolvers<ContextType = any, ParentType extends ResolversParentTypes['Pipeline'] = ResolversParentTypes['Pipeline']> = {
  cause?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  error?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  input?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  output?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  progress?: Resolver<Maybe<ResolversTypes['PipelineProgress']>, ParentType, ContextType>;
  startedAt?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['PipelineStatus'], ParentType, ContextType>;
  stoppedAt?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PipelineProgressResolvers<ContextType = any, ParentType extends ResolversParentTypes['PipelineProgress'] = ResolversParentTypes['PipelineProgress']> = {
  completed?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  dataResourceProgress?: Resolver<Array<ResolversTypes['DataResourceProgress']>, ParentType, ContextType>;
  failed?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  stepProgress?: Resolver<Array<ResolversTypes['PipelineStepProgress']>, ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PipelineStepProgressResolvers<ContextType = any, ParentType extends ResolversParentTypes['PipelineStepProgress'] = ResolversParentTypes['PipelineStepProgress']> = {
  completed?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  failed?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  queued?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  running?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  step?: Resolver<ResolversTypes['DataResourceProgressStep'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  activeIndex?: Resolver<Maybe<ResolversTypes['Index']>, ParentType, ContextType>;
  dataResource?: Resolver<Maybe<ResolversTypes['DataResource']>, ParentType, ContextType, RequireFields<QueryDataResourceArgs, 'id'>>;
  dataResourceHistory?: Resolver<ResolversTypes['DataResourceHistoryOutput'], ParentType, ContextType, RequireFields<QueryDataResourceHistoryArgs, 'input'>>;
  dataResources?: Resolver<Array<ResolversTypes['DataResource']>, ParentType, ContextType>;
  index?: Resolver<Maybe<ResolversTypes['Index']>, ParentType, ContextType, RequireFields<QueryIndexArgs, 'id'>>;
  indices?: Resolver<Array<ResolversTypes['Index']>, ParentType, ContextType>;
  pipeline?: Resolver<Maybe<ResolversTypes['Pipeline']>, ParentType, ContextType, RequireFields<QueryPipelineArgs, 'id'>>;
  pipelines?: Resolver<Array<ResolversTypes['Pipeline']>, ParentType, ContextType, Partial<QueryPipelinesArgs>>;
};

export type SetActiveIndexOutputResolvers<ContextType = any, ParentType extends ResolversParentTypes['SetActiveIndexOutput'] = ResolversParentTypes['SetActiveIndexOutput']> = {
  index?: Resolver<ResolversTypes['Index'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type StartPipelineOutputResolvers<ContextType = any, ParentType extends ResolversParentTypes['StartPipelineOutput'] = ResolversParentTypes['StartPipelineOutput']> = {
  pipeline?: Resolver<ResolversTypes['Pipeline'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  CancelPipelineOutput?: CancelPipelineOutputResolvers<ContextType>;
  ClearDataResourceFromIndexOutput?: ClearDataResourceFromIndexOutputResolvers<ContextType>;
  DataResource?: DataResourceResolvers<ContextType>;
  DataResourceCount?: DataResourceCountResolvers<ContextType>;
  DataResourceEvent?: DataResourceEventResolvers<ContextType>;
  DataResourceHistoryOutput?: DataResourceHistoryOutputResolvers<ContextType>;
  DataResourceProgress?: DataResourceProgressResolvers<ContextType>;
  Date?: GraphQLScalarType;
  DeleteIndexOutput?: DeleteIndexOutputResolvers<ContextType>;
  GetOrCreateIndexOutput?: GetOrCreateIndexOutputResolvers<ContextType>;
  Index?: IndexResolvers<ContextType>;
  IndexCounts?: IndexCountsResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Pipeline?: PipelineResolvers<ContextType>;
  PipelineProgress?: PipelineProgressResolvers<ContextType>;
  PipelineStepProgress?: PipelineStepProgressResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  SetActiveIndexOutput?: SetActiveIndexOutputResolvers<ContextType>;
  StartPipelineOutput?: StartPipelineOutputResolvers<ContextType>;
};

