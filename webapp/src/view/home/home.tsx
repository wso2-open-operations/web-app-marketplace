import { Box, CircularProgress, Grid, Typography } from "@mui/material";
import AppCard from "../../component/ui/AppCard";
import SearchBar from "../../component/ui/SearchBar";
import {
  RootState,
  useAppDispatch,
  useAppSelector,
} from "@root/src/slices/store";
import { fetchAppLinks } from "@root/src/slices/appSlice/app";
import { State } from "@root/src/types/types";
import { useEffect, useState, useMemo } from "react";
import {
  filterAndSortApps,
  extractUniqueTags,
} from "@root/src/utils/searchUtils";

export default function Home() {
  const dispatch = useAppDispatch();
  const { state, apps } = useAppSelector((state: RootState) => state.appLinks);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchAppLinks());
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

  console.log("apps : ", apps);

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
    <Box>
      <SearchBar
        onSearchChange={setSearchTerm}
        onTagsChange={setSelectedTags}
        availableTags={availableTags}
        selectedTags={selectedTags}
        isOpen={isSearchOpen}
        onToggle={() => setIsSearchOpen(!isSearchOpen)}
      />

      <Grid container spacing={3}>
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
