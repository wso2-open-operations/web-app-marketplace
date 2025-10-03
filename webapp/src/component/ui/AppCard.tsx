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

  return (
    <Card
      sx={{
        maxWidth: 500,
        width: "100%",
        borderRadius: 4,
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        position: "relative",
      }}
    >
      <CardContent
        sx={{
          padding: 3,
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
              backgroundColor: "transparent",
              border: "2px solid #ed8936",
              color: "#ed8936",
              fontWeight: 600,
              fontSize: "0.9rem",
              padding: "4px 8px",
              height: "auto",
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
