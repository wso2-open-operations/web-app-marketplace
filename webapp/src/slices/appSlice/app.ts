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

import { State } from "@/types/types";
import { SnackMessage } from "@config/constant";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AppConfig } from "@root/src/config/config";
import { APIService } from "@root/src/utils/apiService";
import { enqueueSnackbarMessage } from "@slices/commonSlice/common";
import axios, { HttpStatusCode } from "axios";

export type AppLinks = {
  id: number;
  header: string;
  urlName: string;
  description: string;
  versionName: string;
  tagId: number;
  iconName: string;
  addedBy: string;
  isFavourite: 0 | 1;
};

interface AppLinksState {
  state: State;
  stateMessage: string | null;
  errorMessage: string | null;
  apps: AppLinks | null;
}

const initialState: AppLinksState = {
  state: State.idle,
  stateMessage: null,
  errorMessage: null,
  apps: null,
};

interface UpdateArgs {
  id: number;
  active: 1 | 0;
}

export const fetchAppLinks = createAsyncThunk(
  "appLinks/fetchAppLinks",
  async (_, { dispatch, rejectWithValue }) => {
    APIService.getCancelToken().cancel();
    const newCancelTokenSource = APIService.updateCancelToken();

    return new Promise<AppLinks>((resolve, reject) => {
      APIService.getInstance()
        .get(AppConfig.serviceUrls.appLinks, {
          cancelToken: newCancelTokenSource.token,
        })
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          if (axios.isCancel(error)) {
            return rejectWithValue("Request Canceled");
          }

          dispatch(
            enqueueSnackbarMessage({
              message:
                error.response?.status === HttpStatusCode.InternalServerError
                  ? SnackMessage.error.fetchAppLinks
                  : "An unknown error occured",
              type: "error",
            })
          );
          reject(error.response.data.message);
        });
    });
  }
);

export const updateAppFavourite = createAsyncThunk<
  { id: number; active: 0 | 1 },
  UpdateArgs
>(
  "apps/updateAppFavourite",
  async ({ id, active }, { dispatch, rejectWithValue }) => {
    APIService.getCancelToken().cancel();
    const newCancelTokenSource = APIService.updateCancelToken();

    try {
      const normalized =
        typeof active === "boolean" ? (active ? 1 : 0) : active;

      const res = await APIService.getInstance().patch(
        AppConfig.serviceUrls.appLinks,
        {
          cancelToken: newCancelTokenSource.token,
          params: {
            id: String(id),
            active: String(normalized),
          },
        }
      );

      return { id: Number(id), active: normalized as 0 | 1 };
    } catch (error: any) {
      if (axios.isCancel(error)) {
        return rejectWithValue("Request Canceled");
      }

      const message =
        error?.response?.data?.message ??
        (error?.response?.status === HttpStatusCode.InternalServerError
          ? "Server error while updating"
          : "Failed to update");

      dispatch(
        enqueueSnackbarMessage({
          message,
          type: "error",
        })
      );
      return rejectWithValue(message);
    }
  }
);

export const appLinksSlice = createSlice({
  name: "apps",
  initialState,
  reducers: {
    resetSubmitState(state) {
      state.state = State.idle;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchAppLinks.pending, (state) => {
        state.state = State.loading;
        state.stateMessage = "Fetching app links...";
      })

      .addCase(fetchAppLinks.fulfilled, (state, action) => {
        state.state = State.success;
        state.stateMessage = "Successfully fetched";
        state.apps = action.payload;
      })

      .addCase(fetchAppLinks.rejected, (state) => {
        state.state = State.failed;
        state.stateMessage = "Failed to fetch";
      });
  },
});

export const { resetSubmitState } = appLinksSlice.actions;
export default appLinksSlice.reducer;
