export type Index = {
    id: string;
};

export type IndexDetails = {
    totalCount: number;
    dataResourceCounts: { [dataResourceId: string]: number };
} & Index;

export type IndexService = {
    getIndex(id: string): Promise<IndexDetails | null>;
    getIndices(): Promise<Index[]>;

    createIndex(id: string): Promise<Index>;
    deleteIndex(id: string): Promise<void>;

    getActiveIndex(): Promise<Index | null>;
    setActiveIndex(id: string): Promise<void>;

    deleteDataResourceOccurrencesFromIndex(
        indexId: string,
        dataResourceId: string,
    ): Promise<void>;
};
