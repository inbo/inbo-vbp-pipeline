export type DataResource = {
    id: string;
    name: string;
};

export type DataResourceDetails = {
    id: string;
    name: string;
};

export type DataResourceRepository = {
    getDataResources(): Promise<DataResource[]>;
    getDataResource(dataResourceId: string): Promise<DataResourceDetails>;
};
