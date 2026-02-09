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
import { Avatar, Box, Card, CardContent, Chip, Typography, useTheme } from "@mui/material";

import { useGetUserInfoQuery } from "@root/src/services/user.api";
import { RootState, useAppSelector } from "@root/src/slices/store";

export default function Profile() {
  const { data: user } = useGetUserInfoQuery();
  const token = useAppSelector((state: RootState) => state.auth.decodedIdToken);
  const groups = token?.groups;
  const theme = useTheme();

  return (
    <Card
      sx={{
        borderRadius: 2,
        boxShadow: "none",
        border: `1px solid ${theme.palette.customBorder.territory.active}`,
      }}
    >
      <CardContent
        sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2.5 }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, alignItems: "center" }}>
          <Avatar
            sx={{ height: "100px", width: "100px" }}
            src={user?.employeeThumbnail ?? ""}
            alt={user?.firstName}
          >
            {user?.firstName?.slice(0, 1)}
          </Avatar>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography
              sx={{ color: theme.palette.customText.primary.p2.active, textAlign: "center" }}
              variant="h4"
            >
              {`${user?.firstName} ${user?.lastName}`}
            </Typography>

            <Typography sx={{ color: theme.palette.customText.primary.p4.active }} variant="body2">
              {user?.workEmail}
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            "& > *:not(:last-child)": {
              marginBottom: 1,
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "flex-end",
              gap: 1,
            }}
          >
            {groups ? (
              groups.map((grp: string) => (
                <Chip
                  key={grp}
                  sx={{
                    "& .MuiChip-label": {
                      fontSize: "14px",
                    },
                    color: theme.palette.customText.primary.p3.active,
                    border: `1px solid ${theme.palette.customBorder.territory.active}`,
                    borderRadius: 0.5,
                    backgroundColor: theme.palette.surface.primary.active,
                  }}
                  variant="outlined"
                  size="small"
                  label={grp}
                />
              ))
            ) : (
              <Typography>User has no roles to display</Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
