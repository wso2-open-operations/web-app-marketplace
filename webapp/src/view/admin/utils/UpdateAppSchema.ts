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
