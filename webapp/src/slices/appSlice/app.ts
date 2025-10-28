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

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { HttpStatusCode } from "axios";

import { AppConfig } from "@root/src/config/config";
import { APIService } from "@root/src/utils/apiService";
import { enqueueSnackbarMessage } from "@slices/commonSlice/common";
import { UpdateAction, State } from "@/types/types";
import { UserState } from "@slices/authSlice/auth";

export type Tag = {
  id: number;
  name: string;
  color: string;
};

export type UserApp = {
  id: number;
  name: string;
  url: string;
  description: string;
  versionName: string;
  icon: string;
  tags: Tag[];
  addedBy: string;
  isFavourite: 0 | 1;
};

export type App = {
  id: number;
  name: string;
  url: string;
  description: string;
  versionName: string;
  icon: string;
  tags: Tag[];
  userGroups?: string[]
  addedBy: string;
  isActive: boolean;
};

export type UpdateAppPayload = {
  id?: number;
  name?: string;
  url?: string;
  description?: string;
  versionName?: string;
  icon?: string;
  tags?: Tag[];
  userGroups?: string[]
  isActive?: boolean;
  updatedBy: string;
}

export type CreateAppPayload = {
  name: string;
  url: string;
  description: string;
  versionName: string;
  tags: number[];
  icon: string;
  userGroups: string[];
  isActive: boolean
};

interface AppState {
  state: State;
  stateMessage: string | null;
  apps: App[] | null;
  userApps: UserApp[] | null;
  submitState: State
}

const initialState: AppState = {
  state: State.idle,
  stateMessage: null,
  apps: null,
  userApps: null,
  submitState: State.idle
};

interface UpdateArgs {
  id: number;
  active: UpdateAction;
}

