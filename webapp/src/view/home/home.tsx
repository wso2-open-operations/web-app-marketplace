import { Box, CircularProgress, Grid, Typography } from "@mui/material";
import AppCard from "../../component/ui/AppCard";
import {
  RootState,
  useAppDispatch,
  useAppSelector,
} from "@root/src/slices/store";
import { fetchAppLinks } from "@root/src/slices/appSlice/app";
import { State } from "@root/src/types/types";
import { useEffect } from "react";

export default function Home() {
  const dispatch = useAppDispatch();
  const { state, apps } = useAppSelector((state: RootState) => state.appLinks);

  useEffect(() => {
    dispatch(fetchAppLinks());
  }, [dispatch]);

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
    <Grid container spacing={3}>
      {apps &&
        Array.isArray(apps) &&
        apps.map((app) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={app.id}>
            <AppCard
              title={app.header}
              description={app.description}
              logoUrl={`/icons/${app.iconName}`}
              logoAlt={`${app.header} Icon`}
              category={app.tagId.toString()}
              appUrl={app.urlName}
              isFavourite={app.isFavourite}
              appId={app.id}
            />
          </Grid>
        ))}
    </Grid>
  );
}
