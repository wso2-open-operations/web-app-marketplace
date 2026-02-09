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
import { Box, TextField, Typography, useTheme } from "@mui/material";
import { FormikProps } from "formik";

export interface CreateAppFormValues {
  title: string;
  description: string;
  link: string;
  versionName: string;
  tags: number[];
  groupIds: string[];
  icon: File | null;
  isActive: boolean;
}

type TextFieldName = "title" | "description" | "link" | "versionName";

interface LabeledTextFieldProps {
  formik: FormikProps<CreateAppFormValues>;
  name: TextFieldName;
  label: string;
  placeholder?: string;
  disabled?: boolean;
  multiline?: boolean;
  rows?: number;
}

export default function LabeledTextField({
  formik,
  name,
  label,
  placeholder,
  disabled = false,
  multiline = false,
  rows,
}: LabeledTextFieldProps) {
  const theme = useTheme();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, width: "100%" }}>
      <Typography
        variant="body1"
        sx={{ ml: 0.5, color: theme.palette.customText.primary.p2.active }}
      >
        {label}
      </Typography>

      <TextField
        fullWidth
        name={name}
        placeholder={placeholder}
        value={formik.values[name]}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched[name] && Boolean(formik.errors[name])}
        helperText={formik.touched[name] && (formik.errors[name] as string)}
        disabled={disabled}
        multiline={multiline}
        rows={rows}
      />
    </Box>
  );
}
