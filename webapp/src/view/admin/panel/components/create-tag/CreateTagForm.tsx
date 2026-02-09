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
import { Box, Button, TextField, Typography, useTheme } from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";

import { useCreateTagMutation } from "@root/src/services/tag.api";
import { useGetUserInfoQuery } from "@root/src/services/user.api";

interface CreateTagFormValues {
  name: string;
  color: string;
}

const initialValues: CreateTagFormValues = {
  name: "",
  color: "",
};

const validationSchema = Yup.object({
  name: Yup.string().required("Tag name is required"),
  color: Yup.string()
    .required("Tag color is required")
    .matches(
      /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
      "Must be a valid hex color (e.g., #F5F5F5 or #FFF)",
    ),
});

export default function CreateTagForm() {
  const theme = useTheme();
  const { data: userInfo } = useGetUserInfoQuery();
  const [createTagMutation, { isLoading: isCreating }] = useCreateTagMutation();
  const userEmail = userInfo?.workEmail ?? "";

  const formik = useFormik<CreateTagFormValues>({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      const requestPayload = {
        name: values.name,
        color: values.color,
        addedBy: userEmail,
      };

      try {
        await createTagMutation(requestPayload).unwrap();
        formik.resetForm();
      } catch (error) {
        console.error("Failed to create tag:", error);
      }
    },
  });

  return (
    <Box sx={{ width: "100%", display: "flex", gap: 2, flexDirection: "column" }}>
      <Typography
        variant="h6"
        sx={{
          color: theme.palette.customText.primary.p2.active,
        }}
      >
        Add Tags
      </Typography>

      <form onSubmit={formik.handleSubmit}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2.5,
            color: theme.palette.customText.primary.p2.active,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            <Typography variant="body1">Tag Name</Typography>

            <TextField
              fullWidth
              name="name"
              placeholder="Sample Tag"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
              disabled={isCreating}
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
              disabled={isCreating}
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
            disabled={isCreating}
            onClick={() => {
              formik.resetForm();
            }}
            variant="outlined"
          >
            Cancel
          </Button>

          <Button type="submit" variant="contained" disabled={isCreating || !formik.isValid}>
            {isCreating ? "Creating..." : "Create Tag"}
          </Button>
        </Box>
      </form>
    </Box>
  );
}
