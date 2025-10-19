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
  Box,
  InputBase,
  Paper,
  IconButton,
  Popover,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import { Close, KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import { Search } from 'lucide-react';

import { useState, useEffect, useRef } from "react";

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
  isOpen?: boolean;
  onToggle?: () => void;
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

  const isTagsOpen = Boolean(anchorEl);

  // Handle keyboard shortcut (⌘F or Ctrl+F)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "f") {
        event.preventDefault();
        // Focus on search input
        const searchInput = document.querySelector('input[placeholder="Search"]') as HTMLInputElement;
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
          width: "800px",
          display: "flex",
          alignItems: "center",
          paddingY: "12px",
          paddingLeft: "16px",
          paddingRight: "16px",
          borderRadius: "12px",
          border: "1px solid #e6e6e6",
          backgroundColor: "#ffffff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          transition: "all 0.2s ease",
          "&:focus-within": {
            borderColor: "#cbd5e0",
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
          },
        }}
      >
        <IconButton
          sx={{ p: 0.5, mr: "4px" }}
          aria-label="search"
          disabled
        >
          <Search style={{color: "#00000099"}} />
        </IconButton>

        <InputBase
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          sx={{
            flex: 1,
            fontSize: "14px",
            color: "text.secondary",
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
            transition: "background-color 0.2s ease",
            "&:hover": {
              backgroundColor: "#f7fafc",
            },
          }}
        >
          <Typography
            sx={{
              fontSize: "14px",
              color: "text.secondary",
              fontWeight: 500,
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
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              border: "1px solid #e6e6e6",
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
                "&:hover": {
                  backgroundColor: "#f7fafc",
                },
              }}
            >
              <ListItemText
                primary="ALL"
                primaryTypographyProps={{
                  fontSize: "14px",
                  fontWeight: selectedTags.length === 0 ? 600 : 400,
                  color: selectedTags.length === 0 ? "text.secondary" : "#9CA3AF",
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
                        color: "#9CA3AF",
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
                    "&:hover": {
                      backgroundColor: "#f7fafc",
                    },
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
