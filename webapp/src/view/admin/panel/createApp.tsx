import { Box, Typography, IconButton, Alert, TextField, Autocomplete, Chip, LinearProgress, Button } from "@mui/material";
import { resetCreateState, CreateAppPayload, createApp, fetchApps } from "@root/src/slices/appSlice/app";
import groups, { fetchGroups } from "@root/src/slices/groupsSlice/groups";
import CloseIcon from "@mui/icons-material/Close";
import { useAppDispatch, useAppSelector, RootState } from "@root/src/slices/store";
import { State } from "@root/src/types/types";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useState, useEffect } from "react";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { fetchTags } from "@root/src/slices/tagSlice/tag";

interface FileWithPreview {
    file: File;
    preview: string;
    uploading: boolean;
    progress: number;
    error: string | null;
}

const validationSchema = Yup.object({
    title: Yup.string()
        .trim()
        .min(2, "Title must be at least 2 characters")
        .required("App name is required"),
    description: Yup.string()
        .trim()
        .min(10, "Description must be at least 10 characters")
        .max(25, "Description must be at most 25 characters")
        .required("App description is required"),
    link: Yup.string()
        .trim()
        .url("Must be a valid URL")
        .required("App URL is required"),
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
            return (
                file.type === "image/svg+xml" &&
                file.name.toLowerCase().endsWith(".svg")
            );
        })
        .test("fileSize", "File size must not exceed 10MB", (value) => {
            if (!value) return false;
            const file = value as File;
            return file.size <= 10 * 1024 * 1024; // 10MB
        }),
});

