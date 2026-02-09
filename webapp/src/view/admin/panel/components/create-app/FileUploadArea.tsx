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
import CloseIcon from "@mui/icons-material/Close";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { Box, IconButton, LinearProgress, Typography, useTheme } from "@mui/material";
import { FormikProps } from "formik";

import { memo, useState } from "react";

interface FileWithPreview {
  file: File;
  preview: string;
  uploading: boolean;
  progress: number;
  error: string | null;
}

interface FileUploadAreaProps {
  formik: FormikProps<any>;
  filePreview: FileWithPreview | null;
  setFilePreview: (preview: FileWithPreview | null) => void;
  maxFileSize?: number;
}

const FileUploadArea = ({
  formik,
  filePreview,
  setFilePreview,
  maxFileSize = 10 * 1024 * 1024,
}: FileUploadAreaProps) => {
  const theme = useTheme();
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = (file: File) => {
    if (file.type !== "image/svg+xml" || !file.name.toLowerCase().endsWith(".svg")) {
      formik.setFieldError("icon", "Only SVG files are allowed");
      return;
    }

    if (file.size > maxFileSize) {
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
    reader.onerror = () => {
      formik.setFieldError("icon", "Failed to read file");
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
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography
        variant="body1"
        sx={{
          fontWeight: 500,
          color: theme.palette.customText.primary.p2.active,
          ml: 0.5,
        }}
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
              ? theme.palette.customBorder.secondary.active
              : formik.touched.icon && formik.errors.icon
                ? theme.palette.error.main
                : "divider",
            borderRadius: 2,
            p: 6,
            textAlign: "center",
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
                display: "flex",
                // border: `.5px solid ${theme.palette.customBorder.secondary.active}`,
                backgroundColor: theme.palette.fill.secondary_light.active,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <UploadFileIcon />
            </Box>

            <Box
              sx={{
                display: "flex",
                gap: 0.5,
                color: theme.palette.customText.primary.p3.active,
              }}
            >
              <Typography>Drag and drop file or </Typography>
              <Typography
                sx={{
                  color: theme.palette.customText.secondary.p1.active,
                }}
              >
                Select file
              </Typography>
            </Box>
          </Box>

          <input
            id="file-upload"
            type="file"
            accept=".svg,image/svg+xml"
            onChange={handleFileChange}
            style={{ display: "none" }}
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
                  {(filePreview.file.size / (1024 * 1024)).toFixed(2)} MB
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={handleRemoveFile}>
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
          color: theme.palette.customText.primary.p3.active,
          mx: 0.5,
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Supported formats : svg
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Maximum size : 10MB
        </Typography>
      </Box>

      {/* Error message */}
      {formik.touched.icon && formik.errors.icon && (
        <Typography variant="caption" color="error" sx={{ mt: 1, display: "block" }}>
          {formik.errors.icon as string}
        </Typography>
      )}
    </Box>
  );
};

export default memo(FileUploadArea);
