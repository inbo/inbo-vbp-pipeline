import { GraphQLResolveInfo } from 'graphql';
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
  clearDataResourceFromIndex: ClearDataResourceFromIndexOutput;
  deleteIndex: DeleteIndexOutput;
  getOrCreateIndex: GetOrCreateIndexOutput;
  setActiveIndex: SetActiveIndexOutput;
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

export type Query = {
  __typename?: 'Query';
  activeIndex?: Maybe<Index>;
  index?: Maybe<Index>;
  indices: Array<Index>;
};


export type QueryIndexArgs = {
  id: Scalars['ID']['input'];
};

export type SetActiveIndexInput = {
  indexId: Scalars['ID']['input'];
};

export type SetActiveIndexOutput = {
  __typename?: 'SetActiveIndexOutput';
  indexId: Scalars['ID']['output'];
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
  ClearDataResourceFromIndexInput: ClearDataResourceFromIndexInput;
  ClearDataResourceFromIndexOutput: ResolverTypeWrapper<ClearDataResourceFromIndexOutput>;
  DeleteIndexInput: DeleteIndexInput;
  DeleteIndexOutput: ResolverTypeWrapper<DeleteIndexOutput>;
  GetOrCreateIndexInput: GetOrCreateIndexInput;
  GetOrCreateIndexOutput: ResolverTypeWrapper<GetOrCreateIndexOutput>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Index: ResolverTypeWrapper<Index>;
  Mutation: ResolverTypeWrapper<{}>;
  Query: ResolverTypeWrapper<{}>;
  SetActiveIndexInput: SetActiveIndexInput;
  SetActiveIndexOutput: ResolverTypeWrapper<SetActiveIndexOutput>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Boolean: Scalars['Boolean']['output'];
  ClearDataResourceFromIndexInput: ClearDataResourceFromIndexInput;
  ClearDataResourceFromIndexOutput: ClearDataResourceFromIndexOutput;
  DeleteIndexInput: DeleteIndexInput;
  DeleteIndexOutput: DeleteIndexOutput;
  GetOrCreateIndexInput: GetOrCreateIndexInput;
  GetOrCreateIndexOutput: GetOrCreateIndexOutput;
  ID: Scalars['ID']['output'];
  Index: Index;
  Mutation: {};
  Query: {};
  SetActiveIndexInput: SetActiveIndexInput;
  SetActiveIndexOutput: SetActiveIndexOutput;
  String: Scalars['String']['output'];
};

export type ClearDataResourceFromIndexOutputResolvers<ContextType = any, ParentType extends ResolversParentTypes['ClearDataResourceFromIndexOutput'] = ResolversParentTypes['ClearDataResourceFromIndexOutput']> = {
  dataResourceId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  indexId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DeleteIndexOutputResolvers<ContextType = any, ParentType extends ResolversParentTypes['DeleteIndexOutput'] = ResolversParentTypes['DeleteIndexOutput']> = {
  indexId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GetOrCreateIndexOutputResolvers<ContextType = any, ParentType extends ResolversParentTypes['GetOrCreateIndexOutput'] = ResolversParentTypes['GetOrCreateIndexOutput']> = {
  indexId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type IndexResolvers<ContextType = any, ParentType extends ResolversParentTypes['Index'] = ResolversParentTypes['Index']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  clearDataResourceFromIndex?: Resolver<ResolversTypes['ClearDataResourceFromIndexOutput'], ParentType, ContextType, RequireFields<MutationClearDataResourceFromIndexArgs, 'input'>>;
  deleteIndex?: Resolver<ResolversTypes['DeleteIndexOutput'], ParentType, ContextType, RequireFields<MutationDeleteIndexArgs, 'input'>>;
  getOrCreateIndex?: Resolver<ResolversTypes['GetOrCreateIndexOutput'], ParentType, ContextType, RequireFields<MutationGetOrCreateIndexArgs, 'input'>>;
  setActiveIndex?: Resolver<ResolversTypes['SetActiveIndexOutput'], ParentType, ContextType, RequireFields<MutationSetActiveIndexArgs, 'input'>>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  activeIndex?: Resolver<Maybe<ResolversTypes['Index']>, ParentType, ContextType>;
  index?: Resolver<Maybe<ResolversTypes['Index']>, ParentType, ContextType, RequireFields<QueryIndexArgs, 'id'>>;
  indices?: Resolver<Array<ResolversTypes['Index']>, ParentType, ContextType>;
};

export type SetActiveIndexOutputResolvers<ContextType = any, ParentType extends ResolversParentTypes['SetActiveIndexOutput'] = ResolversParentTypes['SetActiveIndexOutput']> = {
  indexId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  ClearDataResourceFromIndexOutput?: ClearDataResourceFromIndexOutputResolvers<ContextType>;
  DeleteIndexOutput?: DeleteIndexOutputResolvers<ContextType>;
  GetOrCreateIndexOutput?: GetOrCreateIndexOutputResolvers<ContextType>;
  Index?: IndexResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  SetActiveIndexOutput?: SetActiveIndexOutputResolvers<ContextType>;
};

