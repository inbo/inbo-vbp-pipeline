export type DataResource = {
    id: string;
    name: string;
};

export type DataResourceDetails = {
    id: string;
    name: string;
};

export type DataResourceProcessingState = {
    downloadedAt?: string;
    downloadedBy?: string;
    downloadUrl?: string;
    downloadFileSize?: number;
    downloadFileHash?: string;
    indexedAt?: string;
    indexedBy?: string;
    sampledAt?: string;
    sampledBy?: string;
    sampledLayers?: [string];
    uploadedAt?: string;
    uploadedBy?: string;
    uploadedTo?: [string];
};

export type DataResourceRepository = {
    getDataResources(): Promise<DataResource[]>;
    getDataResource(dataResourceId: string): Promise<DataResourceDetails>;
};
