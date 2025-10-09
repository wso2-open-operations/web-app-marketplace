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
  Chip,
  Collapse,
} from "@mui/material";
import { Search, Close } from "@mui/icons-material";

import { useState, useEffect } from "react";

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
  isOpen: boolean;
  onToggle: () => void;
}

export default function SearchBar({
  onSearchChange,
  onTagsChange,
  availableTags,
  selectedTags,
  isOpen,
  onToggle,
}: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTags, setFilteredTags] = useState<Tag[]>(availableTags);

  // Filter tags based on search input
  useEffect(() => {
    if (searchTerm) {
      const filtered = availableTags.filter((tag) =>
        tag.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTags(filtered);
    } else {
      setFilteredTags(availableTags);
    }
  }, [searchTerm, availableTags]);

  // Handle keyboard shortcut (⌘F or Ctrl+F)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "f") {
        event.preventDefault();
        onToggle();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onToggle]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onSearchChange(value);
  };

  const handleTagToggle = (tagId: number) => {
    const newSelectedTags = selectedTags.includes(tagId)
      ? selectedTags.filter((id) => id !== tagId)
      : [...selectedTags, tagId];
    onTagsChange(newSelectedTags);
  };

  const handleTagRemove = (tagId: number) => {
    const newSelectedTags = selectedTags.filter((id) => id !== tagId);
    onTagsChange(newSelectedTags);
  };

  // Sort tags: selected first, then alphabetically
  const sortedTags = [...filteredTags].sort((a, b) => {
    const aSelected = selectedTags.includes(a.id);
    const bSelected = selectedTags.includes(b.id);

    if (aSelected && !bSelected) return -1;
    if (!aSelected && bSelected) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <Box
      sx={{
        mb: 3,
        maxWidth: "500px",
        borderRadius: 2,
        boxShadow: isOpen ? "0 2px 8px rgba(0,0,0,0)" : "",
        backgroundColor: "hsla(0, 0%, 99%, 1)",
        border: isOpen ? "1px solid #e6e6e6" : "",
        overflow: "hidden",
      }}
    >
      {/* Compact Search Bar */}
      <Paper
        sx={{
          display: "flex",
          alignItems: "center",
          paddingY: "8px",
          paddingLeft: "12px",
          paddingRight: "16px",
          borderRadius: isOpen ? "0px" : "12px",
          border: `1px solid ${isOpen ? "hsla(0, 0%, 99%, 1)" : "#e6e6e6"}`,
          borderBottom: isOpen ? "1px solid #e6e6e6" : "1px solid #e6e6e6",
          backgroundColor: "hsla(0, 0%, 99%, 1)",
          boxShadow: "0 4px 12px rgba(0,0,0,0)",
          transition: "all 0.3s ease",
        }}
      >
        <IconButton
          sx={{ p: 0.5, mr: 1 }}
          onClick={onToggle}
          aria-label="toggle search"
        >
          <Search sx={{ fontSize: 20, color: "#718096" }} />
        </IconButton>

        <InputBase
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          onFocus={() => {
            !isOpen && onToggle();
          }}
          sx={{
            flex: 1,
            fontSize: "14px",
            color: "#2d3748",
          }}
        />

        {!isOpen ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              color: "#a0aec0",
              fontSize: "12px",
              fontWeight: 500,
            }}
          >
            <Box component="span">⌘</Box>
            <Box component="span">F</Box>
          </Box>
        ) : (
          <IconButton onClick={onToggle} size="small" sx={{ p: 0.5 }}>
            <Close sx={{ fontSize: 20, color: "#718096" }} />
          </IconButton>
        )}
      </Paper>

      {/* Expanded Categories Section */}
      <Collapse in={isOpen}>
        <Paper
          sx={{
            p: 3,
            borderRadius: 3,
            boxShadow: "0 4px 12px rgba(0,0,0,0)",
            backgroundColor: "hsla(0, 0%, 99%, 1)",
          }}
        >
          {/* Categories Section */}
          <Box>
            <Box
              sx={{
                fontSize: "14px",
                fontWeight: 600,
                color: "#2d3748",
                mb: 2,
              }}
            >
              Categories
            </Box>
            <Box 
              sx={{ 
                display: "flex", 
                gap: 1.5,
                overflowX: "auto",
                overflowY: "hidden",
                paddingBottom: 2,
                "&::-webkit-scrollbar": {
                  height: 4,
                },
                "&::-webkit-scrollbar-track": {
                  backgroundColor: "#f1f1f1",
                  borderRadius: 3,
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "#c1c1c1",
                  borderRadius: 3,
                  "&:hover": {
                    backgroundColor: "#a8a8a8",
                  },
                },
              }}
            >
              {sortedTags.map((tag) => {
                const isSelected = selectedTags.includes(tag.id);
                return (
                  <Chip
                    key={tag.id}
                    label={tag.name}
                    onClick={() => handleTagToggle(tag.id)}
                    onDelete={
                      isSelected ? () => handleTagRemove(tag.id) : undefined
                    }
                    icon={
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          backgroundColor: "#000",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "12px",
                        }}
                      >
                        👤
                      </Box>
                    }
                    sx={{
                      backgroundColor: isSelected ? "#f7fafc" : "transparent",
                      border: isSelected
                        ? "2px solid #000"
                        : "1px solid #e2e8f0",
                      borderRadius: "20px",
                      fontWeight: 500,
                      fontSize: "14px",
                      px: 1.5,
                      py: 2.5,
                      transition: "all 0.2s ease",
                      flexShrink: 0, // Prevent chips from shrinking
                      whiteSpace: "nowrap", // Prevent text wrapping
                      "&:hover": {
                        backgroundColor: "#f7fafc",
                        borderColor: "#000",
                      },
                      "& .MuiChip-label": {
                        px: 1,
                      },
                    }}
                  />
                );
              })}
            </Box>
          </Box>
        </Paper>
      </Collapse>
    </Box>
  );
}
