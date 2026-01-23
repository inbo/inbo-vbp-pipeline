import "../styles/IndexList.css";

import { useMutation, useQuery } from "@apollo/client/react";
import {
    CREATE_INDEX,
    DELETE_INDEX,
    GET_INDICES,
    SET_ACTIVE_INDEX,
} from "../graphql/indices";
import { useCallback, useMemo, useState } from "react";
import type { Reference } from "@apollo/client";
import type { MutationUpdaterFunction } from "@apollo/client";
import type { ApolloCache } from "@apollo/client";
import type {
    DeleteIndexInput,
    DeleteIndexMutation,
    Exact,
    GetOrCreateIndexInput,
    GetOrCreateIndexMutation,
    SetActiveIndexInput,
    SetActiveIndexMutation,
} from "../__generated__/biocache-index-management/graphql";
import { Spinner } from "./Spinner";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Button,
    InputAdornment,
    TextField,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { AddRounded, Check } from "@mui/icons-material";
import { IndexDataResourceCounts } from "./indexDataResourceCounts";
import DeleteConfirmationDialog from "./deleteConfirmationModal";

export function IndexList() {
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const { data: IndexListData, loading, error } = useQuery(GET_INDICES);
    const [operatedOnIndex, setOperatedOnIndex] = useState<string | undefined>();
    const [createIndexIdValidationError, setCreateIndexIdValidationError] =
        useState<string | undefined>(undefined);

    const [setActiveIndex, { loading: setActiveIndexLoading }] = useMutation(
        SET_ACTIVE_INDEX,
        {
            update: updateActiveIndexLocally,
        },
    );
    const [createIndex, { loading: createIndexLoading }] = useMutation(
        CREATE_INDEX,
        {
            update: createIndexLocally,
        },
    );
    const [deleteIndex, { loading: deleteIndexLoading }] = useMutation(
        DELETE_INDEX,
        {
            update: deleteIndexLocally,
        },
    );

    const validateCreateIndexId = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            if (!/^[a-zA-Z0-9-]+$/.test(value)) {
                setCreateIndexIdValidationError(
                    "Only letters, numbers and hyphens are allowed.",
                );
                return false;
            } else if (
                IndexListData?.indices.some((index) => index.id === `biocache-${value}`)
            ) {
                setCreateIndexIdValidationError(
                    "An index with this ID already exists.",
                );
                return false;
            } else {
                setCreateIndexIdValidationError(undefined);
                return true;
            }
        },
        [IndexListData],
    );

    const submitCreateIndexForm = useCallback(
        (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const inputValue = formData.get("index-id") as string;
            if (inputValue) {
                const indexId = `biocache-${inputValue}`;
                setOperatedOnIndex(indexId);
                createIndex({
                    variables: {
                        input: { indexId },
                    },
                });
            }
        },
        [setOperatedOnIndex, createIndex],
    );

    const defaultIndexId = useMemo(() => {
        const now = new Date();
        const padZero = (value: number) => (value < 10 ? `0${value}` : `${value}`);
        return `${now.getFullYear()}${padZero(now.getMonth() + 1)}${padZero(
            now.getDay(),
        )}`;
    }, []);

    if (loading) return <Spinner />;
    if (error) return <p>Error loading indices: {error.message}</p>;

    return (
        <div className="index-list">
            {IndexListData?.indices.map((index) => (
                <Accordion
                    key={index.id}
                    className={`index-list-item index-list-item-${index.active ? "active" : "inactive"
                        }`}
                    slotProps={{ transition: { unmountOnExit: true } }}
                >
                    <AccordionSummary
                        className="index-list-item-summary"
                        component="div"
                        expandIcon={<ExpandMoreIcon />}
                    >
                        <div className="index-list-item-summary-content">{index.id}</div>
                        {index.active ? (
                            <Check className="index-list-item-summary-active-check" />
                        ) : (
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
                                    disabled={
                                        (setActiveIndexLoading || deleteIndexLoading) &&
                                        operatedOnIndex === index.id
                                    }
                                >
                                    {setActiveIndexLoading && operatedOnIndex === index.id
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
                                    disabled={
                                        (setActiveIndexLoading || deleteIndexLoading) &&
                                        operatedOnIndex === index.id
                                    }
                                >
                                    {deleteIndexLoading && operatedOnIndex === index.id
                                        ? "Deleting..."
                                        : "Delete"}
                                </Button>

                                {showConfirmDelete && (
                                    <DeleteConfirmationDialog
                                        id={index.id}
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
                                        onCancel={() => setShowConfirmDelete(false)}
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
            <Accordion>
                <AccordionDetails>
                    <form
                        className="index-list-item-create-new-index-form"
                        onSubmit={submitCreateIndexForm}
                    >
                        <TextField
                            variant="outlined"
                            label="Create New Index"
                            className="index-list-item-create-new-index-textfield"
                            name="index-id"
                            onChange={validateCreateIndexId}
                            defaultValue={defaultIndexId}
                            helperText={createIndexIdValidationError}
                            disabled={createIndexLoading}
                            error={!!createIndexIdValidationError}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">biocache-</InputAdornment>
                                    ),
                                },
                            }}
                        />
                        <Button
                            variant="outlined"
                            type="submit"
                            disabled={createIndexLoading}
                            className="index-list-item-create-new-index-button"
                        >
                            <AddRounded />
                        </Button>
                    </form>
                </AccordionDetails>
            </Accordion>
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

const createIndexLocally: MutationUpdaterFunction<
    GetOrCreateIndexMutation,
    Exact<{
        input: GetOrCreateIndexInput;
    }>,
    ApolloCache
> = (cache, { data }) => {
    const indexId = data?.getOrCreateIndex.indexId;
    if (indexId) {
        cache.modify({
            fields: {
                indices(existingIndices = []) {
                    return [
                        ...existingIndices,
                        {
                            __typename: "Index",
                            id: indexId,
                            active: false,
                        },
                    ];
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
