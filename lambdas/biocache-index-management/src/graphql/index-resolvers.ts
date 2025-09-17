import {
    IndexResolvers,
    MutationResolvers,
    QueryResolvers,
} from "../__generated__/types";
import config from "../config";
import { SolrClient } from "../solr/solr";

const solrClient = new SolrClient(config);

export const Query: QueryResolvers = {
    index: async (_, { id }) => {
        return solrClient.getIndex(id);
    },
    indices: async () => {
        return solrClient.getIndices();
    },
    activeIndex: async (_parent, _args, contextValue, _info) => {
        if (contextValue.activeIndex === undefined) {
            contextValue.activeIndex = await solrClient.getActiveIndex();
        }
        return contextValue.activeIndex;
    },
};

export const IndexQuery: IndexResolvers = {
    active: async (parent, _args, contextValue, _info) => {
        if (contextValue.activeIndex === undefined) {
            contextValue.activeIndex = await solrClient.getActiveIndex();
        }
        if (contextValue.activeIndex === null) {
            return null;
        }

        return contextValue.activeIndex?.id === parent.id;
    },
    counts: async (parent) => {
        const details = await solrClient.getIndex(parent.id);
        return {
            total: details?.totalCount ?? 0,
            dataResourceCounts: Object.entries(
                details?.dataResourceCounts ?? {},
            ).map(
                ([dataResourceId, count]) => ({
                    dataResourceId,
                    count,
                }),
            ),
        };
    },
};

export const Mutation: MutationResolvers = {
    getOrCreateIndex: async (_, { input }) => {
        const index = await solrClient.getIndex(input.indexId);
        if (index) {
            return { indexId: index.id };
        } else {
            const newIndex = await solrClient.createIndex(input.indexId);
            return {
                indexId: newIndex.id,
            };
        }
    },
    deleteIndex: async (_, { input }) => {
        await solrClient.deleteIndex(input.indexId);
        return {
            indexId: input.indexId,
        };
    },

    setActiveIndex: async (_, { input }) => {
        await solrClient.setActiveIndex(input.indexId);
        return {
            index: {
                id: input.indexId,
            },
        };
    },

    clearDataResourceFromIndex: async (
        _,
        { input },
    ) => {
        await solrClient.deleteDataResourceOccurrencesFromIndex(
            input.indexId,
            input.dataResourceId,
        );
        return {
            indexId: input.indexId,
            dataResourceId: input.dataResourceId,
        };
    },
};

export default {
    Query: Query,
    Mutation: Mutation,
    Index: IndexQuery,
};
