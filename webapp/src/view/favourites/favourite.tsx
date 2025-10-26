import { Grid } from "@mui/material";

import { RootState, useAppSelector } from "@root/src/slices/store";
import ErrorHandler from "@component/common/ErrorHandler";

import AppCard from "@view/home/components/AppCard";

function Favourites() {
    const apps = useAppSelector((state: RootState) => state.app.userApps);
    const favApps = apps?.filter(app => app.isFavourite === 1) || [];

    return (
        <Grid container spacing={2}>
            {favApps.length > 0 ? (
                favApps.map((app) => (
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
                    <ErrorHandler message="No favourite applications were found" />
                </Grid>
            )}
        </Grid>
    )
}

export default Favourites;
