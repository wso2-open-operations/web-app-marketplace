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

import { useEffect } from "react";

import { fetchGroups } from "@root/src/slices/groupsSlice/groups";
import { RootState, useAppDispatch, useAppSelector } from "@root/src/slices/store";

export default function Profile() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state: RootState) => state.user.userInfo);
  const token = useAppSelector((state: RootState) => state.auth.decodedIdToken);
  const groups = token?.groups;
  const theme = useTheme();

  useEffect(() => {
    dispatch(fetchGroups());
  }, [dispatch]);

  return (
    <Card
      sx={{
        borderRadius: 2,
        boxShadow: "0 1px 3px rgba(0,0,0,0.0)",
        border: `1px solid ${theme.palette.customBorder.territory.active}`,
      }}
    >
      <CardContent sx={{ display: "flex", alignItems: "end", gap: 4 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Avatar
            sx={{ height: "100px", width: "100px" }}
            src={user?.employeeThumbnail ?? ""}
            alt={user?.firstName}
          >
            {user?.firstName?.slice(0, 1)}
          </Avatar>
          <Box sx={{ display: "flex", gap: 4 }}>
            <Box
              sx={{
                paddingLeft: 1,
                display: "flex",
                flexDirection: "column",
                gap: 1,
              }}
            >
              <Typography sx={{ color: theme.palette.customText.primary.p2.active }} variant="h4">
                {`${user?.firstName} ${user?.lastName}`}
              </Typography>
              <Typography
                sx={{ color: theme.palette.customText.primary.p3.active }}
                variant="body1"
              >
                {user?.workEmail}
              </Typography>
            </Box>
          </Box>
        </Box>
        <Box
          sx={{
            "& > *:not(:last-child)": {
              marginBottom: 1,
            },
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: theme.palette.customText.primary.p2.active,
              textDecoration: "underline",
              textDecorationColor: theme.palette.customText.primary.p2.active,
              textDecorationThickness: "1px",
              textUnderlineOffset: "2px",
            }}
          >
            Roles
          </Typography>

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
                      fontSize: "12px",
                    },
                    color: theme.palette.customText.primary.p3.active,
                    borderRadius: 2,
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
