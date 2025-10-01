import { useMutation, useQuery } from "@apollo/client/react";
import { GET_INDICES } from "../graphql/indices";
import DataResourceList from "../components/DataResourceList";
import { PIPELINE_FRAGMENT, START_PIPELINE } from "../graphql/pipelines";
import { useCallback } from "react";
import { useNavigate } from "react-router";
import { Button, MenuItem, Select } from "@mui/material";
import { Spinner } from "../components/Spinner";

export function StartPipeline() {
    const { data: indicesData } = useQuery(GET_INDICES);
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
        <div id="start-pipeline">
            <h2>Start a new Pipeline:</h2>
            <form onSubmit={submitForm}>
                <Button variant="contained" type="submit">
                    Start Pipeline
                </Button>

                <div>
                    <label htmlFor="index">Select Index:</label>
                    <Select
                        name="index"
                        defaultValue={indicesData?.indices.find((i) => i.active)
                            ?.id}
                    >
                        {indicesData?.indices.map((index) => (
                            <MenuItem
                                key={index.id}
                                value={index.id}
                            >
                                {index.id} {index.active ? " (active)" : ""}
                            </MenuItem>
                        ))}
                    </Select>
                </div>
                <div>
                    <label htmlFor="reset-all-data">
                        Reset all data
                    </label>
                    <input
                        type="checkbox"
                        id="reset-all-data"
                        name="reset-all-data"
                        defaultChecked={false}
                    />
                </div>
                <div>
                    <label htmlFor="force-download">
                        Do not skip downloading
                    </label>
                    <input
                        type="checkbox"
                        id="force-download"
                        name="force-download"
                        defaultChecked={false}
                    />
                </div>
                <div>
                    <label htmlFor="force-index">Do not skip indexing</label>
                    <input
                        type="checkbox"
                        id="force-index"
                        name="force-index"
                        defaultChecked={false}
                    />
                </div>
                <div>
                    <label htmlFor="force-sample">Do not skip sampling</label>
                    <input
                        type="checkbox"
                        id="force-sample"
                        name="force-sample"
                        defaultChecked={false}
                    />
                </div>
                <div>
                    <label htmlFor="force-solr">Do not skip solr</label>
                    <input
                        type="checkbox"
                        id="force-solr"
                        name="force-solr"
                        defaultChecked={false}
                    />
                </div>
                <DataResourceList />
            </form>
        </div>
    );
}
