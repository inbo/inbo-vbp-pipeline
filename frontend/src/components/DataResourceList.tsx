import "../styles/DataResourceList.css";
import { useQuery } from "@apollo/client/react";
import { GET_ALL_DATA_RESOURCES } from "../graphql/dataResources";
import { useCallback, useEffect, useState } from "react";
import { Checkbox, InputAdornment, TextField } from "@mui/material";

import type { DataResource } from "../__generated__/biocache-index-management/graphql";
import { FilterListRounded } from "@mui/icons-material";

const SelectAllStates = [
    "all",
    "none",
    "updated",
    "new",
    "some",
] as const;
type SelectAllState = (typeof SelectAllStates)[number];

export const DataResourceList = (
    { className, preSelectedResources = [] }: {
        className?: string;
        preSelectedResources?: string[];
    },
) => {
    const { data } = useQuery(GET_ALL_DATA_RESOURCES);
    const [dataResourceFilter, setDataResourceFilter] = useState("");

    const [selectAllState, setSelectAllState] = useState<SelectAllState>(
        "none",
    );
    const [selectedResources, setSelectedResources] = useState<boolean[]>([]);

    const matchesFilter = useCallback((dr: DataResource) => {
        let matches = true;
        dataResourceFilter.split(" ").forEach((term) => {
            matches = matches &&
                ((dr.name?.toLowerCase().includes(term)) ||
                    (dr.id.toLowerCase().includes(term)));
        });
        return matches;
    }, [dataResourceFilter]);

    useEffect(
        () => {
            switch (selectAllState) {
                case "all":
                    setSelectedResources(
                        data?.dataResources.map((dr, idx) =>
                            matchesFilter(dr) || selectedResources[idx]
                        ) || [],
                    );
                    break;
                case "none":
                    setSelectedResources(
                        data?.dataResources.map((dr, idx) =>
                            selectedResources[idx] && !matchesFilter(dr)
                        ) || [],
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
                    break;
                default:
                    throw new Error(
                        "Invalid select all state triggered through toggling",
                    );
            }
        },
        [selectAllState, data?.dataResources],
    );

    useEffect(() => {
        if (
            data?.dataResources &&
            preSelectedResources.length > 0 &&
            selectedResources.length === 0
        ) {
            const newStates = data.dataResources.map((dr) => {
                return preSelectedResources.includes(dr.id);
            });
            updateSelectAllState(newStates);
            setSelectedResources(newStates);
        }
    }, [data?.dataResources !== undefined, selectedResources.length > 0]);

    const changeSelectAll = useCallback(() => {
        let newState = (SelectAllStates.indexOf(selectAllState) + 1) %
            (SelectAllStates.length - 1);

        if (
            SelectAllStates[newState] == "updated" &&
            !(data?.dataResources.some((dr) => dr.updated))
        ) {
            newState = (newState + 1) %
                (SelectAllStates.length - 1);
        }

        if (
            SelectAllStates[newState] == "new" &&
            !(data?.dataResources.some((dr) => dr.new))
        ) {
            newState = (newState + 1) %
                (SelectAllStates.length - 1);
        }

        setSelectAllState(SelectAllStates[newState]);
    }, [selectAllState, data?.dataResources]);

    const updateSelectAllState = useCallback((newStates: boolean[]) => {
        debugger;
        const isHidden = data?.dataResources.map((dr) => !matchesFilter(dr)) ||
            [];
        if (newStates.length === 0) {
            setSelectAllState("none");
        } else if (
            newStates.every((isSelected, i) => isSelected || isHidden[i])
        ) {
            setSelectAllState("all");
        } else if (
            newStates.every((isSelected, i) => !isSelected || isHidden[i])
        ) {
            setSelectAllState("none");
        } else if (
            newStates.every((isSelected, i) =>
                isSelected ===
                    (data?.dataResources[i].updated == true) || isHidden[i]
            )
        ) {
            setSelectAllState("updated");
        } else if (
            newStates.every((isSelected, i) =>
                isSelected ===
                    (data?.dataResources[i].new == true) || isHidden[i]
            )
        ) {
            setSelectAllState("new");
        } else {
            setSelectAllState("some");
        }
    }, [data?.dataResources, matchesFilter]);

    useEffect(() => {
        updateSelectAllState(selectedResources);
    }, [matchesFilter]);

    const changeSingleResource = (index: number) => {
        setSelectedResources((prev) => {
            const newStates = [...prev];
            newStates[index] = !newStates[index];
            updateSelectAllState(newStates);
            return newStates;
        });
    };

    return (
        <div className={`data-resource-list ${className}`}>
            <div className="data-resource-list-header">
                <div className="data-resource-list-header-checkbox">
                    <Checkbox
                        id="select-all"
                        name="data-resource-all"
                        onChange={changeSelectAll}
                        checked={selectAllState === "all"}
                        indeterminate={selectAllState === "some" ||
                            selectAllState === "updated" ||
                            selectAllState === "new"}
                        value="all"
                        className="data-resource-list-checkbox data-resource-list-select-all"
                        onKeyDown={(e) => {
                            e.key === "Enter" && e.preventDefault();
                        }}
                    />
                    <label
                        htmlFor="select-all"
                        className="data-resource-list-header-select-state-label"
                    >
                        {selectAllState}
                    </label>
                </div>
                <div className="data-resource-list-header-filter-container">
                    <TextField
                        id="data-resource-list-filter"
                        label="Filter"
                        variant="outlined"
                        className="data-resource-list-header-filter"
                        onChange={(e) =>
                            setDataResourceFilter(
                                e.target.value.toLowerCase(),
                            )}
                        onKeyDown={(e) => {
                            e.key === "Enter" && e.preventDefault();
                        }}
                        value={dataResourceFilter}
                        slotProps={{
                            input: {
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <FilterListRounded />
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />
                </div>
                <div className="data-resource-list-header-count">
                    Selected {(selectedResources.reduce(
                        (acc, curr) => acc + (curr ? 1 : 0),
                        0,
                    )) || 0} of
                    {data?.dataResources.length || 0} data resources
                </div>
            </div>
            <ul className="data-resource-list-items">
                {data?.dataResources.map((dr, index) => (
                    <li
                        key={dr.id}
                        className={`data-resource-list-item ${
                            matchesFilter(dr) ? "" : "hidden"
                        }`}
                    >
                        <div className="data-resource-select">
                            <Checkbox
                                id={dr.id}
                                name="data-resource"
                                value={dr.id}
                                checked={selectedResources[index] || false}
                                onChange={() => changeSingleResource(index)}
                                className="data-resource-list-checkbox data-resource-list-select-item"
                                onKeyDown={(e) => {
                                    e.key === "Enter" && e.preventDefault();
                                }}
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
