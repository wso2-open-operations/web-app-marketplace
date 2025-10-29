import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Typography,
} from "@mui/material";

import { useEffect } from "react";

import { fetchGroups } from "@root/src/slices/groupsSlice/groups";
import {
  RootState,
  useAppDispatch,
  useAppSelector,
} from "@root/src/slices/store";

export default function Profile() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state: RootState) => state.user.userInfo);
  const token = useAppSelector((state: RootState) => state.auth.decodedIdToken);
  const groups = token?.groups;

  useEffect(() => {
    dispatch(fetchGroups());
  }, [dispatch]);

  return (
    <Card
      sx={{
        mt: 2,
        borderRadius: 2,
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        border: "1px solid",
        borderColor: "divider",
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
              <Typography
                sx={{ fontWeight: 600, color: "text.secondary" }}
                variant="h4"
              >
                {`${user?.firstName} ${user?.lastName}`}
              </Typography>
              <Typography sx={{ color: "text.tertiary" }} variant="body1">
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
              color: "text.secondary",
              textDecoration: "underline",
              textDecorationColor: "primary.secondary",
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
                    color: "text.tertiary",
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
