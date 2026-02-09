// Copyright (c) 2026 WSO2 LLC. (https://www.wso2.com).
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
import { Autocomplete, Box, Chip, TextField, Typography, useTheme } from "@mui/material";
import { FormikProps } from "formik";

import { memo } from "react";

import { Tag } from "@services/tag.api";

interface TagSelectorProps {
  formik: FormikProps<any>;
  tags: Tag[];
  isDisabled: boolean;
}

const TagSelector = ({ formik, tags, isDisabled }: TagSelectorProps) => {
  const theme = useTheme();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography
        variant="body1"
        sx={{ ml: 0.5, color: theme.palette.customText.primary.p2.active }}
      >
        Tags
      </Typography>

      <Autocomplete
        multiple
        options={tags || []}
        getOptionLabel={(option) => option.name}
        value={tags?.filter((t) => formik.values.tags.includes(t.id)) || []}
        onChange={(_, newValue) => {
          formik.setFieldValue(
            "tags",
            newValue.map((tag) => tag.id),
          );
        }}
        onBlur={formik.handleBlur}
        disabled={isDisabled}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip
              {...getTagProps({ index })}
              key={option.id}
              label={option.name}
              sx={{
                backgroundColor: option.color ? `${option.color}1A` : "#e0e0e0",
                border: option.color ? `2px solid ${option.color}80` : "2px solid #bdbdbd",
                color: option.color || "#424242",
                fontWeight: 500,
                "& .MuiChip-deleteIcon": {
                  color: option.color || "#424242",
                  "&:hover": {
                    color: option.color ? `${option.color}CC` : "#616161",
                  },
                },
              }}
            />
          ))
        }
        renderInput={(params) => (
          <TextField
            {...params}
            name="tags"
            placeholder="Select one or more tags"
            error={formik.touched.tags && Boolean(formik.errors.tags)}
            helperText={formik.touched.tags && (formik.errors.tags as string)}
          />
        )}
      />
    </Box>
  );
};

export default memo(TagSelector);
