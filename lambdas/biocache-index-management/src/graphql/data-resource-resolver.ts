import {
    DataResourceProgressResolvers,
    DataResourceProgressState,
    QueryResolvers,
} from "../__generated__/types";
import { CollectoryClient } from "../ala/collectory";
import config from "../config";

export const dataResourceService = new CollectoryClient(config);

export const Query: QueryResolvers = {
    dataResources: async () => {
        const dataResources = await dataResourceService.getDataResources();
        return dataResources.map((dr) => ({
            id: dr.id,
            name: dr.name,
        }));
    },

    dataResource: async (_, { id }) => {
        const dataResource = await dataResourceService.getDataResource(id);
        return {
            id: dataResource.id,
            name: dataResource.name,
        };
    },
};

export const DataResourceProgress: DataResourceProgressResolvers = {
    dataResource: async (parent) => {
        return dataResourceService.getDataResource(parent!.dataResource!.id);
    },
};

export default {
    Query: Query,
    DataResourceProgress: DataResourceProgress,
};
