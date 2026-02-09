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
import { Alert, Box, Button } from "@mui/material";

import ErrorHandler from "@component/common/ErrorHandler";
import PreLoader from "@component/common/PreLoader";
import { useGetUserGroupsQuery } from "@services/groups.api";
import { useGetTagsQuery } from "@services/tag.api";

import AppStatusToggle from "./components/create-app/AppStatusToggle";
import FileUploadArea from "./components/create-app/FileUploadArea";
import LabeledTextField from "./components/create-app/LabeledTextField";
import TagSelector from "./components/create-app/TagSelector";
import UserGroupSelector from "./components/create-app/UserGroupSelector";
import { useCreateApp } from "./hooks/useCreateApp";

export default function CreateApp() {
  const { data: tags = [], isLoading: tagsLoading, isError: tagsError } = useGetTagsQuery();
  const {
    data: groups = [],
    isLoading: groupsLoading,
    isError: groupsError,
  } = useGetUserGroupsQuery();

  const { formik, filePreview, setFilePreview, isCreating, isError, error, handleCancel } =
    useCreateApp();

  if (tagsLoading || groupsLoading) {
    return <PreLoader isLoading message="Loading admin view ... " />;
  }

  if (groupsError || tagsError) {
    return <ErrorHandler message="Error while loading required data" />;
  }

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        p: 3,
      }}
    >
      <Box sx={{ overflowY: "auto", width: "100%" }}>
        <form onSubmit={formik.handleSubmit}>
          <Box sx={{ display: "flex", flexDirection: "row", gap: 3 }}>
            {/* Left Column - Basic Info, Tags, Groups */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                gap: 3,
              }}
            >
              <LabeledTextField
                formik={formik}
                name="title"
                label="App Name"
                placeholder="Web App Marketplace"
                disabled={isCreating}
              />

              <Box sx={{ display: "flex", gap: 2, width: "100%" }}>
                <LabeledTextField
                  formik={formik}
                  name="link"
                  label="App Url"
                  placeholder="www.wso2.com"
                  disabled={isCreating}
                />

                <LabeledTextField
                  formik={formik}
                  name="versionName"
                  label="App Version Name"
                  placeholder="Beta"
                  disabled={isCreating}
                />
              </Box>

              <LabeledTextField
                formik={formik}
                name="description"
                label="App Description"
                placeholder="Web App Marketplace"
                disabled={isCreating}
                multiline
                rows={3}
              />

              <TagSelector formik={formik} tags={tags} isDisabled={isCreating} />

              <UserGroupSelector formik={formik} groups={groups} isDisabled={isCreating} />
            </Box>

            {/* Right Column - File Upload, Status, Error */}
            <Box
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 3,
              }}
            >
              <FileUploadArea
                formik={formik}
                filePreview={filePreview}
                setFilePreview={setFilePreview}
              />

              {isError && error && (
                <Alert severity="error">
                  {"data" in error &&
                  typeof error.data === "object" &&
                  error.data &&
                  "message" in error.data
                    ? String(error.data.message)
                    : "Failed to create application. Please try again."}
                </Alert>
              )}

              <AppStatusToggle formik={formik} isDisabled={isCreating} />

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "flex-end",
                  gap: 2,
                  height: "100%",
                }}
              >
                <Button disabled={isCreating} onClick={handleCancel} variant="outlined">
                  Cancel
                </Button>

                <Button type="submit" variant="contained" disabled={isCreating || !formik.isValid}>
                  {isCreating ? "Creating..." : "Create App"}
                </Button>
              </Box>
            </Box>
          </Box>
        </form>
      </Box>
    </Box>
  );
}
