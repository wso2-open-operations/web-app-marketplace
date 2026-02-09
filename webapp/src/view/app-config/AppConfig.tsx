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
import { Autocomplete, Box, Button, TextField, Typography, useTheme } from "@mui/material";

import { useEffect, useState } from "react";

import ErrorHandler from "@root/src/component/common/ErrorHandler";
import PreLoader from "@root/src/component/common/PreLoader";
import { useGetThemeQuery, useSetThemeMutation } from "@root/src/services/config.api";

export default function AppConfig() {
  const theme = useTheme();
  const [selectedTheme, setSelectedTheme] = useState<string>();
  const { data: currentThemeConfig, isLoading, isError } = useGetThemeQuery();
  const [setThemeQuery] = useSetThemeMutation();

  useEffect(() => {
    if (currentThemeConfig?.activeThemeName) setSelectedTheme(currentThemeConfig.activeThemeName);
  }, [currentThemeConfig?.activeThemeName]);

  if (isLoading) {
    return <PreLoader message="Loading theme data" />;
  }

  if (isError || !currentThemeConfig)
    return <ErrorHandler message={"Error when retrieving theme"} />;

  const themeOptions = Object.values(currentThemeConfig.themes).map((theme) => theme.name);

  const setTheme = (selectedTheme: string) => {
    setThemeQuery(selectedTheme);
  };

  const themeNames: string[] = themeOptions;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="h6" sx={{ color: theme.palette.customText.primary.p1.active }}>
        App Configs
      </Typography>

      <Typography variant="body1" sx={{ color: theme.palette.customText.primary.p2.active }}>
        Seasonal Theme
      </Typography>

      <Box sx={{ display: "flex", gap: 2 }}>
        <Autocomplete
          disablePortal
          options={themeNames}
          value={selectedTheme}
          onChange={(_, option) => setSelectedTheme(option ?? "")}
          sx={{ width: 300 }}
          renderInput={(params) => <TextField {...params} label="Theme" />}
        />

        <Button
          variant="outlined"
          onClick={() => {
            if (!selectedTheme) return;
            setTheme(selectedTheme);
          }}
        >
          Set Theme
        </Button>
      </Box>
    </Box>
  );
}
