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
import { Grid } from "@mui/material";

import ErrorHandler from "@component/common/ErrorHandler";
import { RootState, useAppSelector } from "@root/src/slices/store";
import AppCard from "@view/home/components/AppCard";

function Favourites() {
  const apps = useAppSelector((state: RootState) => state.app.userApps);
  const favApps = apps?.filter((app) => app.isFavourite === 1) || [];

  return (
    <Grid container spacing={2} sx={{ width: "100%" }}>
      {favApps.length > 0 ? (
        favApps.map((app) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.6 }}>
            <AppCard
              key={app.id}
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
        <Grid size={{ xs: 12 }} sx={{ width: "100%" }}>
          <ErrorHandler message="No favourite applications were found" />
        </Grid>
      )}
    </Grid>
  );
}

export default Favourites;
