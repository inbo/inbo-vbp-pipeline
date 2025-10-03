import { useQuery } from "@apollo/client/react";
import { GET_INDEX_COUNTS } from "../graphql/indices";
import { Spinner } from "./Spinner";

export function IndexDataResourceCounts({ indexId }: { indexId: string }) {
    const { data, loading, error } = useQuery(
        GET_INDEX_COUNTS,
        {
            variables: { indexId },
        },
    );

    if (loading) return <Spinner />;
    if (error) return <p>Error loading counts: {error.message}</p>;
    if (!data?.index?.counts) return <p>No counts available</p>;

    return (
        <div className="index-list-item-details-count">
            <div className="index-list-item-details-count-item">
                <span className="index-list-item-details-count-item-label">
                    Total:
                </span>{" "}
                {data?.index.counts?.total}
            </div>
            {data?.index.counts?.dataResourceCounts.map((drCount) => (
                <div
                    key={drCount.dataResourceId}
                    className="index-list-item-details-count-item"
                >
                    <span className="index-list-item-details-count-item-label">
                        {drCount.dataResourceId}:
                    </span>{" "}
                    {drCount.count}
                </div>
            ))}
        </div>
    );
}
