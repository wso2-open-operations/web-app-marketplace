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

export type Tag = {
    id: number,
    name: string
}

interface TagState {
    state: State
    stateMessage: string | null,
    errorMessage: string | null,
    tags: Tag[] | null
}

const initialState: TagState = {
    state: State.idle,
    stateMessage: null,
    errorMessage: null,
    tags: null
}

export const fetchTags = createAsyncThunk(
    "tag/fetchTags",
    async (_, { dispatch, rejectWithValue }) => {

        APIService.getCancelToken().cancel();
        const newCancelTokenSource = APIService.updateCancelToken();

        try {
            const res = await APIService.getInstance().get(AppConfig.serviceUrls.tags, {
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

export const tagSlice = createSlice({
    name: "tags",
    initialState,
    reducers: {
        resetSubmitState(state) {
            state.state = State.idle;
        }
    },

    extraReducers: (builder) => {
        builder
            .addCase(fetchTags.pending, (state) => {
                state.state = State.loading;
                state.stateMessage = "Fetching app links...";
            })

            .addCase(fetchTags.fulfilled, (state, action) => {
                state.state = State.success;
                state.stateMessage = "Successfully fetched";
                state.tags = action.payload;
            })

            .addCase(fetchTags.rejected, (state) => {
                state.state = State.failed;
                state.stateMessage = "Failed to fetch";
            })
    }
})

export const {resetSubmitState} = tagSlice.actions;
export default tagSlice.reducer;