export const fetchApps = createAsyncThunk(
  "app/fetchApps",
  async (_, { getState, dispatch, rejectWithValue }) => {
    const { userInfo } = (getState() as { user: UserState }).user;

    APIService.getCancelToken().cancel();
    const newCancelTokenSource = APIService.updateCancelToken();

    try {
      const res = await APIService.getInstance().get<App[]>(AppConfig.serviceUrls.apps, {
        cancelToken: newCancelTokenSource.token
      });
      return res.data;

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

export const fetchUserApps = createAsyncThunk(
  "app/fetchUserApps",
  async (_, { getState, dispatch, rejectWithValue }) => {
    const { userInfo } = (getState() as { user: UserState }).user;

    APIService.getCancelToken().cancel();
    const newCancelTokenSource = APIService.updateCancelToken();

    try {
      const res = await APIService.getInstance().get<UserApp[]>(`${AppConfig.serviceUrls.apps}/${userInfo?.workEmail}`, {
        cancelToken: newCancelTokenSource.token
      });
      return res.data;

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

export const createApp = createAsyncThunk<void, { payload: CreateAppPayload, userEmail: string }>(
  "apps/createApp",
  async ({ payload, userEmail }, { dispatch, rejectWithValue }) => {
    APIService.getCancelToken().cancel();

    try {
      const requestBody = {
        name: payload.name,
        url: payload.url,
        description: payload.description,
        versionName: payload.versionName,
        tags: payload.tags,
        icon: payload.icon,
        addedBy: userEmail,
        userGroups: payload.userGroups,
        isActive: payload.isActive
      };

      const res = await APIService.getInstance().post(
        AppConfig.serviceUrls.apps,
        requestBody,
      );

      dispatch(
        enqueueSnackbarMessage({
          message: res.data.message || "Application created successfully",
          type: "success",
        })
      );

      dispatch(fetchUserApps());

      return;
    } catch (error: any) {
      if (axios.isCancel(error)) {
        return rejectWithValue("Request Canceled");
      }

      const message =
        error?.response?.data?.message ??
        (error?.response?.status === HttpStatusCode.InternalServerError
          ? "Server error while creating application"
          : "Failed to create application");

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

export const updateApp = createAsyncThunk<void, { payload: UpdateAppPayload, id: number }>(
  "app/updateApp",
  async ({ payload, id }, { dispatch, rejectWithValue }) => {

    try {
      const res = await APIService.getInstance().patch(`${AppConfig.serviceUrls.apps}/${id}`,
        payload
      );

      dispatch(
        enqueueSnackbarMessage({
          message: res.data.message || "Application created successfully",
          type: "success",
        })
      );

      dispatch(fetchApps());
      dispatch(fetchUserApps());

    } catch (error: any) {
      if (axios.isCancel(error)) {
        return rejectWithValue("Request Canceled");
      }

      const message =
        error?.response?.data?.message ??
        (error?.response?.status === HttpStatusCode.InternalServerError
          ? "Server error while creating application"
          : "Failed to create application");

      dispatch(
        enqueueSnackbarMessage({
          message,
          type: "error",
        })
      );

      return rejectWithValue(message);
    }
  }
)

export const upsertAppFavourite = createAsyncThunk<
  UpdateArgs,
  UpdateArgs
>(
  "apps/upsertAppFavourite",
  async (updateArgs, { dispatch, rejectWithValue }) => {
    APIService.getCancelToken().cancel();
    const newCancelTokenSource = APIService.updateCancelToken();

    try {
      const res = await APIService.getInstance().post(
        `${AppConfig.serviceUrls.apps}/${updateArgs.id}/${updateArgs.active}`,
        {
          cancelToken: newCancelTokenSource.token,
        }
      );
      return { id: updateArgs.id, active: updateArgs.active };

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

export const appSlice = createSlice({
  name: "apps",
  initialState,
  reducers: {
    resetSubmitState(state) {
      state.state = State.idle;
    },
    resetCreateState(state) {
      state.submitState = State.idle;
      state.stateMessage = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchApps.pending, (state) => {
        state.state = State.loading;
        state.stateMessage = "Loading applications...";
      })
      .addCase(fetchApps.fulfilled, (state, action) => {
        state.state = State.success;
        state.stateMessage = null;
        state.apps = action.payload;
      })
      .addCase(fetchApps.rejected, (state, action) => {
        state.state = State.failed;
        state.stateMessage = "Failed to load applications. Please try again later.";
      })

      .addCase(fetchUserApps.rejected, (state, action) => {
        state.state = State.failed;
        state.stateMessage = "Failed to load applications. Please try again later.";
      })
      .addCase(fetchUserApps.pending, (state) => {
        state.state = State.loading;
        state.stateMessage = "Loading applications...";
      })
      .addCase(fetchUserApps.fulfilled, (state, action) => {
        state.state = State.success;
        state.stateMessage = null;
        state.userApps = action.payload;
      })

      .addCase(upsertAppFavourite.pending, (state) => {
        state.submitState = State.loading;
        state.stateMessage = "Updating favorites...";
      })
      .addCase(upsertAppFavourite.rejected, (state, action) => {
        state.submitState = State.failed;
        state.stateMessage = "Unable to update favorites. Please try again.";
      })
      .addCase(upsertAppFavourite.fulfilled, (state, action) => {
        state.submitState = State.success;
        state.stateMessage = action.payload.active === UpdateAction.Favorite
          ? "Added to favorites"
          : "Removed from favorites";
        // Update the favorite status in the apps array
        if (state.userApps) {
          const app = state.userApps.find((app) => app.id === action.payload.id);
          if (app) {
            app.isFavourite = action.payload.active === UpdateAction.Favorite ? 1 : 0;
          }
        }
      })

      .addCase(createApp.pending, (state) => {
        state.submitState = State.loading;
        state.stateMessage = "Creating application...";
      })
      .addCase(createApp.fulfilled, (state) => {
        state.submitState = State.success;
        state.stateMessage = null;
      })
      .addCase(createApp.rejected, (state) => {
        state.submitState = State.failed;
        state.stateMessage = "Failed to create application. Please try again.";
      })

      .addCase(updateApp.pending, (state) => {
        state.submitState = State.loading;
        state.stateMessage = "Updating application...";
      })
      .addCase(updateApp.fulfilled, (state, action) => {
        state.submitState = State.success;
        state.stateMessage = "Successfully updated app";
      })
      .addCase(updateApp.rejected, (state) => {
        state.submitState = State.failed;
        state.stateMessage = "Failed to update application. Please try again.";
      });
  },
});

export const { resetSubmitState, resetCreateState } = appSlice.actions;
export default appSlice.reducer;
