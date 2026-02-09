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
import { Autocomplete, Box, TextField, Typography, useTheme } from "@mui/material";
import { FormikProps } from "formik";

import { memo } from "react";

interface UserGroupSelectorProps {
  formik: FormikProps<any>;
  groups: string[];
  isDisabled: boolean;
}

const UserGroupSelector = ({ formik, groups, isDisabled }: UserGroupSelectorProps) => {
  const theme = useTheme();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography
        variant="body1"
        sx={{ ml: 0.5, color: theme.palette.customText.primary.p2.active }}
      >
        User Groups
      </Typography>

      <Autocomplete
        multiple
        options={groups || []}
        getOptionLabel={(option) => option}
        value={formik.values.groupIds}
        onChange={(_, newValue) => {
          formik.setFieldValue("groupIds", newValue);
        }}
        onBlur={formik.handleBlur}
        disabled={isDisabled}
        renderInput={(params) => (
          <TextField
            {...params}
            name="groupIds"
            placeholder="Select user groups"
            error={formik.touched.groupIds && Boolean(formik.errors.groupIds)}
            helperText={formik.touched.groupIds && (formik.errors.groupIds as string)}
          />
        )}
      />
    </Box>
  );
};

export default memo(UserGroupSelector);
