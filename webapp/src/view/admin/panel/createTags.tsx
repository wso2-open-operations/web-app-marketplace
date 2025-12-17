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
import { Box, Button, Chip, TextField, Typography } from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";

import { RootState, useAppDispatch, useAppSelector } from "@root/src/slices/store";
import { State } from "@root/src/types/types";
import { createTags, fetchTags } from "@slices/tagSlice/tag";

interface Tag {
  name: string;
  color: string;
}

const validationSchema = Yup.object({
  name: Yup.string().required("Tag name is required"),
  color: Yup.string()
    .required("Tag color is required")
    .matches(
      /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
      "Must be a valid hex color (e.g., #F5F5F5 or #FFF)",
    ),
});

export default function CreateTags() {
  const { submitState, tags } = useAppSelector((state: RootState) => state.tag);
  const dispatch = useAppDispatch();
  const userInfo = useAppSelector((state: RootState) => state.user.userInfo);
  const userEmail = userInfo?.workEmail ?? "";

  const formik = useFormik<Tag>({
    initialValues: {
      name: "",
      color: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      const requestPayload = {
        name: values.name,
        color: values.color,
        addedBy: userEmail,
      };

      const result = await dispatch(createTags(requestPayload));

      if (createTags.fulfilled.match(result)) {
        formik.resetForm();
        dispatch(fetchTags());
      }
    },
  });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Typography
          variant="h6"
          sx={{
            color: "text.secondary",
            textDecoration: "underline",
            textDecorationColor: "text.secondary",
            textDecorationThickness: "1px",
            textUnderlineOffset: "2px",
          }}
        >
          Existing Tags
        </Typography>
        <Box
          sx={{
            flex: 2,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "bottom",
            gap: 1,
          }}
        >
          {tags?.map((tag, index) => (
            <Chip
              key={index}
              sx={{
                "& .MuiChip-label": {
                  fontSize: "12px",
                },
                color: "text.tertiary",
                borderRadius: 2,
              }}
              variant="outlined"
              size="small"
              label={tag.name}
            />
          ))}
        </Box>
      </Box>
      <Box sx={{ maxWidth: "600px" }}>
        <form onSubmit={formik.handleSubmit}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Typography variant="body1">Tag Name</Typography>
              <TextField
                fullWidth
                name="name"
                placeholder="People App"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
                disabled={submitState === State.loading}
              />
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Typography variant="body1">Tag Color</Typography>
              <TextField
                fullWidth
                name="color"
                placeholder="#F5F5F5"
                value={formik.values.color}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.color && Boolean(formik.errors.color)}
                helperText={formik.touched.color && formik.errors.color}
                disabled={submitState === State.loading}
              />
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              gap: 2,
              pt: 3,
            }}
          >
            <Button
              disabled={submitState === State.loading}
              onClick={() => {
                formik.resetForm();
              }}
              variant="outlined"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="contained"
              disabled={submitState === State.loading || !formik.isValid}
            >
              {submitState === State.loading ? "Creating..." : "Create Tag"}
            </Button>
          </Box>
        </form>
      </Box>
    </Box>
  );
}
