import { useMutation, useQuery } from "@apollo/client/react";
import {
    DELETE_INDEX,
    GET_INDICES,
    SET_ACTIVE_INDEX,
} from "../graphql/indices";
import { useState } from "react";
import type { Reference } from "@apollo/client";
import type { MutationUpdaterFunction } from "@apollo/client";
import type { ApolloCache } from "@apollo/client";
import type {
    DeleteIndexInput,
    DeleteIndexMutation,
    Exact,
    SetActiveIndexInput,
    SetActiveIndexMutation,
} from "../__generated__/biocache-index-management/graphql";
import { Spinner } from "./Spinner";
import { Button } from "@mui/material";

export function IndexList() {
    const { data: IndexListData, loading, error } = useQuery(GET_INDICES);
    const [operatedOnIndex, setOperatedOnIndex] = useState<
        string | undefined
    >();

    const [
        setActiveIndex,
        {
            loading: setActiveIndexLoading,
        },
    ] = useMutation(
        SET_ACTIVE_INDEX,
        {
            update: updateActiveIndexLocally,
        },
    );
    const [
        deleteIndex,
        {
            loading: deleteIndexLoading,
        },
    ] = useMutation(
        DELETE_INDEX,
        {
            update: deleteIndexLocally,
        },
    );

    if (loading) return <Spinner />;
    if (error) return <p>Error loading indices: {error.message}</p>;

    return (
        <ul>
            {IndexListData?.indices.map((index) => (
                <li key={index.id}>
                    {index.id}[{index.counts?.total}]{" "}
                    {index.active ? " (active)" : " (inactive)"}
                    {!index.active && (
                        <>
                            <Button
                                variant="outlined"
                                onClick={() => {
                                    setOperatedOnIndex(index.id);
                                    setActiveIndex({
                                        variables: {
                                            input: { indexId: index.id },
                                        },
                                    });
                                }}
                                disabled={(setActiveIndexLoading ||
                                    deleteIndexLoading) &&
                                    operatedOnIndex === index.id}
                            >
                                {setActiveIndexLoading &&
                                        operatedOnIndex === index.id
                                    ? "Activating..."
                                    : "Activate"}
                            </Button>
                            <Button
                                variant="outlined"
                                color="error"
                                onClick={() => {
                                    setOperatedOnIndex(index.id);
                                    deleteIndex({
                                        variables: {
                                            input: { indexId: index.id },
                                        },
                                    });
                                }}
                                disabled={(setActiveIndexLoading ||
                                    deleteIndexLoading) &&
                                    operatedOnIndex === index.id}
                            >
                                {deleteIndexLoading &&
                                        operatedOnIndex === index.id
                                    ? "Deleting..."
                                    : "Delete"}
                            </Button>
                        </>
                    )}
                </li>
            ))}
        </ul>
    );
}

const updateActiveIndexLocally: MutationUpdaterFunction<
    SetActiveIndexMutation,
    Exact<{
        input: SetActiveIndexInput;
    }>,
    ApolloCache
> = (cache, { data }) => {
    const index = data?.setActiveIndex.index;
    if (index) {
        cache.modify({
            fields: {
                indices(existingIndices = [], { readField }) {
                    // Set the active field of the selected index to true
                    cache.modify({
                        id: cache.identify(index),
                        fields: {
                            active: () => true,
                        },
                    });

                    // Set the active field of the previously active index to false
                    const oldActiveIndex = existingIndices.find(
                        (ref: Reference) => readField("active", ref) === true,
                    );
                    if (oldActiveIndex) {
                        cache.modify({
                            id: cache.identify(oldActiveIndex),
                            fields: {
                                active: () => false,
                            },
                        });
                    }
                },
            },
        });
    }
};

const deleteIndexLocally: MutationUpdaterFunction<
    DeleteIndexMutation,
    Exact<{
        input: DeleteIndexInput;
    }>,
    ApolloCache
> = (cache, { data }) => {
    const indexId = data?.deleteIndex.indexId;
    if (indexId) {
        const normalizedId = cache.identify({
            __typename: "Index",
            id: indexId,
        });
        cache.evict({ id: normalizedId });
        cache.gc();
    }
};
