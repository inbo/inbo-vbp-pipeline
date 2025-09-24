import {
    DataResourceProgressResolvers,
    DataResourceProgressState,
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

export const DataResourceProgressQuery: DataResourceProgressResolvers = {
    dataResource: async (parent, _args, _context, info) => {
        if (
            info.fieldNodes.find((field) =>
                field.name.value !== "id" && field.name.value !== "name"
            ) !== null
        ) {
            return await dataResourceService.getDataResource(
                parent.dataResource!.id,
            );
        } else {
            return await Query.dataResources!({}, {}, _context, info)
                .find(
                    (dr) => dr.id === parent.dataResource!.id,
                ) || null;
        }
    },
};

export default {
    Query: Query,
    DataResourceProgress: DataResourceProgress,
};
