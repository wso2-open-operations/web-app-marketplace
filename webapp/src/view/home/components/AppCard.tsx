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
import { Favorite, FavoriteBorder, Launch } from "@mui/icons-material";
import {
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  SxProps,
  Theme,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";

import { useState } from "react";

import { UpdateAction } from "@/types/types";
import { Tag, useUpsertAppFavouriteMutation } from "@root/src/services/app.api";
import { getChipStyles } from "@utils/utils";

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
  const [upsertFavourite] = useUpsertAppFavouriteMutation();
  const theme = useTheme();

  const handleFavoriteClick = () => {
    const newFavoriteState = !isFavorite;
    setIsFavorite(newFavoriteState);

    upsertFavourite({
      id: appId,
      action: newFavoriteState ? UpdateAction.Favorite : UpdateAction.Unfavourite,
    })
      .unwrap()
      .catch(() => {
        // Revert on failure
        setIsFavorite(!newFavoriteState);
      });
  };

  const handleLaunchClick = () => {
    if (!appUrl) return;
    const url =
      appUrl.startsWith("http://") || appUrl.startsWith("https://") ? appUrl : `https://${appUrl}`;

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
            opacity: 0.8,
            "& svg": {
              fill: theme.palette.customText.primary.p3.active,
              stroke: theme.palette.customText.primary.p3.active,
              opacity: 0.8,
            },
          }}
        />
      );
    }
  };

  const renderTags = () => {
    if (tags.length === 0) return null;

    const sortedTags = [...tags].sort((a, b) => a.name.length - b.name.length);
    const [firstTag, ...remainingTags] = sortedTags;

    return (
      <>
        <Chip
          key={firstTag.id}
          label={firstTag.name}
          sx={getChipStyles({ color: firstTag.color, isDarkMode: theme.palette.mode === "dark" })}
        />
        {remainingTags.length > 0 && (
          <Tooltip
            title={
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {remainingTags.map((tag) => (
                  <Chip
                    key={tag.id}
                    label={tag.name}
                    sx={getChipStyles({
                      color: tag.color,
                      isDarkMode: theme.palette.mode === "dark",
                    })}
                  />
                ))}
              </Box>
            }
            slotProps={{
              popper: {
                modifiers: [{ name: "offset", options: { offset: [0, -10] } }],
              },
              tooltip: {
                sx: {
                  backgroundColor: theme.palette.surface.secondary.active,
                  border: `1px solid ${theme.palette.customBorder.territory.active}`,
                  borderRadius: 1,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
                  maxWidth: "250px",
                  padding: 1,
                },
              },
            }}
          >
            <Chip
              label={`+${remainingTags.length}`}
              sx={getChipStyles({
                color: theme.palette.customText.primary.p3.active,
                isDarkMode: theme.palette.mode === "dark",
              })}
            />
          </Tooltip>
        )}
      </>
    );
  };

  const defaultCardSx: SxProps<Theme> = {
    width: "100%",
    height: "100%",
    borderRadius: 2,
    boxShadow: "none",
    position: "relative",
    border: `1px solid ${theme.palette.customBorder.territory.active}`,
    background: theme.palette.surface.secondary.active,
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    transition: "transform 0.2s ease",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: `0 2px 6px 1px ${theme.palette.shadow.primary.active}`,
    },
  };

  const mergedCardSx = Array.isArray(cardSx)
    ? [defaultCardSx, ...cardSx]
    : [defaultCardSx, cardSx || {}];

  return (
    <Card onClick={isClickable ? handleLaunchClick : undefined} sx={mergedCardSx}>
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
              <Favorite sx={{ fontSize: 24, color: theme.palette.error.main }} />
            ) : (
              <FavoriteBorder
                sx={{
                  fontSize: 24,
                  color: theme.palette.customText.primary.p3.active,
                  "&:hover": { color: theme.palette.error.main },
                }}
              />
            )}
          </IconButton>
        </Box>

        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontSize: "16px",
            color: theme.palette.customText.primary.p2.active,
          }}
        >
          {title}
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: theme.palette.customText.primary.p3.active,
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
            marginTop: "auto",
            gap: 2,
            width: "100%",
          }}
        >
          <Box
            sx={{
              display: "flex",
              gap: 1,
              width: "100%",
            }}
          >
            {renderTags()}
          </Box>

          <Box sx={{ display: "flex", gap: 2, flexShrink: 0 }}>
            <Launch
              sx={{
                fontSize: 20,
                cursor: "pointer",
                color: theme.palette.customText.primary.p3.active,
                "&:hover": { color: theme.palette.customText.secondary.p2.active },
              }}
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
