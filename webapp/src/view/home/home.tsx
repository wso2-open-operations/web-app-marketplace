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
import { Box } from "@mui/material";

import { useEffect, useMemo, useState } from "react";

import ErrorHandler from "@component/common/ErrorHandler";
import SearchBar from "@component/ui/SearchBar";
import PreLoader from "@root/src/component/common/PreLoader";
import { fetchGroups } from "@root/src/slices/groupsSlice/groups";
import { fetchTags } from "@root/src/slices/tagSlice/tag";
import { State } from "@root/src/types/types";
import AppCard from "@root/src/view/home/components/AppCard";
import { RootState, useAppDispatch, useAppSelector } from "@slices/store";
import { extractUniqueTags, filterAndSortApps } from "@utils/searchUtils";

export default function Home() {
  const dispatch = useAppDispatch();
  const { state, userApps, stateMessage } = useAppSelector((state: RootState) => state.app);

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
    <Box sx={{ padding: 0, position: "relative", paddingBottom: 6 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          position: "sticky",
          top: 0,
          zIndex: 1000,
          justifyContent: "space-between",
          alignItems: "start",
          gap: 2,
          mb: 3,
        }}
      >
        <SearchBar
          onSearchChange={setSearchTerm}
          onTagsChange={setSelectedTags}
          availableTags={availableTags}
          selectedTags={selectedTags}
        />
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(1, 1fr)",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
            lg: "repeat(4, 1fr)",
            xl: "repeat(5, 1fr)",
          },
          gap: 2,
        }}
      >
        {filteredApps.length > 0 ? (
          filteredApps.map((app) => (
            <Box key={app.id}>
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
            </Box>
          ))
        ) : (
          <Box
            sx={{
              gridColumn: "1 / -1",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "40vh",
            }}
          >
            <ErrorHandler message="No applications found matching your search criteria" />
          </Box>
        )}
      </Box>
    </Box>
  );
}
