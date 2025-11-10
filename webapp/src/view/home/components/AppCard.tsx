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
  SxProps,
  Theme,
  Tooltip,
} from "@mui/material";
import { Favorite, FavoriteBorder, Launch } from "@mui/icons-material";

import { useEffect, useState } from "react";

import { useAppDispatch } from "@root/src/slices/store";
import { upsertAppFavourite, Tag } from "@root/src/slices/appSlice/app";
import { UpdateAction } from "@root/src/types/types";
import { Tags } from "lucide-react";
import { wrap } from "lodash";

interface AppCardProps {
  title: string;
  description: string;
  logoUrl: string;
  tags: Tag[];
  appUrl: string;
  logoAlt?: string;
  isFavourite?: number;
  appId: number;
  cardSx?: SxProps<Theme>;
  isClickable?: boolean;
}

export default function AppCard({
  title,
  description,
  logoUrl,
  tags,
  appUrl,
  logoAlt = "App Logo",
  isFavourite = 0,
  appId,
  cardSx,
  isClickable = true,
}: AppCardProps) {
  const [isFavorite, setIsFavorite] = useState(isFavourite === 1);
  const dispatch = useAppDispatch();

  const handleFavoriteClick = () => {
    const newFavoriteState = !isFavorite;
    setIsFavorite(newFavoriteState);
    dispatch(
      upsertAppFavourite({
        id: appId,
        active: newFavoriteState
          ? UpdateAction.Favorite
          : UpdateAction.Unfavourite,
      })
    );
  };

  const handleLaunchClick = () => {
    if (!appUrl) return;
    const url =
      appUrl.startsWith("http://") || appUrl.startsWith("https://")
        ? appUrl
        : `https://${appUrl}`;

    window.open(url, "_blank", "noopener,noreferrer");
  };

  const renderLogo = () => {
    // Check if logoUrl is a base64 string
    const isBase64 = logoUrl.startsWith("data:image/");

    if (isBase64) {
      return (
        <Box
          component="img"
          src={logoUrl}
          alt={logoAlt}
          sx={{
            height: 40,
            width: "auto",
            maxWidth: 40,
            objectFit: "contain",
            opacity: 0.85,
          }}
        />
      );
    }
  };

  const defaultCardSx: SxProps<Theme> = {
    maxWidth: 500,
    width: "100%",
    height: "100%",
    borderRadius: 4,
    boxShadow: "0 4px 12px rgba(0,0,0,0.0)",
    position: "relative",
    border: ".75px solid #e6e6e6",
    background: "#fff",
    cursor: "pointer",
    transition: "box-shadow 0.3s ease, transform 0.2s ease",
    "&:hover": {
      boxShadow: "0 6px 16px rgba(0,0,0,0.05)",
      transform: "translateY(-2px)",
      background: "#fff",
    },
  };

  const mergedCardSx = Array.isArray(cardSx)
    ? [defaultCardSx, ...cardSx]
    : [defaultCardSx, cardSx || {}];

  const remainingTags = tags.slice(1);
  const tooltipTitle = (
    <Box
      sx={{
        display: "flex",
        gap: 1,
      }}
    >
      {remainingTags.map((tag) => (
        <Chip
          key={tag.id}
          label={tag.name}
          sx={{
            backgroundColor: "#FFF",
            border: `1px solid ${tag.color}80`,
            color: `${tag.color}`,
            fontWeight: 400,
            fontSize: "14px",
            padding: "4px",
            height: "auto",
            borderRadius: 1,
            flexShrink: 0,
            whiteSpace: "nowrap",
          }}
        />
      ))}
    </Box>
  );

  return (
    <Card
      onClick={isClickable ? handleLaunchClick : undefined}
      sx={mergedCardSx}
    >
      <CardContent
        sx={{
          padding: 2.5,
          paddingTop: 3,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          height: "100%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          {renderLogo()}
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              handleFavoriteClick();
            }}
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
            fontSize: "16px",
            color: "#333",
          }}
        >
          {title}
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: "#718096",
            lineHeight: 1.6,
            flexGrow: 1,
          }}
        >
          {description}
        </Typography>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "auto",
            gap: 2,
            width: "100%",
          }}
        >
          <Box
            sx={{
              display: "flex",
              gap: 1,
            }}
          >
            {tags.map((tag, index) => {
              if (index === 0) {
                return (
                  <Chip
                    key={tag.id}
                    label={tag.name}
                    sx={{
                      backgroundColor: "#FFF",
                      border: `1.5px solid ${tag.color}80`,
                      color: `${tag.color}`,
                      fontWeight: 500,
                      fontSize: "14px",
                      padding: "4px",
                      height: "auto",
                      borderRadius: 1,
                      flexShrink: 0,
                      whiteSpace: "nowrap",
                    }}
                  />
                );
              }

              if (index === 1 && tags.length > 1) {
                return (
                  <Tooltip
                    title={tooltipTitle}
                    slotProps={{
                      popper: {
                        modifiers: [
                          {
                            name: "offset",
                            options: {
                              offset: [0, -10],
                            },
                          },
                        ],
                      },
                      tooltip: {
                        sx: {
                          backgroundColor: "#fff",
                          color: "#333",
                          border: "1px solid #e6e6e6",
                          borderRadius: 1,
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                          flex: "wrap",
                          maxWidth: "250px"
                        },
                      },
                    }}
                  >
                    <Chip
                      key="more"
                      label={`+${tags.length - 1}`}
                      sx={{
                        backgroundColor: "#FFF",
                        border: "1.5px solid #cbd5e080",
                        color: "#718096",
                        fontWeight: 500,
                        fontSize: "14px",
                        padding: "4px",
                        height: "auto",
                        borderRadius: 1,
                        flexShrink: 0,
                        whiteSpace: "nowrap",
                      }}
                    />
                  </Tooltip>
                );
              }

              return null;
            })}
          </Box>
          <Box sx={{ display: "flex", gap: 2, flexShrink: 0 }}>
            <Launch sx={{ fontSize: 20, color: "#718096" }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
