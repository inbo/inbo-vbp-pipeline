import { useMutation, useQuery } from "@apollo/client/react";
import { GET_INDICES } from "../graphql/indices";
import DataResourceList from "../components/DataResourceList";
import { START_PIPELINE } from "../graphql/pipelines";
import { useCallback } from "react";
import { useNavigate } from "react-router";
import { Button } from "@mui/material";

export function StartPipeline() {
    const { data: indicesData } = useQuery(GET_INDICES);
    const [startPipeline, { data, loading, error }] = useMutation(
        START_PIPELINE,
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
                    },
                },
            });
            navigate("/");
        },
        [startPipeline],
    );

    if (loading) return <p>Starting pipeline...</p>;

    return (
        <div id="start-pipeline">
            <h2>Start a new Pipeline:</h2>
            <form onSubmit={submitForm}>
                <Button variant="contained" type="submit">
                    Start Pipeline
                </Button>

                <div>
                    <label htmlFor="index">Select Index:</label>
                    <select
                        name="index"
                        value={indicesData?.indices.find((i) => i.active)?.id}
                    >
                        {indicesData?.indices.map((index) => (
                            <option
                                key={index.id}
                                value={index.id}
                            >
                                {index.id} {index.active ? " (active)" : ""}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="should-reset-completely">
                        Reset completely
                    </label>
                    <input
                        type="checkbox"
                        id="should-reset-completely"
                        name="should-reset-completely"
                    />
                </div>
                <div>
                    <label htmlFor="should-redownload">Redownload data</label>
                    <input
                        type="checkbox"
                        id="should-redownload"
                        name="should-redownload"
                    />
                </div>
                <DataResourceList />
            </form>
        </div>
    );
}
