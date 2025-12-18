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
import { Close, KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import {
  Box,
  IconButton,
  InputBase,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Popover,
  Typography,
  useTheme,
} from "@mui/material";
import { Search } from "lucide-react";

import { useEffect, useRef, useState } from "react";

interface Tag {
  id: number;
  name: string;
  color: string;
}

interface SearchBarProps {
  onSearchChange: (searchTerm: string) => void;
  onTagsChange: (selectedTagIds: number[]) => void;
  availableTags: Tag[];
  selectedTags: number[];
}

export default function SearchBar({
  onSearchChange,
  onTagsChange,
  availableTags,
  selectedTags,
}: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const tagsButtonRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();

  const isTagsOpen = Boolean(anchorEl);

  // Handle keyboard shortcut (⌘F or Ctrl+F)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "f") {
        event.preventDefault();
        // Focus on search input
        const searchInput = document.querySelector(
          'input[placeholder="Search"]',
        ) as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onSearchChange(value);
  };

  const handleTagsClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(tagsButtonRef.current);
  };

  const handleTagsClose = () => {
    setAnchorEl(null);
  };

  const handleTagToggle = (tagId: number) => {
    const newSelectedTags = selectedTags.includes(tagId)
      ? selectedTags.filter((id) => id !== tagId)
      : [...selectedTags, tagId];
    onTagsChange(newSelectedTags);
  };

  const handleTagRemove = (tagId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    const newSelectedTags = selectedTags.filter((id) => id !== tagId);
    onTagsChange(newSelectedTags);
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "100%",
        borderRadius: 2,
      }}
    >
      {/* Search Bar */}
      <Paper
        sx={{
          width: "100%",
          maxWidth: "650px",
          display: "flex",
          alignItems: "center",
          paddingY: "8px",
          paddingLeft: "8px",
          paddingRight: "16px",
          borderRadius: "12px",
          border: `1px solid ${theme.palette.customBorder.territory.active}`,
          background: theme.palette.surface.territory.active,
          boxShadow: "none",
          "&:focus-within": {
            // border: `1px solid ${theme.palette.customBorder.primary.active}`,
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
          },
        }}
      >
        <IconButton sx={{ p: 0.5, mr: "4px" }} aria-label="search" disabled>
          <Search style={{ color: theme.palette.customText.primary.p3.active }} />
        </IconButton>

        <InputBase
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          sx={{
            flex: 1,
            fontSize: "14px",
            color: theme.palette.customText.primary.p2.active,
          }}
        />

        {/* Tags Dropdown Button */}
        <Box
          ref={tagsButtonRef}
          onClick={handleTagsClick}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            cursor: "pointer",
            padding: "4px 8px",
            borderRadius: "6px",
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.customText.primary.p2.active,
            }}
          >
            Tags
          </Typography>
          {isTagsOpen ? (
            <KeyboardArrowUp sx={{ fontSize: 18, color: "#9CA3AF" }} />
          ) : (
            <KeyboardArrowDown sx={{ fontSize: 18, color: "#9CA3AF" }} />
          )}
        </Box>

        {/* Keyboard Shortcut Hint */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            color: "#9CA3AF",
            fontSize: "12px",
            fontWeight: 500,
            ml: 1,
          }}
        >
          <Box component="span">⌘</Box>
          <Box component="span">F</Box>
        </Box>
      </Paper>

      {/* Tags Popover Dropdown */}
      <Popover
        open={isTagsOpen}
        anchorEl={anchorEl}
        onClose={handleTagsClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        sx={{
          mt: 1,
        }}
        slotProps={{
          paper: {
            sx: {
              minWidth: 200,
              maxWidth: 400,
              maxHeight: 400,
              borderRadius: "8px",
              border: `1px solid ${theme.palette.customBorder.territory.active}`,
            },
          },
        }}
      >
        <List sx={{ py: 0 }}>
          {/* ALL Option - treat as first tag */}
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => onTagsChange([])}
              sx={{
                py: 1.5,
                px: 2,
                backgroundColor: "transparent",
              }}
            >
              <ListItemText
                primary="ALL"
                sx={{
                  fontSize: "14px",
                  fontWeight: selectedTags.length === 0 ? 600 : 500,
                  color:
                    selectedTags.length === 0
                      ? theme.palette.customText.primary.p2.active
                      : theme.palette.customText.primary.p3.active,
                }}
              />
            </ListItemButton>
          </ListItem>

          {/* Regular Tag Options */}
          {availableTags.map((tag) => {
            const isSelected = selectedTags.includes(tag.id);
            return (
              <ListItem
                key={tag.id}
                disablePadding
                secondaryAction={
                  isSelected ? (
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={(e) => handleTagRemove(tag.id, e)}
                      sx={{
                        "&:hover": {
                          color: "text.secondary",
                        },
                      }}
                    >
                      <Close sx={{ fontSize: 18 }} />
                    </IconButton>
                  ) : null
                }
              >
                <ListItemButton
                  onClick={() => handleTagToggle(tag.id)}
                  sx={{
                    py: 1.5,
                    px: 2,
                    borderBottom: isSelected ? "none" : "1px solid #f0f0f0",
                    backgroundColor: "transparent",
                    "&:last-child": {
                      borderBottom: "none",
                    },
                  }}
                >
                  <ListItemText
                    primary={tag.name}
                    primaryTypographyProps={{
                      fontSize: "14px",
                      fontWeight: isSelected ? 600 : 400,
                      color: isSelected ? "text.secondary" : "#9CA3AF",
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Popover>
    </Box>
  );
}
