import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  IconButton,
} from "@mui/material";
import {
  Favorite,
  FavoriteBorder,
  Launch,
  Visibility,
} from "@mui/icons-material";
import { useState } from "react";

interface AppCardProps {
  title: string;
  description: string;
  logoUrl: string;
  category: string;
  appUrl: string;
  logoAlt?: string;
}

export default function AppCard({
  title,
  description,
  logoUrl,
  category,
  appUrl,
  logoAlt = "App Logo",
}: AppCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  const handleFavoriteClick = () => {
    setIsFavorite(!isFavorite);
  };

  const handleLaunchClick = () => {
    window.open(appUrl, "_blank", "noopener,noreferrer");
  };

  const handleViewClick = () => {
    // You can implement view logic here
    console.log("View clicked for:", title);
  };

  return (
    <Card
      sx={{
        maxWidth: 500,
        width: "100%",
        borderRadius: 4,
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        padding: 2,
        position: "relative",
      }}
    >
      <CardContent>
        {/* Header with logo and favorite icon */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 3,
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
              <Favorite sx={{ fontSize: 32, color: "#e53e3e" }} />
            ) : (
              <FavoriteBorder sx={{ fontSize: 32, color: "#a0aec0" }} />
            )}
          </IconButton>
        </Box>

        {/* Title */}
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 600,
            mb: 2,
            color: "#1a202c",
          }}
        >
          {title}
        </Typography>

        {/* Description */}
        <Typography
          variant="body1"
          sx={{
            color: "#718096",
            mb: 4,
            lineHeight: 1.6,
          }}
        >
          {description}
        </Typography>

        {/* Footer with tag and action icons */}
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
              <Launch sx={{ fontSize: 32, color: "#718096" }} />
            </IconButton>
            <IconButton
              onClick={handleViewClick}
              sx={{
                padding: 0.5,
                "&:hover": { backgroundColor: "transparent" },
              }}
              aria-label="View app details"
            >
              <Visibility sx={{ fontSize: 32, color: "#718096" }} />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
