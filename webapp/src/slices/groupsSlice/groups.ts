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

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import axios, { HttpStatusCode } from "axios"

import { AppConfig } from "@root/src/config/config"
import { State } from "@root/src/types/types"
import { APIService } from "@root/src/utils/apiService"
import { enqueueSnackbarMessage } from "../commonSlice/common"

interface GroupsState {
    state: State
    stateMessage: string | null,
    errorMessage: string | null,
    groups: string[] | null
}

const initialState: GroupsState = {
    state: State.idle,
    stateMessage: null,
    errorMessage: null,
    groups: null
}

export const fetchGroups = createAsyncThunk(
    "tag/fetchGroups",
    async (_, { dispatch, rejectWithValue }) => {

        APIService.getCancelToken().cancel();
        const newCancelTokenSource = APIService.updateCancelToken();

        try {
            const res = await APIService.getInstance().get(AppConfig.serviceUrls.userGroups, {
                cancelToken: newCancelTokenSource.token
            });

            return res.data;

        } catch (error: any) {
            if (axios.isCancel(error)) {
                return rejectWithValue("Request Cancelled")
            }

            const message =
                error?.response?.data?.message ??
                (error?.response?.status === HttpStatusCode.InternalServerError
                    ? "Server error while fetching"
                    : "Failed to fetch");

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

export const groupSlice = createSlice({
    name: "tags",
    initialState,
    reducers: {
        resetSubmitState(state) {
            state.state = State.idle;
        }
    },

    extraReducers: (builder) => {
        builder
            .addCase(fetchGroups.pending, (state) => {
                state.state = State.loading;
                state.stateMessage = "Fetching app links...";
            })

            .addCase(fetchGroups.fulfilled, (state, action) => {
                state.state = State.success;
                state.stateMessage = "Successfully fetched";
                state.groups = action.payload;
            })

            .addCase(fetchGroups.rejected, (state) => {
                state.state = State.failed;
                state.stateMessage = "Failed to fetch";
            })
    }
})

export const {resetSubmitState} = groupSlice.actions;
export default groupSlice.reducer;
