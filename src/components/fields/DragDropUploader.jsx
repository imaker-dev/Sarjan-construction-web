import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import Cropper from "react-easy-crop";
import {
  UploadCloud,
  X,
  Crop,
  AlertCircle,
  FileText,
  Film,
} from "lucide-react";
import ModalBasic from "@components/ui/ModalBasic.jsx";
import { formatFileSize } from "@utils/file.utils";

/**
 * Reusable drag & drop uploader (local files only). Light + dark theme ready.
 *
 * Props
 * - value:        File | string | Array<File | string>
 * - onChange:     (files: Array<File | string>) => void
 * - multiple:     allow more than one file
 * - accept:       comma separated MIME types, e.g. "image/*,application/pdf"
 * - maxFiles:     max files when `multiple` is true
 * - maxSize:      max size per file in bytes
 * - size:         "sm" | "md" | "lg"
 * - title:        main text inside the drop area
 * - description:  helper text under the title
 * - disabled:     disable interaction
 * - enableCrop:   open a crop modal for images
 * - aspectRatio:  crop aspect ratio (number)
 * - className:    wrapper classes
 */

const SIZE_CONFIG = {
  sm: {
    container: "min-h-[84px] p-3",
    iconBox: "w-9 h-9",
    icon: "w-4 h-4",
    title: "text-xs font-semibold",
    subtitle: "text-xs",
    info: "text-[11px]",
    preview: "w-16 h-16",
    actionBtn: "w-5 h-5",
    actionIcon: "w-3 h-3",
  },
  md: {
    container: "min-h-[120px] p-4",
    iconBox: "w-11 h-11",
    icon: "w-5 h-5",
    title: "text-sm font-semibold",
    subtitle: "text-xs",
    info: "text-xs",
    preview: "w-20 h-20",
    actionBtn: "w-6 h-6",
    actionIcon: "w-3.5 h-3.5",
  },
  lg: {
    container: "min-h-[170px] p-6",
    iconBox: "w-14 h-14",
    icon: "w-7 h-7",
    title: "text-base font-semibold",
    subtitle: "text-sm",
    info: "text-xs",
    preview: "w-24 h-24",
    actionBtn: "w-7 h-7",
    actionIcon: "w-4 h-4",
  },
};

const IMAGE_REGEX = /\.(jpe?g|png|gif|webp|svg|avif)$/i;
const VIDEO_REGEX = /\.(mp4|webm|mov)$/i;

const getKind = (file) => {
  if (typeof file === "string") {
    if (IMAGE_REGEX.test(file)) return "image";
    if (VIDEO_REGEX.test(file)) return "video";
    return "file";
  }
  if (file.type?.startsWith("image/")) return "image";
  if (file.type?.startsWith("video/")) return "video";
  return "file";
};

// ---------- Crop helpers ----------
const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", reject);
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

const getCroppedBlob = async (imageSrc, pixelCrop, mimeType) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  canvas
    .getContext("2d")
    .drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height,
    );

  return new Promise((resolve) => canvas.toBlob(resolve, mimeType));
};

