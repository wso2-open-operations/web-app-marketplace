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
// RTK Query API for application configuration endpoints
import { createApi } from "@reduxjs/toolkit/query/react";

import { AppConfig } from "@config/config";

import { enqueueSnackbarMessage } from "@slices/commonSlice/common";
import { baseQueryWithRetry } from "./BaseQuery";

interface SupportTeamEmail {
  team: string;
  email: string;
}

export interface AppConfigInfo {
  supportTeamEmails: SupportTeamEmail[];
}

export enum Themes {
  DEFAULT_THEME = "default",
  XMAS_THEME = "christmas",
}

export interface Theme {
  name: string;
  label: string;
}

export interface ThemeConfig {
  activeThemeName: string;
  themes: Record<string, Theme>;
}

export interface UpdateTheme {
  activeThemeName: string;
}

export const configApi = createApi({
  reducerPath: "configApi",
  baseQuery: baseQueryWithRetry,
  tagTypes: ["Config", "Theme"],
  endpoints: (builder) => ({
    getAppConfig: builder.query<AppConfigInfo, void>({
      query: () => AppConfig.serviceUrls.appConfig,
      providesTags: ["Config"],
    }),
    setTheme: builder.mutation<void, string>({
      query: (activeTheme) => ({
        url: AppConfig.serviceUrls.theme,
        method: "PUT",
        body: { activeThemeName: activeTheme },
        headers: { "Content-Type": "application/json" },
      }),
      invalidatesTags: ["Theme"],
      async onQueryStarted(activeTheme, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(
            enqueueSnackbarMessage({
              message: `Theme successfully changed to '${activeTheme}'`,
              type: "success",
            }),
          );
        } catch (error: any) {
          dispatch(
            enqueueSnackbarMessage({
              message: `Failed to change theme.`,
              type: "error",
            }),
          );
        }
      },
    }),
    getTheme: builder.query<ThemeConfig | null, void>({
      query: () => AppConfig.serviceUrls.theme,
      providesTags: ["Theme"],
    }),
  }),
});

export const { useGetAppConfigQuery, useSetThemeMutation, useGetThemeQuery } = configApi;
