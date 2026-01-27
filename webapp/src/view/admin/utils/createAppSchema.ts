import * as Yup from "yup";

const fileSize = 10 * 1024 * 1024;

export const validationSchema = Yup.object({
  title: Yup.string()
    .trim()
    .min(2, "Title must be at least 2 characters")
    .required("App name is required"),
  description: Yup.string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(100, "Description must be at most 100 characters")
    .required("App description is required"),
  link: Yup.string().trim().url("Must be a valid URL").required("App URL is required"),
  versionName: Yup.string()
    .trim()
    .min(1, "Version name must be at least 1 character")
    .required("App version name is required"),
  tags: Yup.array()
    .of(Yup.number().required())
    .min(1, "At least one tag is required")
    .required("Tags are required"),
  groupIds: Yup.array()
    .of(Yup.string().required())
    .min(1, "At least one user group is required")
    .required("User groups are required"),
  icon: Yup.mixed()
    .required("App icon is required")
    .test("fileType", "Only SVG files are allowed", (value) => {
      if (!value) return false;
      const file = value as File;
      return file.type === "image/svg+xml" && file.name.toLowerCase().endsWith(".svg");
    })
    .test("fileSize", "File size must not exceed 10MB", (value) => {
      if (!value) return false;
      const file = value as File;
      return file.size <= fileSize; // 10MB
    }),
});
