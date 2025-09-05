export type Index = {
    id: string;
};

export type IndexService = {
    getIndex(id: string): Promise<Index>;
    getIndices(): Promise<Index[]>;

    getOrCreateIndex(id: string): Promise<Index>;
    deleteIndex(id: string): Promise<void>;

    deleteDataResourceOccurrencesFromIndex(
        indexId: string,
        dataResourceId: string,
    ): Promise<void>;
};
