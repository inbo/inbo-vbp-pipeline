import "../styles/DataResourceList.css";
import { useQuery } from "@apollo/client/react";
import { GET_ALL_DATA_RESOURCES } from "../graphql/dataResources";
import { useCallback, useMemo, useState } from "react";
import type { DataResource } from "../__generated__/biocache-index-management/graphql";
import React from "react";

const SelectAllStates = [
    "all",
    "none",
    /* "updated", "new", */ "some",
] as const;

function getSelectAllState(
    selectedResources: boolean[],
    dataResources: DataResource[],
): number {
    let allSelected = true;
    let noneSelected = true;
    let updatedSelected = true;
    let newSelected = true;
    for (let i = 0; i < selectedResources.length; i++) {
        if (selectedResources[i]) {
            noneSelected = false;
        } else {
            allSelected = false;
        }
        // const dataResource = dataResources[i];
        // if (selectedResources[i] && !dataResource?.updated) {
        //     updatedSelected = false;
        // }
        // if (selectedResources[i] && !dataResource?.new) {
        //     newSelected = false;
        // }
    }
    if (noneSelected) {
        return SelectAllStates.indexOf("none");
    } else if (allSelected) {
        //     return SelectAllStates.indexOf("all");
        // } else if (newSelected) {
        //     return SelectAllStates.indexOf("new");
        // } else if (updatedSelected) {
        //     return SelectAllStates.indexOf("updated");
    } else {
        return SelectAllStates.indexOf("some");
    }
}

export const DataResourceList = () => {
    const { data } = useQuery(GET_ALL_DATA_RESOURCES);

    const [showList, setShowList] = useState(false);
    const [selectedResources, setSelectedResources] = useState<boolean[]>(
        new Array(data?.dataResources.length).fill(true),
    );

    const [selectAllRef] = useState<React.RefObject<HTMLInputElement | null>>(
        () => React.createRef<HTMLInputElement>(),
    );
    let selectAllState = useMemo(
        () => {
            const newState = getSelectAllState(
                selectedResources,
                data?.dataResources || [],
            );

            // Neeed to set indeterminate state manually, not supported through JSX
            if (selectAllRef.current) {
                selectAllRef.current.indeterminate =
                    SelectAllStates[newState] === "some"; // ||
                // SelectAllStates[newState] === "updated" ||
                // SelectAllStates[newState] === "new";
            }

            return newState;
        },
        [selectedResources, data?.dataResources, selectAllRef],
    );

    const changeSelectAll = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const newState = (selectAllState + 1) % SelectAllStates.length;
            console.warn(
                SelectAllStates[selectAllState],
                SelectAllStates[newState],
            );
            switch (SelectAllStates[newState]) {
                case "all":
                    setSelectedResources(
                        new Array(data?.dataResources.length).fill(true),
                    );
                    break;
                case "none":
                    setSelectedResources(
                        new Array(data?.dataResources.length).fill(false),
                    );
                    break;
                // case "updated":
                //     setSelectedResources((prev) =>
                //         prev.map((_, i) => data?.dataResources[i].updated)
                //     );
                //     break;
                // case "new":
                //     setSelectedResources((prev) =>
                //         prev.map((_, i) => data?.dataResources[i].isNew)
                //     );
                //     break;
                default:
                    throw new Error(
                        "Invalid select all state triggered through toggling",
                    );
            }
        },
        [selectAllState, data?.dataResources],
    );
    const changeSingleResource = (index: number) => {
        setSelectedResources((prev) =>
            prev.map((isSelected, i) => i === index ? !isSelected : isSelected)
        );
    };

    return (
        <div className="data-resource-list">
            <button
                onClick={(e) => {
                    e.preventDefault();
                    setShowList((prev) => !prev);
                }}
            >
                Select Data Resources
            </button>
            {showList &&
                (
                    <>
                        <div className="data-resource-list-header">
                            <div className="data-resource-select">
                                <input
                                    ref={selectAllRef}
                                    type="checkbox"
                                    id="select-all"
                                    name="dataResource"
                                    onChange={changeSelectAll}
                                    defaultChecked={SelectAllStates[
                                        selectAllState
                                    ] ===
                                        "all"}
                                />
                                <label htmlFor="select-all">
                                    {SelectAllStates[selectAllState]}
                                </label>
                            </div>
                            <div className="data-resource-id">ID</div>
                            <div className="data-resource-name">Name</div>
                        </div>
                        {data?.dataResources.map((dr, index) => (
                            <div
                                key={dr.id}
                                className="data-resource-list-item"
                            >
                                <div className="data-resource-select">
                                    <input
                                        type="checkbox"
                                        id={dr.id}
                                        name="dataResource"
                                        value={dr.id}
                                        onChange={() =>
                                            changeSingleResource(index)}
                                    />
                                </div>
                                <div className="data-resource-id">{dr.id}</div>
                                <div className="data-resource-name">
                                    {dr.name}
                                </div>
                            </div>
                        ))}
                    </>
                )}
        </div>
    );
};

export default DataResourceList;
