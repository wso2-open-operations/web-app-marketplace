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
import { useFormik } from "formik";

import { useState } from "react";

import { CreateAppPayload, useCreateAppMutation } from "@services/app.api";
import { useGetUserInfoQuery } from "@services/user.api";

import { validationSchema } from "../../utils/createAppSchema";

export interface FileWithPreview {
  file: File;
  preview: string;
  uploading: boolean;
  progress: number;
  error: string | null;
}

const initialValues = {
  title: "",
  description: "",
  link: "",
  versionName: "",
  tags: [] as number[],
  groupIds: [] as string[],
  icon: null as File | null,
  isActive: true,
};

export function useCreateApp() {
  const { data: userInfo } = useGetUserInfoQuery();
  const [createAppMutation, { isLoading: isCreating, isError, error }] = useCreateAppMutation();

  const [filePreview, setFilePreview] = useState<FileWithPreview | null>(null);
  const userEmail = userInfo?.workEmail ?? "";

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      if (!values.icon) return;

      try {
        const base64Icon = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error("Failed to read icon file"));
          reader.readAsDataURL(values.icon!);
        });

        const payload: CreateAppPayload = {
          name: values.title.trim(),
          url: values.link.trim(),
          description: values.description.trim(),
          versionName: values.versionName.trim(),
          tags: values.tags,
          icon: base64Icon,
          userGroups: values.groupIds,
          isActive: values.isActive,
          addedBy: userEmail,
        };

        await createAppMutation(payload).unwrap();
        formik.resetForm();
        setFilePreview(null);
      } catch (err) {
        if (err instanceof Error && err.message === "Failed to read icon file") {
          formik.setFieldError("icon", "Failed to read icon file");
        } else {
          console.error("Failed to create app:", err);
        }
      }
    },
  });

  const handleCancel = () => {
    formik.resetForm();
    setFilePreview(null);
  };

  return {
    formik,
    filePreview,
    setFilePreview,
    isCreating,
    isError,
    error,
    handleCancel,
  };
}
