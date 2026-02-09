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
import { Box, FormControlLabel, Switch, Typography, useTheme } from "@mui/material";
import { FormikProps } from "formik";

import { memo } from "react";

interface AppStatusToggleProps {
  formik: FormikProps<any>;
  isDisabled: boolean;
}

const AppStatusToggle = ({ formik, isDisabled }: AppStatusToggleProps) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1,
        color: theme.palette.customText.primary.p2.active,
      }}
    >
      <Typography>App Status</Typography>

      <FormControlLabel
        sx={{ ml: "0px" }}
        label={
          <Typography
            variant="body1"
            sx={{
              ml: 1.5,
              fontWeight: 500,
              color: theme.palette.customText.primary.p2.active,
            }}
          >
            {formik.values.isActive ? "Active" : "Not Active"}
          </Typography>
        }
        labelPlacement="end"
        control={
          <Switch
            checked={formik.values.isActive}
            onChange={(e) => formik.setFieldValue("isActive", e.target.checked)}
            disabled={isDisabled}
          />
        }
      />
    </Box>
  );
};

export default memo(AppStatusToggle);
