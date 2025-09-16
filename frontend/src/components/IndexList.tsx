import { useMutation, useQuery } from "@apollo/client/react";
import {
    DELETE_INDEX,
    GET_INDICES,
    SET_ACTIVE_INDEX,
} from "../graphql/indices";
import { useState } from "react";
import { gql } from "../__generated__/biocache-index-management";

export function IndexList() {
    const { data: IndexListData } = useQuery(GET_INDICES);
    const [operatedOnIndex, setOperatedOnIndex] = useState<
        string | undefined
    >();

    const [
        setActiveIndex,
        {
            data: setActiveIndexData,
            loading: setActiveIndexLoading,
            error: setActiveIndexError,
        },
    ] = useMutation(
        SET_ACTIVE_INDEX,
        {
            update(cache, { data: { index: { id } } }) {
                cache.modify({
                    fields: {
                        indices(existingIndices = []) {
                            const newIndexRef = cache.modify({
                                id: cache.identify(id),
                                fields: {
                                    active: () => true,
                                },
                            });
                            return [...existingIndices, newIndexRef];
                        },
                    },
                });
            },
        },
    );
    const [
        deleteIndex,
        {
            data: deleteIndexData,
            loading: deleteIndexLoading,
            error: deleteIndexError,
        },
    ] = useMutation(
        DELETE_INDEX,
        {
            update(cache, { data: { indexId } }) {
                cache.modify({
                    fields: {
                        indices(existingIndices = []) {
                            const newIndexRef = cache.removeOptimistic({
                                id: cache.identify(indexId)!,
                            });
                            return [...existingIndices, newIndexRef];
                        },
                    },
                });
            },
        },
    );

    return (
        <ul>
            {IndexListData?.indices.map((index) => (
                <li key={index.id}>
                    {index.id} {index.active ? " (active)" : " (inactive)"}
                    {!index.active && (
                        <>
                            <button
                                className="btn btn-secondary"
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
                            </button>
                            <button
                                className="btn btn-danger"
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
                            </button>
                        </>
                    )}
                </li>
            ))}
        </ul>
    );
}
