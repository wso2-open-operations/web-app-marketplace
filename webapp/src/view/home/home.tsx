
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

import {
  RootState,
  useAppDispatch,
  useAppSelector,
} from "@slices/store";
import ErrorHandler from "@component/common/ErrorHandler";
import { State } from "@root/src/types/types";
import {
  filterAndSortApps,
  extractUniqueTags,
} from "@utils/searchUtils";
import AppCard from "@root/src/view/home/components/AppCard";
import SearchBar from "@component/ui/SearchBar";
import AddAppModal from "@root/src/view/home/components/AddAppModal";
import { fetchTags } from "@root/src/slices/tagSlice/tag";
import { fetchGroups } from "@root/src/slices/groupsSlice/groups";
import { Role } from "@root/src/slices/authSlice/auth";

export default function Home() {
  const dispatch = useAppDispatch();
  const { state, apps } = useAppSelector((state: RootState) => state.app);
  const roles = useAppSelector((state: RootState) => state.auth.roles);
  const isAdmin = roles.includes(Role.ADMIN);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  useEffect(() => {
    dispatch(fetchTags());
    dispatch(fetchGroups());
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
    return <ErrorHandler message="Failed to load applications. Please try again later." />;
  }

  return (
    <Box sx={{ paddingBottom: 4, position: "relative"}}>
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
        {isAdmin && <Button variant="contained" sx={{whiteSpace: "nowrap"}} onClick={handleOpenModal}>Add New Card</Button>}
      </Box>

      <AddAppModal open={isModalOpen} onClose={handleCloseModal} />

      <Grid container spacing={2}>
        {filteredApps.length > 0 ? (
          filteredApps.map((app) => (
            <Grid item xs={12} sm={6} md={4} lg={2.4} key={app.id}>
              <AppCard
                title={app.name}
                description={app.description}
                logoUrl={app.icon || `/icons/${app.iconName}`}
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
