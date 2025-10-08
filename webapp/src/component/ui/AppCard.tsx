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
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  IconButton,
} from "@mui/material";
import { Favorite, FavoriteBorder, Launch } from "@mui/icons-material";

import { useState } from "react";

import { useAppDispatch } from "@root/src/slices/store";
import { updateAppFavourite } from "@root/src/slices/appSlice/app";

interface AppCardProps {
  title: string;
  description: string;
  logoUrl: string;
  category: string;
  appUrl: string;
  logoAlt?: string;
  isFavourite?: number;
  appId: number;
  tagId: number;
  tagColor: string;
}

export default function AppCard({
  title,
  description,
  logoUrl,
  category,
  appUrl,
  logoAlt = "App Logo",
  isFavourite = 0,
  appId,
  tagColor,
}: AppCardProps) {
  const [isFavorite, setIsFavorite] = useState(isFavourite === 1);
  const dispatch = useAppDispatch();

  const handleFavoriteClick = () => {
    const newFavoriteState = !isFavorite;
    setIsFavorite(newFavoriteState);
    dispatch(
      updateAppFavourite({ id: appId, active: newFavoriteState ? 1 : 0 })
    );
  };

  const handleLaunchClick = () => {
    window.open(appUrl, "_blank", "noopener,noreferrer");
  };

  console.log(tagColor);

  return (
    <Card
      sx={{
        maxWidth: 500,
        width: "100%",
        height: "100%",
        borderRadius: 4,
        boxShadow: "0 4px 12px rgba(0,0,0,0.0)",
        position: "relative",
        border: "0.5px solid #e6e6e6",
        background: "linear-gradient(180deg, #FFF 60%, #FAFAFA 100%)",
      }}
    >
      <CardContent
        sx={{
          padding: 3,
          paddingTop: 4,
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Box
            component="img"
            src={logoUrl}
            alt={logoAlt}
            sx={{ height: 40, objectFit: "contain" }}
          />
          <IconButton
            onClick={handleFavoriteClick}
            sx={{
              padding: 0.5,
              "&:hover": { backgroundColor: "transparent" },
            }}
          >
            {isFavorite ? (
              <Favorite sx={{ fontSize: 20, color: "#e53e3e" }} />
            ) : (
              <FavoriteBorder sx={{ fontSize: 20, color: "#a0aec0" }} />
            )}
          </IconButton>
        </Box>

        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 600,
            fontSize: "18px",
          }}
        >
          {title}
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: "#718096",
            lineHeight: 1.6,
          }}
        >
          {description}
        </Typography>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Chip
            label={category}
            sx={{
              backgroundColor: `${tagColor}1A`,
              border: `2px solid ${tagColor}80`,
              color: `${tagColor}`,
              fontWeight: 500,
              fontSize: "0.9rem",
              padding: "4pX",
              height: "auto",
              borderRadius: 1,
            }}
          />
          <Box sx={{ display: "flex", gap: 2 }}>
            <IconButton
              onClick={handleLaunchClick}
              sx={{
                padding: 0.5,
                "&:hover": { backgroundColor: "transparent" },
              }}
              aria-label="Open app in new tab"
            >
              <Launch sx={{ fontSize: 20, color: "#718096" }} />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
