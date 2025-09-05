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

export type Collection = {
  __typename?: 'Collection';
  id: Scalars['ID']['output'];
};

export type CreateCollectionInput = {
  collectionId: Scalars['ID']['input'];
};

export type CreateCollectionOutput = {
  __typename?: 'CreateCollectionOutput';
  collectionId: Scalars['ID']['output'];
};

export type DeleteCollectionInput = {
  collectionId: Scalars['ID']['input'];
};

export type DeleteCollectionOutput = {
  __typename?: 'DeleteCollectionOutput';
  collectionId: Scalars['ID']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  clearDataResourceFromCollection?: Maybe<ClearDataResourceFromCollectionOutput>;
  createCollection?: Maybe<CreateCollectionOutput>;
  deleteCollection?: Maybe<DeleteCollectionOutput>;
};


export type MutationClearDataResourceFromCollectionArgs = {
  input: ClearDataResourceFromCollectionInput;
};


export type MutationCreateCollectionArgs = {
  input: CreateCollectionInput;
};


export type MutationDeleteCollectionArgs = {
  input: DeleteCollectionInput;
};

export type Query = {
  __typename?: 'Query';
  collection?: Maybe<Collection>;
  collections: Array<Collection>;
};


export type QueryCollectionArgs = {
  id: Scalars['ID']['input'];
};

export type ClearDataResourceFromCollectionInput = {
  collectionId: Scalars['ID']['input'];
  dataResourceId: Scalars['ID']['input'];
};

export type ClearDataResourceFromCollectionOutput = {
  __typename?: 'clearDataResourceFromCollectionOutput';
  collectionId: Scalars['ID']['output'];
  dataResourceId: Scalars['ID']['output'];
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
  Collection: ResolverTypeWrapper<Collection>;
  CreateCollectionInput: CreateCollectionInput;
  CreateCollectionOutput: ResolverTypeWrapper<CreateCollectionOutput>;
  DeleteCollectionInput: DeleteCollectionInput;
  DeleteCollectionOutput: ResolverTypeWrapper<DeleteCollectionOutput>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Mutation: ResolverTypeWrapper<{}>;
  Query: ResolverTypeWrapper<{}>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  clearDataResourceFromCollectionInput: ClearDataResourceFromCollectionInput;
  clearDataResourceFromCollectionOutput: ResolverTypeWrapper<ClearDataResourceFromCollectionOutput>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Boolean: Scalars['Boolean']['output'];
  Collection: Collection;
  CreateCollectionInput: CreateCollectionInput;
  CreateCollectionOutput: CreateCollectionOutput;
  DeleteCollectionInput: DeleteCollectionInput;
  DeleteCollectionOutput: DeleteCollectionOutput;
  ID: Scalars['ID']['output'];
  Mutation: {};
  Query: {};
  String: Scalars['String']['output'];
  clearDataResourceFromCollectionInput: ClearDataResourceFromCollectionInput;
  clearDataResourceFromCollectionOutput: ClearDataResourceFromCollectionOutput;
};

export type CollectionResolvers<ContextType = any, ParentType extends ResolversParentTypes['Collection'] = ResolversParentTypes['Collection']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CreateCollectionOutputResolvers<ContextType = any, ParentType extends ResolversParentTypes['CreateCollectionOutput'] = ResolversParentTypes['CreateCollectionOutput']> = {
  collectionId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DeleteCollectionOutputResolvers<ContextType = any, ParentType extends ResolversParentTypes['DeleteCollectionOutput'] = ResolversParentTypes['DeleteCollectionOutput']> = {
  collectionId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  clearDataResourceFromCollection?: Resolver<Maybe<ResolversTypes['clearDataResourceFromCollectionOutput']>, ParentType, ContextType, RequireFields<MutationClearDataResourceFromCollectionArgs, 'input'>>;
  createCollection?: Resolver<Maybe<ResolversTypes['CreateCollectionOutput']>, ParentType, ContextType, RequireFields<MutationCreateCollectionArgs, 'input'>>;
  deleteCollection?: Resolver<Maybe<ResolversTypes['DeleteCollectionOutput']>, ParentType, ContextType, RequireFields<MutationDeleteCollectionArgs, 'input'>>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  collection?: Resolver<Maybe<ResolversTypes['Collection']>, ParentType, ContextType, RequireFields<QueryCollectionArgs, 'id'>>;
  collections?: Resolver<Array<ResolversTypes['Collection']>, ParentType, ContextType>;
};

export type ClearDataResourceFromCollectionOutputResolvers<ContextType = any, ParentType extends ResolversParentTypes['clearDataResourceFromCollectionOutput'] = ResolversParentTypes['clearDataResourceFromCollectionOutput']> = {
  collectionId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  dataResourceId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  Collection?: CollectionResolvers<ContextType>;
  CreateCollectionOutput?: CreateCollectionOutputResolvers<ContextType>;
  DeleteCollectionOutput?: DeleteCollectionOutputResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  clearDataResourceFromCollectionOutput?: ClearDataResourceFromCollectionOutputResolvers<ContextType>;
};

