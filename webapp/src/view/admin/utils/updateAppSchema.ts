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
import * as Yup from "yup";

const fileSize = 10 * 1024 * 1024;

export const validationSchema = Yup.object({
  title: Yup.string().trim().min(2, "Title must be at least 2 characters").nullable(),
  description: Yup.string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(100, "Description must be at most 100 characters")
    .nullable(),
  url: Yup.string().trim().url("Must be a valid URL").nullable(),
  versionName: Yup.string().trim().min(1, "Version name must be at least 1 character").nullable(),
  tags: Yup.array().of(Yup.number().required()).nullable(),
  groupIds: Yup.array().of(Yup.string().required()).nullable(),
  // In validation:
  icon: Yup.mixed()
    .nullable()
    .test("fileType", "Only SVG files are allowed", function (value) {
      // Allow null if not changed and existing icon is present
      if (!value || (this.parent.selectedApp?.icon && !value)) return true;
      return value.type === "image/svg+xml" && value.name.toLowerCase().endsWith(".svg");
    })
    .test("fileSize", "File size must not exceed 10MB", function (value) {
      // Allow null if not changed and existing icon is present
      if (!value || (this.parent.selectedApp?.icon && !value)) return true;
      return value.size <= fileSize;
    }),
  isActive: Yup.boolean(),
});
