import {
    IndexResolvers,
    MutationResolvers,
    QueryResolvers,
} from "../__generated__/types";
import config from "../config";
import { SolrClient } from "../solr/solr";

const solrClient = new SolrClient(config);

export const IndexQuery: QueryResolvers = {
    index: async (_, { id }) => {
        return solrClient.getIndex(id);
    },
    indices: async () => {
        return solrClient.getIndices();
    },
    activeIndex: async () => {
        return solrClient.getActiveIndex();
    },
};

export const IndexMutation: MutationResolvers = {
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
            indexId: input.indexId,
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