export default function CreateApp() {
    const dispatch = useAppDispatch();
    const tags = useAppSelector((state: RootState) => state.tag.tags);
    const groups = useAppSelector((state: RootState) => state.group.groups);
    const userInfo = useAppSelector((state: RootState) => state.user.userInfo);
    const submitState = useAppSelector((state: RootState) => state.app.submitState);
    const stateMessage = useAppSelector((state: RootState) => state.app.stateMessage);

    const [filePreview, setFilePreview] = useState<FileWithPreview | null>(null);
    const [dragActive, setDragActive] = useState(false);

    const userEmail = userInfo?.workEmail ?? "";

    useEffect(() => {
        dispatch(fetchGroups());
        dispatch(fetchTags());
    }, [])

    console.log("Test")

    const formik = useFormik({
        initialValues: {
            title: "",
            description: "",
            link: "",
            versionName: "",
            tags: [] as number[],
            groupIds: [] as string[],
            icon: null as File | null,
        },
        validationSchema,
        onSubmit: async (values) => {
            if (!values.icon) return;

            // Convert icon file to base64 string
            const reader = new FileReader();
            reader.readAsDataURL(values.icon);
            reader.onload = async () => {
                const base64Icon = reader.result as string;

                const payload: CreateAppPayload = {
                    name: values.title.trim(),
                    url: values.link.trim(),
                    description: values.description.trim(),
                    versionName: values.versionName.trim(),
                    tags: values.tags,
                    icon: base64Icon,
                    userGroups: values.groupIds,
                    isActive: true
                };

                const result = await dispatch(createApp({ payload, userEmail }));

                if (createApp.fulfilled.match(result)) {
                    handleClose();
                }
            };

            reader.onerror = () => {
                formik.setFieldError("icon", "Failed to read icon file");
            };
        },
    });

    const handleClose = () => {
        formik.resetForm();
        setFilePreview(null);
        dispatch(resetCreateState());
    };

    const handleFileSelect = (file: File) => {
        if (file.type !== "image/svg+xml" || !file.name.toLowerCase().endsWith(".svg")) {
            formik.setFieldError("icon", "Only SVG files are allowed");
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
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
                bgcolor: "background.paper",
                borderRadius: 2,
                boxShadow: 4,
            }}
        >
            {/* Form Content */}
            <Box sx={{ overflowY: "auto", flex: 1 }}>
                <form onSubmit={formik.handleSubmit}>
                    <Box sx={{ p: 3, display: "flex", flexDirection: "row", gap: 3 }}>
                        <Box sx={{ display: "flex", flexDirection: "column", width: "100%", gap: 3 }}>
                            {/* App Name */}
                            <Box>
                                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                                    App Name
                                </Typography>
                                <TextField
                                    fullWidth
                                    name="title"
                                    placeholder="Web App Marketplace"
                                    value={formik.values.title}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.title && Boolean(formik.errors.title)}
                                    helperText={formik.touched.title && formik.errors.title}
                                    disabled={submitState === State.loading}
                                />
                            </Box>

                            {/* App URL and Version Name in Row */}
                            <Box sx={{ display: "flex", gap: 2 }}>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                                        App Url
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        name="link"
                                        placeholder="www.meet-hris.wso2.com"
                                        value={formik.values.link}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={formik.touched.link && Boolean(formik.errors.link)}
                                        helperText={formik.touched.link && formik.errors.link}
                                        disabled={submitState === State.loading}
                                    />
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                                        App Version Name
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        name="versionName"
                                        placeholder="Beta"
                                        value={formik.values.versionName}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={formik.touched.versionName && Boolean(formik.errors.versionName)}
                                        helperText={formik.touched.versionName && formik.errors.versionName}
                                        disabled={submitState === State.loading}
                                    />
                                </Box>
                            </Box>

                            {/* App Description */}
                            <Box>
                                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                                    App Description
                                </Typography>
                                <TextField
                                    fullWidth
                                    name="description"
                                    placeholder="Web App Marketplace"
                                    multiline
                                    rows={3}
                                    value={formik.values.description}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={
                                        formik.touched.description &&
                                        Boolean(formik.errors.description)
                                    }
                                    helperText={
                                        formik.touched.description && formik.errors.description
                                    }
                                    disabled={submitState === State.loading}
                                />
                            </Box>

                            {/* Tag */}
                            <Box>
                                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                                    Tags
                                </Typography>
                                <Autocomplete
                                    multiple
                                    options={tags || []}
                                    getOptionLabel={(option) => option.name}
                                    value={tags?.filter((t) => formik.values.tags.includes(t.id)) || []}
                                    onChange={(_, newValue) => {
                                        formik.setFieldValue("tags", newValue.map((tag) => tag.id));
                                    }}
                                    onBlur={formik.handleBlur}
                                    disabled={submitState === State.loading}
                                    renderTags={(value, getTagProps) =>
                                        value.map((option, index) => (
                                            <Chip
                                                {...getTagProps({ index })}
                                                key={option.id}
                                                label={option.name}
                                                sx={{
                                                    backgroundColor: option.color ? `${option.color}1A` : "#e0e0e0",
                                                    border: option.color ? `2px solid ${option.color}80` : "2px solid #bdbdbd",
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
                                            placeholder="Select one or more tags"
                                            error={formik.touched.tags && Boolean(formik.errors.tags)}
                                            helperText={formik.touched.tags && (formik.errors.tags as string)}
                                        />
                                    )}
                                />
                            </Box>

                            {/* User Groups */}
                            <Box>
                                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
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
                                    disabled={submitState === State.loading}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            name="groupIds"
                                            placeholder="Select user groups"
                                            error={
                                                formik.touched.groupIds && Boolean(formik.errors.groupIds)
                                            }
                                            helperText={formik.touched.groupIds && (formik.errors.groupIds as string)}
                                        />
                                    )}
                                />
                            </Box>
                        </Box>

                        <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 3 }}>
                            {/* App Icon Upload */}
                            <Box sx={{ width: "100%" }}>
                                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
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
                                        onClick={() =>
                                            document.getElementById("file-upload")?.click()
                                        }
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
                                            <Typography>
                                                Drag and drop file or{" "}
                                                <Box
                                                    component="span"
                                                    sx={{ color: "primary.main", cursor: "pointer" }}
                                                >
                                                    select file
                                                </Box>
                                            </Typography>
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
                                                    <Typography variant="body2" fontWeight={500}>
                                                        App Icon
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {(filePreview.file.size / (1024 * 1024)).toFixed(2)}mb
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <IconButton
                                                onClick={handleRemoveFile}
                                                disabled={submitState === State.loading}
                                            >
                                                <CloseIcon />
                                            </IconButton>
                                        </Box>
                                        {filePreview.uploading && (
                                            <Box sx={{ mt: 2 }}>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={filePreview.progress}
                                                />
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
                                        mt: 1,
                                    }}
                                >
                                    <Typography variant="caption" color="text.secondary">
                                        Supported formats : svg
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Maximum size : 10mb
                                    </Typography>
                                </Box>

                                {/* Error message */}
                                {formik.touched.icon && formik.errors.icon && (
                                    <Typography variant="caption" color="error" sx={{ mt: 1, display: "block" }}>
                                        {formik.errors.icon as string}
                                    </Typography>
                                )}
                            </Box>

                            {/* Show general error */}
                            {submitState === State.failed && stateMessage && (
                                <Alert severity="error" >
                                    {stateMessage}
                                </Alert>
                            )}

                        </Box>
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
                            onClick={handleClose}
                            disabled={submitState === State.loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={submitState === State.loading || !formik.isValid}
                        >
                            {submitState === State.loading ? "Creating..." : "Create App"}
                        </Button>
                    </Box>
                </form>
            </Box>
        </Box>
    )
}