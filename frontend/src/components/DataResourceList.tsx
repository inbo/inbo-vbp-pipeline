import "../styles/DataResourceList.css";
import { useQuery } from "@apollo/client/react";
import { GET_ALL_DATA_RESOURCES } from "../graphql/dataResources";
import { useCallback, useEffect, useState } from "react";
import React from "react";
import { Button } from "@mui/material";

const SelectAllStates = [
    "all",
    "none",
    "updated",
    "new",
    "some",
] as const;
type SelectAllState = (typeof SelectAllStates)[number];

export const DataResourceList = () => {
    const { data } = useQuery(GET_ALL_DATA_RESOURCES);

    const [showList, setShowList] = useState(false);

    const [selectAllState, setSelectAllState] = useState<SelectAllState>("all");
    const [selectedResources, setSelectedResources] = useState<boolean[]>([]);

    const [selectAllRef] = useState<React.RefObject<HTMLInputElement | null>>(
        () => React.createRef<HTMLInputElement>(),
    );
    useEffect(
        () => {
            switch (selectAllState) {
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
                case "updated":
                    setSelectedResources((prev) =>
                        [...prev].map((_, i) =>
                            data?.dataResources[i].updated == true
                        )
                    );
                    break;
                case "new":
                    setSelectedResources((prev) =>
                        [...prev].map((_, i) =>
                            data?.dataResources[i].new == true
                        )
                    );
                    break;
                case "some":
                    // Do nothing, handled through individual toggles
                    break;
                default:
                    throw new Error(
                        "Invalid select all state triggered through toggling",
                    );
            }

            // Need to set indeterminate state manually, not supported through JSX
            if (selectAllRef.current) {
                selectAllRef.current.indeterminate = selectAllState !== "all" &&
                    selectAllState !== "none" && selectedResources.some((v) =>
                        v
                    );
            }
        },
        [selectAllState, data],
    );

    const changeSelectAll = useCallback(() => {
        const newState = (SelectAllStates.indexOf(selectAllState) + 1) %
            (SelectAllStates.length - 1);
        setSelectAllState(SelectAllStates[newState]);
    }, [selectAllState, data?.dataResources]);

    const changeSingleResource = (index: number) => {
        setSelectedResources((prev) => {
            const newStates = [...prev];
            newStates[index] = !newStates[index];

            if (newStates.every((isSelected) => isSelected)) {
                setSelectAllState("all");
            } else if (newStates.every((isSelected) => !isSelected)) {
                setSelectAllState("none");
            } else if (
                newStates.every((isSelected, i) =>
                    isSelected ===
                        (data?.dataResources[i].updated == true)
                )
            ) {
                setSelectAllState("updated");
            } else if (
                newStates.every((isSelected, i) =>
                    isSelected ===
                        (data?.dataResources[i].new == true)
                )
            ) {
                setSelectAllState("new");
            } else {
                setSelectAllState("some");
            }

            return newStates;
        });
    };

    return (
        <div className="data-resource-list">
            <div className="data-resource-select">
                <div>
                    <label htmlFor="select-all">
                        Select Data Resources{" "}
                        <span className="select-all-state">
                            {selectAllState}
                        </span>
                    </label>

                    <input
                        ref={selectAllRef}
                        type="checkbox"
                        id="select-all"
                        name="data-resource-all"
                        onChange={changeSelectAll}
                        checked={selectAllState === "all"}
                        value="all"
                    />
                </div>
                <Button
                    onClick={(e) => {
                        e.preventDefault();
                        setShowList((prev) => !prev);
                    }}
                >
                    {showList
                        ? "Hide Individual Data Resources"
                        : "Show Individual Data Resources"}
                </Button>
            </div>
            <ul style={{ display: showList ? "block" : "none" }}>
                {data?.dataResources.map((dr, index) => (
                    <li
                        key={dr.id}
                        className="data-resource-list-item"
                    >
                        <div className="data-resource-select">
                            <input
                                type="checkbox"
                                id={dr.id}
                                name="data-resource"
                                value={dr.id}
                                checked={selectedResources[index] || false}
                                onChange={() => changeSingleResource(index)}
                            />
                        </div>
                        <div className="data-resource-id">
                            {dr.id}{" "}
                            {dr.updated ? "(updated)" : dr.new ? "(new)" : ""}
                        </div>
                        <div className="data-resource-name">
                            {dr.name}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default DataResourceList;
