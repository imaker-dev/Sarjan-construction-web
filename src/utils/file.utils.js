export const formatFileSize = (bytes, roundUp = false) => {
  if (typeof bytes !== "number" || isNaN(bytes) || bytes < 0)
    return "Invalid size";
  if (bytes === 0) return "0 KB"; //  no Bytes

  const k = 1024;
  const sizes = ["KB", "MB", "GB", "TB"];

  //  force minimum index = 1 (KB)
  const i =
    Math.max(
      1,
      Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length),
    ) - 1;

  const size = bytes / Math.pow(k, i + 1); // adjust power

  const formatted = roundUp ? Math.ceil(size) : size.toFixed(2);

  return `${formatted} ${sizes[i]}`;
};