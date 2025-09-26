export type PaginationInput = {
    first?: number;
    after?: string;
    last?: number;
    before?: string;
};

export type PaginationOutput<ValueType> = {
    edges: { cursor: string; node: ValueType }[];
    pageInfo: {
        hasNextPage: boolean;
        hasPreviousPage: boolean;
        startCursor?: string;
        endCursor?: string;
    };
};
