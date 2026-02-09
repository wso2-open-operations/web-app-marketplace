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
import CloseIcon from "@mui/icons-material/Close";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  FormControlLabel,
  IconButton,
  LinearProgress,
  Switch,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { useFormik } from "formik";

import { useEffect, useState } from "react";

import {
  App,
  UpdateAppPayload,
  useGetAppsQuery,
  useUpdateAppMutation,
} from "@root/src/services/app.api";
import { useGetUserGroupsQuery } from "@root/src/services/groups.api";
import { useGetTagsQuery } from "@root/src/services/tag.api";
import { useGetUserInfoQuery } from "@root/src/services/user.api";
import AppCard from "@view/home/components/AppCard";

import { validationSchema } from "../utils/updateAppSchema";

const fileSize = 10 * 1024 * 1024;

interface FileWithPreview {
  file: File;
  preview: string;
  uploading: boolean;
  progress: number;
  error: string | null;
}

export default function UpdateApp() {
  // RTK Query hooks
  const { data: userInfo } = useGetUserInfoQuery();
  const { data: tags = [] } = useGetTagsQuery();
  const { data: groups = [] } = useGetUserGroupsQuery();
  const { data: apps = [] } = useGetAppsQuery();
  const [updateAppMutation, { isLoading: isUpdating, isError, error }] = useUpdateAppMutation();

  const [filePreview, setFilePreview] = useState<FileWithPreview | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedApp, setSelectedApp] = useState<App | null>(null);

  const userEmail = userInfo?.workEmail ?? "";

  const theme = useTheme();

  const setupIconPlaceholder = (app: App | null) => {
    if (app?.icon) {
      setFilePreview({
        file: new File([], "existing-icon.svg", { type: "image/svg+xml" }),
        preview: app.icon,
        uploading: false,
        progress: 100,
        error: null,
      });
      formik.setFieldValue("icon", new File([], "existing-icon.svg", { type: "image/svg+xml" }));
    } else {
      setFilePreview(null);
      formik.setFieldValue("icon", null);
    }
  };

  useEffect(() => {
    setupIconPlaceholder(selectedApp);
  }, [selectedApp]);

  useEffect(() => {
    if (selectedApp && apps) {
      const updatedApp = apps.find((app) => app.id === selectedApp.id);
      if (updatedApp) {
        if (JSON.stringify(updatedApp) !== JSON.stringify(selectedApp)) {
          setSelectedApp(updatedApp);
        }
      }
    }
  }, [apps, selectedApp]);

  const dummyApp: App = {
    name: "Sample",
    description: "sample app description",
    icon: "https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/appstore.svg",
    tags: [
      {
        id: 1,
        name: "Sample Tag",
        color: "#544675",
      },
    ],
    url: "www.sample.com",
    id: 0,
    versionName: "1.0.0",
    addedBy: "demo@example.com",
    userGroups: [],
    isActive: true,
  };

  // Build payload with only changed fields
  const buildUpdatePayload = async (
    values: typeof formik.values,
  ): Promise<Partial<UpdateAppPayload>> => {
    if (!selectedApp) return {};

    const payload: Partial<UpdateAppPayload> = {};

    // Check and add changed fields
    if (values.title.trim() !== selectedApp.name) {
      payload.name = values.title.trim();
    }

    if (values.url.trim() !== selectedApp.url) {
      payload.url = values.url.trim();
    }

    if (values.description.trim() !== selectedApp.description) {
      payload.description = values.description.trim();
    }

    if (values.versionName.trim() !== selectedApp.versionName) {
      payload.versionName = values.versionName.trim();
    }

    // Compare tags arrays
    const originalTagIds = selectedApp.tags?.map((tag: any) => tag.id) || [];
    const tagsChanged =
      JSON.stringify([...values.tags].sort()) !== JSON.stringify([...originalTagIds].sort());
    if (tagsChanged) {
      payload.tags = values.tags;
    }

    // Compare user groups arrays
    const originalGroupIds = selectedApp.userGroups || [];
    const groupsChanged =
      JSON.stringify([...values.groupIds].sort()) !== JSON.stringify([...originalGroupIds].sort());
    if (groupsChanged) {
      payload.userGroups = values.groupIds;
    }

    const originalIsActive = selectedApp.isActive ?? false;
    if (values.isActive !== originalIsActive) {
      payload.isActive = values.isActive;
    }

    // Check if icon has actually changed (not the placeholder from existing icon)
    if (values.icon && values.icon.size > 0) {
      const base64Icon = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Failed to read icon file"));
        reader.readAsDataURL(values.icon as File);
      });
      payload.icon = base64Icon;
    }

    // Only add updatedBy if there are actual changes
    if (Object.keys(payload).length > 0) {
      payload.updatedBy = userEmail;
    }

    return payload;
  };

  // Submits app update if changes are detected.
  const submitUpdate = async (payload: Partial<UpdateAppPayload>) => {
    if (!selectedApp) return;

    if (Object.keys(payload).length === 0) {
      formik.setFieldError("title", "No changes detected");
      return;
    }

    await updateAppMutation({ id: selectedApp.id, payload: payload as UpdateAppPayload }).unwrap();
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      title: selectedApp?.name || "",
      description: selectedApp?.description || "",
      url: selectedApp?.url || "",
      versionName: selectedApp?.versionName || "",
      tags: selectedApp?.tags?.map((tag: any) => tag.id) || [],
      groupIds: selectedApp?.userGroups || [],
      icon: null as File | null,
      isActive: selectedApp?.isActive ?? false,
    },
    validationSchema,
    onSubmit: async (values) => {
      if (!selectedApp) return;

      // Build payload with only changed fields
      let payload;
      try {
        payload = await buildUpdatePayload(values);
      } catch (error) {
        console.error("Failed to build payload:", error);
        formik.setFieldError("icon", "Failed to process the icon file");
        return;
      }

      try {
        await submitUpdate(payload);
        formik.resetForm();
      } catch (error) {
        console.error("Failed to submit update : ", error);
        formik.setStatus({
          type: "error",
          message:
            error instanceof Error ? error.message : "Failed to update app. Please try again.",
        });
      }
    },
  });

  const handleFileSelect = (file: File) => {
    if (file.type !== "image/svg+xml" || !file.name.toLowerCase().endsWith(".svg")) {
      formik.setFieldError("icon", "Only SVG files are allowed");
      return;
    }

    if (file.size > fileSize) {
      formik.setFieldError("icon", "File size must not exceed 10MB");
      return;
    }

    formik.setFieldValue("icon", file);

    const reader = new FileReader();
    reader.onload = (e) => {
      setFilePreview({
        file,
        preview: e.target?.result as string,
        uploading: false,
        progress: 100,
        error: null,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemoveFile = () => {
    formik.setFieldValue("icon", null);
    setFilePreview(null);
  };

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 2,
        boxShadow: 4,
      }}
    >
      {/* Form Content */}
      <Box sx={{ display: "flex", flexDirection: "row", p: 3, gap: 3 }}>
        <Box
          sx={{
            width: "fit-content",
            minWidth: "450px",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Autocomplete
            options={apps || []}
            getOptionLabel={(option) => option.name}
            value={selectedApp}
            onChange={(_, value) => setSelectedApp(value)}
            renderInput={(params) => (
              <TextField {...params} name="apps" placeholder="Select an app" />
            )}
          />

          <Box sx={{ height: "250px" }}>
            {selectedApp ? (
              <AppCard
                title={selectedApp.name || ""}
                description={selectedApp.description || ""}
                logoUrl={selectedApp.icon || ""}
                tags={selectedApp.tags || []}
                appUrl={selectedApp.url || ""}
                appId={selectedApp.id || 0}
                isFavourite={1}
                logoAlt={selectedApp.name || "App Logo"}
                cardSx={{
                  border: `1px solid ${theme.palette.customBorder.secondary.active}`,
                  "&:hover": {
                    boxShadow: "none",
                    transform: "none",
                  },
                }}
              />
            ) : (
              <AppCard
                title={dummyApp.name}
                description={dummyApp.description}
                logoUrl={dummyApp.icon}
                tags={dummyApp.tags}
                appUrl={dummyApp.url}
                appId={dummyApp.id}
                isFavourite={1}
                logoAlt="Sample App Logo"
                isClickable={false}
                cardSx={{
                  "&:hover": {
                    boxShadow: "none",
                    transform: "none",
                  },
                }}
              />
            )}
          </Box>
        </Box>

        <Box sx={{ width: "100%" }}>
          <form onSubmit={formik.handleSubmit}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* App Name */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Typography
                  variant="body1"
                  sx={{ ml: 0.5, color: theme.palette.customText.primary.p2.active }}
                >
                  App Name
                </Typography>

                <TextField
                  fullWidth
                  name="title"
                  placeholder={!selectedApp ? "Select an app to edit name" : "Web App Marketplace"}
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.title && Boolean(formik.errors.title)}
                  helperText={formik.touched.title && (formik.errors.title as string)}
                  disabled={!selectedApp || isUpdating}
                />
              </Box>

              {/* App URL and Version Name in Row */}
              <Box sx={{ display: "flex", gap: 2, width: "100%" }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1, width: "100%" }}>
                  <Typography
                    variant="body1"
                    sx={{ ml: 0.5, color: theme.palette.customText.primary.p2.active }}
                  >
                    App Url
                  </Typography>

                  <TextField
                    fullWidth
                    name="url"
                    placeholder={!selectedApp ? "Select an app to edit url" : "www.wso2.com"}
                    value={formik.values.url}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.url && Boolean(formik.errors.url)}
                    helperText={formik.touched.url && (formik.errors.url as string)}
                    disabled={!selectedApp || isUpdating}
                  />
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 1, width: "100%" }}>
                  <Typography
                    variant="body1"
                    sx={{ ml: 0.5, color: theme.palette.customText.primary.p2.active }}
                  >
                    App Version Name
                  </Typography>

                  <TextField
                    fullWidth
                    name="versionName"
                    placeholder={!selectedApp ? "Select an app to edit version name" : "Beta"}
                    value={formik.values.versionName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.versionName && Boolean(formik.errors.versionName)}
                    helperText={formik.touched.versionName && (formik.errors.versionName as string)}
                    disabled={!selectedApp || isUpdating}
                  />
                </Box>
              </Box>

              {/* App Description */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1, width: "100%" }}>
                <Typography
                  variant="body1"
                  sx={{ ml: 0.5, color: theme.palette.customText.primary.p2.active }}
                >
                  App Description
                </Typography>

                <TextField
                  fullWidth
                  name="description"
                  placeholder={
                    !selectedApp ? "Select an app to edit description" : "Web App Marketplace"
                  }
                  multiline
                  rows={3}
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.description && Boolean(formik.errors.description)}
                  helperText={formik.touched.description && (formik.errors.description as string)}
                  disabled={!selectedApp || isUpdating}
                />
              </Box>

              {/* Tag */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Typography
                  variant="body1"
                  sx={{ ml: 0.5, color: theme.palette.customText.primary.p2.active }}
                >
                  Tags
                </Typography>
                <Autocomplete
                  multiple
                  options={tags || []}
                  getOptionLabel={(option) => option.name}
                  value={tags?.filter((t) => formik.values.tags.includes(t.id)) || []}
                  onChange={(_, newValue) => {
                    formik.setFieldValue(
                      "tags",
                      newValue.map((tag) => tag.id),
                    );
                  }}
                  onBlur={formik.handleBlur}
                  disabled={!selectedApp || isUpdating}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        {...getTagProps({ index })}
                        key={option.id}
                        label={option.name}
                        sx={{
                          backgroundColor: option.color ? `${option.color}1A` : "#e0e0e0",
                          border: option.color
                            ? `2px solid ${option.color}80`
                            : "2px solid #bdbdbd",
                          color: option.color || "#424242",
                          fontWeight: 500,
                          "& .MuiChip-deleteIcon": {
                            color: option.color || "#424242",
                            "&:hover": {
                              color: option.color ? `${option.color}CC` : "#616161",
                            },
                          },
                        }}
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      name="tags"
                      placeholder={
                        !selectedApp ? "Select an app to edit tags" : "Select one or more tags"
                      }
                      error={formik.touched.tags && Boolean(formik.errors.tags)}
                      helperText={formik.touched.tags && (formik.errors.tags as string)}
                    />
                  )}
                />
              </Box>

              {/* User Groups */}
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
                  disabled={!selectedApp || isUpdating}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      name="groupIds"
                      placeholder={
                        !selectedApp ? "Select an app to edit user groups" : "Select user groups"
                      }
                      error={formik.touched.groupIds && Boolean(formik.errors.groupIds)}
                      helperText={formik.touched.groupIds && (formik.errors.groupIds as string)}
                    />
                  )}
                />
              </Box>

              {/* App Icon Upload */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Typography
                  variant="body1"
                  sx={{ ml: 0.5, color: theme.palette.customText.primary.p2.active }}
                >
                  App Icon
                </Typography>

                {/* File Upload Area */}
                {!filePreview && (
                  <Box
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    sx={{
                      border: "2px dashed",
                      borderColor: dragActive
                        ? "primary.main"
                        : formik.touched.icon && formik.errors.icon
                          ? "error.main"
                          : "divider",
                      borderRadius: 2,
                      p: 6,
                      textAlign: "center",
                      bgcolor: dragActive ? "action.hover" : "background.paper",
                      cursor: "pointer",
                      transition: "all 0.3s",
                    }}
                    onClick={() => document.getElementById("file-upload")?.click()}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: "50%",
                          bgcolor: "primary.main",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                        }}
                      >
                        <UploadFileIcon />
                      </Box>

                      <Typography
                        sx={{
                          color: selectedApp
                            ? theme.palette.customText.primary.p2.active
                            : theme.palette.customText.primary.p4.active,
                        }}
                      >
                        {!selectedApp
                          ? "Select an app to edit icon"
                          : "Drag and drop file or select file"}
                      </Typography>
                    </Box>

                    <input
                      id="file-upload"
                      type="file"
                      accept=".svg,image/svg+xml"
                      onChange={handleFileChange}
                      style={{ display: "none" }}
                      disabled={!selectedApp || isUpdating}
                    />
                  </Box>
                )}

                {/* File Preview */}
                {filePreview && (
                  <Box
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2,
                      p: 2,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            bgcolor: "action.selected",
                            borderRadius: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "hidden",
                          }}
                        >
                          {filePreview.preview && (
                            <img
                              src={filePreview.preview}
                              alt="Preview"
                              style={{ width: "100%", height: "100%" }}
                            />
                          )}
                        </Box>
                        <Box>
                          <Typography variant="body1" fontWeight={500}>
                            App Icon
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {(filePreview.file.size / (1024 * 1024)).toFixed(2)}
                            MB
                          </Typography>
                        </Box>
                      </Box>
                      <IconButton onClick={handleRemoveFile} disabled={!selectedApp || isUpdating}>
                        <CloseIcon />
                      </IconButton>
                    </Box>
                    {filePreview.uploading && (
                      <Box sx={{ mt: 2 }}>
                        <LinearProgress variant="determinate" value={filePreview.progress} />
                        <Typography variant="caption" color="text.secondary">
                          {filePreview.progress}%
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}

                {/* File validation info */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    px: 0.5,
                    color: theme.palette.customText.primary.p4.active,
                  }}
                >
                  <Typography variant="caption">Supported formats : svg</Typography>
                  <Typography variant="caption">Maximum size : 10MB</Typography>
                </Box>

                {/* Error message */}
                {formik.touched.icon && formik.errors.icon && (
                  <Typography variant="caption" color="error" sx={{ mt: 1, display: "block" }}>
                    {formik.errors.icon as string}
                  </Typography>
                )}
              </Box>

              {/* Active app or not */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                }}
              >
                <Typography
                  variant="body1"
                  sx={{ color: theme.palette.customText.primary.p2.active }}
                >
                  App Status
                </Typography>

                <FormControlLabel
                  label={
                    <Typography
                      variant="body1"
                      sx={{
                        ml: 1,
                        fontWeight: 500,
                        color: theme.palette.customText.primary.p3.active,
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
                      disabled={!selectedApp || isUpdating}
                    />
                  }
                  sx={{ ml: "0px" }}
                />
              </Box>

              {/* Show general error */}
              {isError && error && (
                <Alert severity="error">
                  {"data" in error &&
                  typeof error.data === "object" &&
                  error.data &&
                  "message" in error.data
                    ? String(error.data.message)
                    : "Failed to update application. Please try again."}
                </Alert>
              )}
            </Box>

            {/* Footer Buttons */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
                pb: 3,
                px: 4,
              }}
            >
              <Button
                disabled={!selectedApp || isUpdating}
                onClick={() => {
                  formik.resetForm();
                  if (selectedApp?.icon) {
                    setupIconPlaceholder(selectedApp);
                  } else {
                    setFilePreview(null);
                  }
                }}
                variant="outlined"
              >
                Cancel
              </Button>
              <Button type="submit" variant="contained" disabled={isUpdating || !selectedApp}>
                {isUpdating ? "Updating..." : "Update App"}
              </Button>
            </Box>
          </form>
        </Box>
      </Box>
    </Box>
  );
}
