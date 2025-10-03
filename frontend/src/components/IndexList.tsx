import "../styles/IndexList.css";

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
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Button,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Check } from "@mui/icons-material";
import { ActionConfirmationModal } from "./ActionConfirmationModal";
import { IndexDataResourceCounts } from "./indexDataResourceCounts";

export function IndexList() {
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
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
        <div className="index-list">
            {IndexListData?.indices.map((index) => (
                <Accordion
                    key={index.id}
                    className={`index-list-item index-list-item-${
                        index.active ? "active" : "inactive"
                    }`}
                >
                    <AccordionSummary
                        className="index-list-item-summary"
                        expandIcon={<ExpandMoreIcon />}
                    >
                        <div className="index-list-item-summary-content">
                            {index.id}
                        </div>
                        {index.active
                            ? (
                                <Check className="index-list-item-summary-active-check" />
                            )
                            : (
                                <div className="index-list-item-summary-buttons">
                                    <Button
                                        variant="outlined"
                                        onClick={() => {
                                            setOperatedOnIndex(index.id);
                                            setActiveIndex({
                                                variables: {
                                                    input: {
                                                        indexId: index.id,
                                                    },
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
                                            setShowConfirmDelete(true);
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

                                    {showConfirmDelete && (
                                        <ActionConfirmationModal
                                            title="Confirm Delete Index"
                                            message="Are you sure you want to delete this index?"
                                            actionLabel={deleteIndexLoading
                                                ? "Cancelling..."
                                                : "Confirm"}
                                            onConfirm={async () => {
                                                await deleteIndex({
                                                    variables: {
                                                        input: {
                                                            indexId: index.id,
                                                        },
                                                    },
                                                });
                                                setShowConfirmDelete(false);
                                            }}
                                            onCancel={() =>
                                                setShowConfirmDelete(false)}
                                        />
                                    )}
                                </div>
                            )}
                    </AccordionSummary>
                    <AccordionDetails className="index-list-item-details">
                        <IndexDataResourceCounts indexId={index.id} />
                    </AccordionDetails>
                </Accordion>
            ))}
        </div>
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
