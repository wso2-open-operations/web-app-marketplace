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
import { createApi } from "@reduxjs/toolkit/query/react";

import { AppConfig } from "@config/config";

import { enqueueSnackbarMessage } from "@slices/commonSlice/common";
import { baseQueryWithRetry } from "./BaseQuery";

export type Tag = {
  id: number;
  name: string;
  color: string;
};

export type CreateTagPayload = {
  name: string;
  color: string;
  addedBy: string;
};

interface CreateTagResponse {
  message: string;
}

export const tagApi = createApi({
  reducerPath: "tagApi",
  baseQuery: baseQueryWithRetry,
  tagTypes: ["Tags"],
  endpoints: (builder) => ({
    getTags: builder.query<Tag[], void>({
      query: () => AppConfig.serviceUrls.tags,
      providesTags: ["Tags"],
    }),
    createTag: builder.mutation<CreateTagResponse, CreateTagPayload>({
      query: (payload) => ({
        url: AppConfig.serviceUrls.tags,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Tags"],
      async onQueryStarted(_payload, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(
            enqueueSnackbarMessage({
              message: `Tag '${_payload.name}' successfully created`,
              type: "success",
            }),
          );
        } catch (error: any) {
          dispatch(
            enqueueSnackbarMessage({
              message: `Failed to create tag '${_payload.name}'.`,
              type: "error",
            }),
          );
        }
      },
    }),
  }),
});

export const { useGetTagsQuery, useLazyGetTagsQuery, useCreateTagMutation } = tagApi;
