// Copyright (c) 2025 WSO2 LLC. (https://www.wso2.com).
//
// WSO2 LLC. licenses this file to you under the Apache License,
// Version 2.0 (the "License"); you may not use this file except
// in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

import { Box, CircularProgress, Grid, Button } from "@mui/material";

import { useEffect, useState, useMemo } from "react";

import { RootState, useAppDispatch, useAppSelector } from "@slices/store";
import ErrorHandler from "@component/common/ErrorHandler";
import { State } from "@root/src/types/types";
import { filterAndSortApps, extractUniqueTags } from "@utils/searchUtils";
import AppCard from "@root/src/view/home/components/AppCard";
import SearchBar from "@component/ui/SearchBar";
import { fetchTags } from "@root/src/slices/tagSlice/tag";
import { fetchGroups } from "@root/src/slices/groupsSlice/groups";
import PreLoader from "@root/src/component/common/PreLoader";

export default function Home() {
  const dispatch = useAppDispatch();
  const { state, userApps, stateMessage } = useAppSelector(
    (state: RootState) => state.app
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<number[]>([]);

  useEffect(() => {
    dispatch(fetchTags());
    dispatch(fetchGroups());
  }, [dispatch]);

  // Extract unique tags from apps
  const availableTags = useMemo(() => {
    return userApps ? extractUniqueTags(userApps) : [];
  }, [userApps]);

  // Filter and sort apps based on search and tags
  const filteredApps = useMemo(() => {
    if (!userApps) return [];
    return filterAndSortApps(userApps, searchTerm, selectedTags);
  }, [userApps, searchTerm, selectedTags]);

  if (state === State.loading) {
    return <PreLoader isLoading message={"Fetching your apps ..."} />;
  }

  if (state === State.failed) {
    return <ErrorHandler message={stateMessage} />;
  }

  return (
    <Box sx={{ paddingBottom: 4, position: "relative" }}>
      <Box
        sx={{
          mb: 3,
          display: "flex",
          flexDirection: "row",
          position: "sticky",
          top: 60,
          zIndex: 1000,
          justifyContent: "space-between",
          alignItems: "start",
          gap: 2,
        }}
      >
        <SearchBar
          onSearchChange={setSearchTerm}
          onTagsChange={setSelectedTags}
          availableTags={availableTags}
          selectedTags={selectedTags}
        />
      </Box>

      <Grid container spacing={2}>
        {filteredApps.length > 0 ? (
          filteredApps.map((app) => (
            <Grid item xs={12} sm={6} md={4} lg={2.4} key={app.id}>
              <AppCard
                title={app.name}
                description={app.description}
                logoUrl={app.icon}
                logoAlt={`${app.name} Icon`}
                tags={app.tags}
                appUrl={app.url}
                isFavourite={app.isFavourite}
                appId={app.id}
              />
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "40vh",
              }}
            >
              <ErrorHandler message="No applications found matching your search criteria" />
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
