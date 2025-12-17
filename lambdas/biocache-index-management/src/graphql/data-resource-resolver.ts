import {
    DataResourceProgressResolvers,
    QueryResolvers,
} from "../__generated__/types";
import { CollectoryClient } from "../ala/collectory";
import config from "../config";
import { DataResource } from "../core/data-resource";

export const dataResourceService = new CollectoryClient(config);

export const Query: QueryResolvers = {
    dataResources: async (_parent, _args, context, _info) => {
        if (!context.dataResources) {
            const dataResources = await dataResourceService.getDataResources();
            context.dataResources = dataResources;
        }

        return (context.dataResources as DataResource[]).map((dr) => ({
            id: dr.id,
            name: dr.name,
        }));
    },

    dataResource: async (_, { id }) => {
        const dataResource = await dataResourceService.getDataResource(id);
        return dataResource && {
            id: dataResource.id,
            name: dataResource.name,
            url: dataResource.url,
            createdAt: dataResource.createdAt,
            checkedAt: dataResource.checkedAt,
            updatedAt: dataResource.updatedAt,
            processedAt: dataResource.processedAt,
            new: dataResource.new,
            updated: dataResource.updated,
        };
    },
};

export const DataResourceProgress: DataResourceProgressResolvers = {
    dataResource: async (parent) => {
        if (parent!.dataResource!.id === "all") {
            return {
                id: "all",
                name: "All Data Resources",
            };
        }
        return dataResourceService.getDataResource(parent!.dataResource!.id);
    },
};

export const DataResourceProgressQuery: DataResourceProgressResolvers = {
    dataResource: async (parent, _args, _context, info) => {
        return await dataResourceService.getDataResource(
            parent.dataResource!.id,
        );
    },
};

export default {
    Query: Query,
    DataResourceProgress: DataResourceProgress,
};