// ---------- Single preview card ----------
const FilePreview = ({ file, config, canCrop, onCrop, onRemove }) => {
  const kind = getKind(file);
  const isString = typeof file === "string";

  // Create the object URL inside the effect so it's recreated on every mount
  const [objectUrl, setObjectUrl] = useState(null);
  useEffect(() => {
    if (isString) {
      setObjectUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file, isString]);

  const src = isString ? file : objectUrl;
  const name = isString ? file.split("/").pop() : file.name;

  return (
    <div className="group relative">
      <div
        className={`${config.preview} overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-sm transition-all duration-200 group-hover:border-primary-300 group-hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:group-hover:border-primary-500/60`}
      >
        {kind === "image" && src && (
          <img src={src} alt={name} className="h-full w-full object-cover" />
        )}

        {kind === "video" && src && (
          <div className="relative h-full w-full bg-slate-900">
            <video
              src={src}
              className="h-full w-full object-cover opacity-80"
              muted
              playsInline
            />
            <Film className="absolute inset-0 m-auto h-5 w-5 text-white" />
          </div>
        )}

        {kind === "file" && (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 p-1">
            <FileText className="h-6 w-6 text-primary-500 dark:text-primary-400" />
            <span className="w-full truncate px-1 text-center text-[10px] text-slate-500 dark:text-slate-400">
              {name}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="absolute -right-2 -top-2 flex gap-1">
        {canCrop && (
          <button
            type="button"
            title="Crop image"
            aria-label="Crop image"
            onClick={(e) => {
              e.stopPropagation();
              onCrop();
            }}
            className={`${config.actionBtn} flex items-center justify-center rounded-full bg-primary-500 text-white shadow-lg ring-2 ring-white transition-all hover:scale-110 hover:bg-primary-600 dark:ring-slate-900`}
          >
            <Crop className={config.actionIcon} />
          </button>
        )}
        <button
          type="button"
          title="Remove"
          aria-label="Remove file"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className={`${config.actionBtn} flex items-center justify-center rounded-full bg-red-500 text-white shadow-lg ring-2 ring-white transition-all hover:scale-110 hover:bg-red-600 dark:ring-slate-900`}
        >
          <X className={config.actionIcon} />
        </button>
      </div>

      {/* File size for local files */}
      {!isString && (
        <p className="mt-1 text-center text-[10px] text-slate-400 dark:text-slate-500">
          {formatFileSize(file.size)}
        </p>
      )}
    </div>
  );
};

// ---------- Main component ----------
const DragDropUploader = ({
  value = [],
  onChange,
  multiple = false,
  accept = "image/*",
  maxFiles = 5,
  maxSize = 5 * 1024 * 1024,
  size = "lg",
  title,
  description,
  disabled = false,
  enableCrop = false,
  aspectRatio = 1,
  className = "",
}) => {
  const files = Array.isArray(value) ? value : value ? [value] : [];
  const config = SIZE_CONFIG[size] || SIZE_CONFIG.lg;

  const [error, setError] = useState("");
  const [croppingFile, setCroppingFile] = useState(null); // { file, preview, index }
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const addFiles = useCallback(
    (newFiles) => {
      setError("");
      if (multiple) {
        const merged = [...files, ...newFiles];
        if (merged.length > maxFiles) {
          setError(`You can upload up to ${maxFiles} files.`);
        }
        onChange(merged.slice(0, maxFiles));
      } else {
        onChange([newFiles[0]]);
      }
    },
    [files, multiple, maxFiles, onChange],
  );

  const openCropper = (file, index = null) => {
    setCroppingFile({ file, preview: URL.createObjectURL(file), index });
  };

  const closeCropper = () => {
    if (croppingFile?.preview) URL.revokeObjectURL(croppingFile.preview);
    setCroppingFile(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  };

  const applyCrop = async () => {
    if (!croppingFile || !croppedAreaPixels) return;
    try {
      const mime =
        croppingFile.file.type === "image/png" ? "image/png" : "image/jpeg";
      const blob = await getCroppedBlob(
        croppingFile.preview,
        croppedAreaPixels,
        mime,
      );
      const croppedFile = new File([blob], croppingFile.file.name, {
        type: mime,
      });

      if (croppingFile.index !== null) {
        // Replace the existing file
        onChange(
          files.map((f, i) => (i === croppingFile.index ? croppedFile : f)),
        );
      } else {
        addFiles([croppedFile]);
      }
      closeCropper();
    } catch (err) {
      console.error("Error cropping image:", err);
      setError("Failed to crop image");
    }
  };

  const onDrop = useCallback(
    (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles?.length) {
        const code = rejectedFiles[0].errors[0]?.code;
        if (code === "file-too-large")
          setError(
            `File is too large. Max size is ${formatFileSize(maxSize)}.`,
          );
        else if (code === "file-invalid-type")
          setError(`File type not supported. Accepted: ${accept}`);
        else if (code === "too-many-files")
          setError(`You can upload up to ${multiple ? maxFiles : 1} file(s).`);
        else setError("File could not be added.");
        return;
      }

      if (!acceptedFiles?.length) return;

      // Crop the first image, add the rest directly
      if (enableCrop && acceptedFiles[0].type.startsWith("image/")) {
        const [first, ...rest] = acceptedFiles;
        if (rest.length) addFiles(rest);
        openCropper(first);
      } else {
        addFiles(acceptedFiles);
      }
    },
    [accept, maxSize, maxFiles, multiple, enableCrop, addFiles],
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      multiple,
      disabled,
      maxSize,
      maxFiles: multiple ? maxFiles : 1,
      accept:
        accept === "*/*"
          ? undefined
          : accept.split(",").reduce((acc, type) => {
              acc[type.trim()] = [];
              return acc;
            }, {}),
    });

  const removeFile = (index) => {
    setError("");
    onChange(files.filter((_, i) => i !== index));
  };

  const isImageOnly = accept
    .split(",")
    .every((t) => t.trim().startsWith("image/"));

  return (
    <div className={`w-full ${className}`}>
      {/* Crop modal */}
      {enableCrop && (
        <ModalBasic
          id="image-crop"
          title="Crop Image"
          isOpen={!!croppingFile}
          onClose={closeCropper}
          size="2xl"
        >
          <div className="p-4">
            <div className="relative h-96 w-full overflow-hidden rounded-xl bg-slate-900">
              {croppingFile && (
                <Cropper
                  image={croppingFile.preview}
                  crop={crop}
                  zoom={zoom}
                  aspect={aspectRatio}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)}
                  objectFit="contain"
                  showGrid
                  classes={{ cropAreaClassName: "border-2 border-primary-500" }}
                />
              )}
            </div>

            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeCropper}
                className="btn border border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={applyCrop}
                className="btn bg-primary-500 text-white hover:bg-primary-600"
              >
                Apply Crop
              </button>
            </div>
          </div>
        </ModalBasic>
      )}

      {/* Drop area */}
      <div
        {...getRootProps()}
        className={`group relative flex items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed text-center transition-all duration-300 ${
          config.container
        } ${
          disabled
            ? "cursor-not-allowed border-slate-200 bg-slate-50 opacity-60 dark:border-slate-800 dark:bg-slate-900"
            : isDragReject
              ? "cursor-pointer border-red-400 bg-red-50 dark:border-red-500/60 dark:bg-red-500/10"
              : isDragActive
                ? "cursor-pointer border-primary-500 bg-primary-50 ring-4 ring-primary-100 dark:bg-primary-500/10 dark:ring-primary-500/20"
                : "cursor-pointer border-slate-300 bg-white hover:border-primary-400 hover:bg-primary-50/50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-primary-500/60 dark:hover:bg-primary-500/5"
        }`}
      >
        <input {...getInputProps()} />

        {/* Soft decorative glow */}
        <div className="pointer-events-none absolute -top-10 left-1/2 h-24 w-48 -translate-x-1/2 rounded-full bg-primary-200/30 opacity-0 blur-3xl transition-opacity duration-300 group-hover:opacity-100 dark:bg-primary-500/20" />

        <div className="relative flex flex-col items-center gap-2">
          <div
            className={`${config.iconBox} flex items-center justify-center rounded-2xl shadow-sm transition-all duration-300 ${
              isDragReject
                ? "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400"
                : isDragActive
                  ? "-translate-y-1 scale-110 bg-primary-500 text-white"
                  : "bg-primary-50 text-primary-600 group-hover:-translate-y-0.5 group-hover:bg-primary-100 dark:bg-primary-500/10 dark:text-primary-400 dark:group-hover:bg-primary-500/20"
            }`}
          >
            <UploadCloud className={config.icon} />
          </div>

          <div>
            <p
              className={`${config.title} ${
                isDragReject
                  ? "text-red-600 dark:text-red-400"
                  : "text-slate-900 dark:text-white"
              }`}
            >
              {isDragReject
                ? "This file type isn't allowed"
                : isDragActive
                  ? "Drop to upload"
                  : title || (
                      <>
                        Drag & drop or{" "}
                        <span className="text-primary-600 underline-offset-2 group-hover:underline dark:text-primary-400">
                          browse
                        </span>
                      </>
                    )}
            </p>
            <p
              className={`${config.subtitle} mt-1 text-slate-500 dark:text-slate-400`}
            >
              {description ||
                (multiple
                  ? `Upload up to ${maxFiles} files`
                  : "Upload a single file")}
            </p>
            <p
              className={`${config.info} mt-1.5 text-slate-400 dark:text-slate-500`}
            >
              {isImageOnly ? "Images only" : "All supported files"} · Max{" "}
              {formatFileSize(maxSize)}
              {enableCrop && " · Crop available"}
            </p>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="mt-3 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 dark:border-red-500/20 dark:bg-red-500/10"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Previews */}
      {files.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-4">
          {files.map((file, index) => (
            <FilePreview
              key={
                typeof file === "string"
                  ? file
                  : `${file.name}-${file.lastModified}-${index}`
              }
              file={file}
              config={config}
              canCrop={
                enableCrop && file instanceof File && getKind(file) === "image"
              }
              onCrop={() => openCropper(file, index)}
              onRemove={() => removeFile(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DragDropUploader;