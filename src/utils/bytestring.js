const TB = 1024 * 1024 * 1024 * 1024,
      GB = 1024 * 1024 * 1024,
      MB = 1024 * 1024,
      KB = 1024

const bytesToString = (bytes, { speed = false, format, fixed = 2 }) => {
  if (bytes > 0) {
    if (format === "TB") return (bytes / TB).toFixed(fixed)
    if (format === "GB") return (bytes / GB).toFixed(fixed)
    if (format === "MB") return (bytes / MB).toFixed(fixed)
    if (format === "KB") return (bytes / KB).toFixed(fixed)
  }

  if (bytes / TB > 1) return (bytes / TB).toFixed(fixed) + (speed ? " TB/s" : " TB")
  if (bytes / GB > 1) return (bytes / GB).toFixed(fixed) + (speed ? " GB/s" : " GB")
  if (bytes / MB > 1) return (bytes / MB).toFixed(fixed) + (speed ? " MB/s" : " MB")
  if (bytes / KB > 1) return (bytes / KB).toFixed(fixed) + (speed ? " KB/s" : " KB")
  return speed ? "0.00 KB/s" : "0.00KB"
}

export default bytesToString