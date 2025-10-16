import { Box, Grid, Typography } from "@mui/material";
import { RootState, useAppDispatch, useAppSelector } from "@root/src/slices/store";
import AppCard from "../home/components/AppCard";
import { useEffect } from "react";
import { fetchApps } from "@root/src/slices/appSlice/app";
import ErrorHandler from "@component/common/ErrorHandler";

function Favourites() {
    const dispatch = useAppDispatch()
    const apps = useAppSelector((state: RootState) => state.app.apps);
    const favApps = apps?.filter(app => app.isFavourite === 1) || [];

    useEffect(() => {
        dispatch(fetchApps());
    }, [dispatch])

    return (
        <Grid container spacing={2}>
            {favApps.length > 0 ? (
                favApps.map((app) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={app.id}>
                        <AppCard
                            title={app.name}
                            description={app.description}
                            logoUrl={app.icon || `/icons/${app.iconName}`}
                            logoAlt={`${app.name} Icon`}
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
                    <ErrorHandler message="No favourite applications were found" />
                </Grid>
            )}
        </Grid>
    )
}

export default Favourites;
