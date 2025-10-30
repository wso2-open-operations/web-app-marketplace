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
} from "@mui/material";
import { Favorite, FavoriteBorder, Launch } from "@mui/icons-material";

import { useEffect, useState } from "react";

import { useAppDispatch } from "@root/src/slices/store";
import { upsertAppFavourite, Tag } from "@root/src/slices/appSlice/app";
import { UpdateAction } from "@root/src/types/types";

interface AppCardProps {
  title: string;
  description: string;
  logoUrl: string;
  tags: Tag[];
  appUrl: string;
  logoAlt?: string;
  isFavourite?: number;
  appId: number;
  cardSx?:SxProps<Theme>;
  isClickable?:boolean
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
  isClickable = true
}: AppCardProps) {
  const [isFavorite, setIsFavorite] = useState(isFavourite === 1);
  const dispatch = useAppDispatch();

  const [imageError, setImageError] = useState(false);
  const [isSvg, setIsSvg] = useState(false);

  useEffect(() => {
    setIsSvg(logoUrl.toLowerCase().endsWith(".svg"));
    setImageError(false);
  }, [logoUrl]);

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

    // Check if logoUrl contains SVG markup instead of a file path
    const isRawSvg =
      logoUrl.includes("<svg") ||
      logoUrl.includes("<rect") ||
      logoUrl.includes("<path");

    if (isBase64) {
      return (
        <Box
          component="img"
          src={logoUrl}
          alt={logoAlt}
          onError={() => setImageError(true)}
          sx={{
            height: 40,
            width: "auto",
            maxWidth: 40,
            objectFit: "contain",
          }}
        />
      );
    }

    if (isRawSvg) {
      // Handle raw SVG content
      return (
        <Box
          sx={{
            height: 40,
            width: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          dangerouslySetInnerHTML={{
            __html: logoUrl.startsWith("<svg")
              ? logoUrl
              : `<svg width="40" height="40" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">${logoUrl}</svg>`,
          }}
        />
      );
    }

    // Handle regular image files (PNG, SVG files, etc.)
    return (
      <Box
        component="img"
        src={logoUrl}
        alt={logoAlt}
        onError={() => setImageError(true)}
        sx={{
          height: 40,
          width: "auto",
          maxWidth: 40,
          objectFit: "contain",
          ...(isSvg && {
            filter: "none",
          }),
        }}
      />
    );
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
          }}
        >
          <Box
            sx={{
              display: "flex",
              gap: 1,
              flex: 1,
              overflowX: "auto",
              overflowY: "hidden",
              scrollbarWidth: "thin",
              scrollbarColor: "transparent transparent",
              "&:hover": {
                scrollbarColor: "#cbd5e0 #f7fafc",
              },
              "&::-webkit-scrollbar": {
                height: "3px",
              },
              "&::-webkit-scrollbar-track": {
                background: "transparent",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "transparent",
                borderRadius: "3px",
              },
              "&:hover::-webkit-scrollbar-thumb": {
                background: "#cbd5e0",
              },
              "&::-webkit-scrollbar-thumb:hover": {
                background: "#a0aec0",
              },
              flexWrap: "nowrap",
              scrollBehavior: "smooth",
            }}
          >
            {tags.map((tag) => (
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
            ))}
          </Box>
          <Box sx={{ display: "flex", gap: 2, flexShrink: 0 }}>
            <Launch sx={{ fontSize: 20, color: "#718096" }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
