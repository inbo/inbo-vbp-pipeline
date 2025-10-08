import "../styles/StartPipelines.css";

import { useMutation, useQuery } from "@apollo/client/react";
import { GET_INDICES } from "../graphql/indices";
import DataResourceList from "../components/DataResourceList";
import { PIPELINE_FRAGMENT, START_PIPELINE } from "../graphql/pipelines";
import { useCallback } from "react";
import { useNavigate } from "react-router";
import {
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
} from "@mui/material";
import { Spinner } from "../components/Spinner";
import { Checkbox } from "@mui/material";

export function StartPipeline() {
    const { data: indicesData, loading: indicesLoading } = useQuery(
        GET_INDICES,
    );
    const [startPipeline, { loading, error }] = useMutation(
        START_PIPELINE,
        {
            update(cache, { data }) {
                cache.modify({
                    fields: {
                        pipelines(existingPipelines = []) {
                            if (data?.startPipeline?.pipeline) {
                                const newPipelineRef = cache.writeFragment({
                                    data: data.startPipeline.pipeline,
                                    fragment: PIPELINE_FRAGMENT,
                                });
                                return [...existingPipelines, newPipelineRef];
                            } else {
                                return existingPipelines;
                            }
                        },
                    },
                });
            },
        },
    );
    const navigate = useNavigate();

    const submitForm = useCallback(
        async (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const solrCollection = formData.get("index") as string;
            const dataResourceIds = formData.getAll(
                "data-resource",
            ) as string[];
            await startPipeline({
                variables: {
                    input: {
                        solrCollection,
                        dataResourceIds,
                        resetAllData: formData.get("reset-all-data")
                            ? true
                            : false,
                        forceDownload: formData.get("force-download")
                            ? true
                            : false,
                        forceIndex: formData.get("force-index") ? true : false,
                        forceSample: formData.get("force-sample")
                            ? true
                            : false,
                        forceSolr: formData.get("force-solr") ? true : false,
                    },
                },
            });
            navigate("/");
        },
        [startPipeline],
    );

    if (loading) return <Spinner />;
    if (error) return <p>Error starting pipeline: {error.message}</p>;

    return (
        <div className="start-pipeline">
            <h2>
                Start a new Pipeline:
            </h2>
            <form
                id="start-pipeline-form"
                className="start-pipeline-form"
                onSubmit={submitForm}
            >
                <div className="start-pipeline-form-section start-pipeline-form-section">
                    {indicesLoading
                        ? (
                            <Spinner className="start-pipeline-form-indices-spinner" />
                        )
                        : (
                            <FormControl>
                                <InputLabel id="start-pipeline-form-indices-select-label">
                                    Index
                                </InputLabel>
                                <Select
                                    name="index"
                                    label="Index"
                                    labelId="start-pipeline-form-indices-select-label"
                                    className="start-pipeline-form-indices-select"
                                    defaultValue={indicesData?.indices.find((
                                        i,
                                    ) => i.active)
                                        ?.id}
                                >
                                    {indicesData?.indices.map((index) => (
                                        <MenuItem
                                            key={index.id}
                                            value={index.id}
                                        >
                                            {index.id}{" "}
                                            {index.active ? " (active)" : ""}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}
                    <div>
                        <Checkbox
                            id="reset-all-data"
                            name="reset-all-data"
                            defaultChecked={false}
                        />
                        <label htmlFor="reset-all-data">
                            Reset all data
                        </label>
                    </div>
                    <div>
                        <Checkbox
                            id="force-download"
                            name="force-download"
                            defaultChecked={false}
                        />
                        <label htmlFor="force-download">
                            Do not skip downloading
                        </label>
                    </div>
                    <div>
                        <Checkbox
                            id="force-index"
                            name="force-index"
                            defaultChecked={false}
                        />
                        <label htmlFor="force-index">
                            Do not skip indexing
                        </label>
                    </div>
                    <div>
                        <Checkbox
                            id="force-sample"
                            name="force-sample"
                            defaultChecked={false}
                        />
                        <label htmlFor="force-sample">
                            Do not skip sampling
                        </label>
                    </div>
                    <div>
                        <Checkbox
                            id="force-solr"
                            name="force-solr"
                            defaultChecked={false}
                        />
                        <label htmlFor="force-solr">Do not skip solr</label>
                    </div>

                    <Button
                        variant="contained"
                        type="submit"
                        className="start-pipeline-form-submit-button"
                    >
                        Start
                    </Button>
                </div>

                <DataResourceList className="start-pipeline-form-section" />
            </form>
        </div>
    );
}
