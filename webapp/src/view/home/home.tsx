
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
import { Box, CircularProgress, Grid, Typography } from "@mui/material";

import { useEffect, useState, useMemo } from "react";

import {
  RootState,
  useAppDispatch,
  useAppSelector,
} from "@slices/store";
import { fetchApps } from "@slices/appSlice/app";
import { State } from "@root/src/types/types";
import {
  filterAndSortApps,
  extractUniqueTags,
} from "@utils/searchUtils";
import AppCard from "@component/ui/AppCard";
import SearchBar from "@component/ui/SearchBar";

export default function Home() {
  const dispatch = useAppDispatch();
  const { state, apps } = useAppSelector((state: RootState) => state.app);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchApps());
  }, [dispatch]);

  // Extract unique tags from apps
  const availableTags = useMemo(() => {
    return apps ? extractUniqueTags(apps) : [];
  }, [apps]);

  // Filter and sort apps based on search and tags
  const filteredApps = useMemo(() => {
    if (!apps) return [];
    return filterAndSortApps(apps, searchTerm, selectedTags);
  }, [apps, searchTerm, selectedTags]);

  if (state === State.loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (state === State.failed) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <Typography color="error">Failed to load applications</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{paddingBottom: 4, position: "relative"}}>
      <Box 
        sx={{ 
          position: "sticky", 
          top: 0, 
          zIndex: 1000,
        }}
      >
        <SearchBar
          onSearchChange={setSearchTerm}
          onTagsChange={setSelectedTags}
          availableTags={availableTags}
          selectedTags={selectedTags}
          isOpen={isSearchOpen}
          onToggle={() => setIsSearchOpen(!isSearchOpen)}
        />
      </Box>

      <Grid container spacing={2}>
        {filteredApps.length > 0 ? (
          filteredApps.map((app) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={app.id}>
              <AppCard
                title={app.header}
                description={app.description}
                logoUrl={`/icons/${app.iconName}`}
                logoAlt={`${app.header} Icon`}
                category={app.tagName}
                appUrl={app.urlName}
                isFavourite={app.isFavourite}
                appId={app.id}
                tagId={app.tagId}
                tagColor={app.tagColor}
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
              <Typography color="text.secondary">
                No applications found matching your search criteria
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
