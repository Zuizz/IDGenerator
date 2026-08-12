/**
 * HEIC to PNG converter using heic2any.
 * Intercepts HEIC files (common from iPhones) and converts them to PNG blobs.
 */

export async function convertHeicToBlob(file: File): Promise<Blob> {
  // Dynamic import to avoid SSR issues
  const heic2any = (await import("heic2any")).default;

  const result = await heic2any({
    blob: file,
    toType: "image/png",
    quality: 0.9,
  });

  // heic2any can return a single Blob or an array
  if (Array.isArray(result)) {
    return result[0];
  }
  return result;
}

/**
 * Checks if a file is a HEIC image by extension or MIME type.
 */
export function isHeicFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return (
    name.endsWith(".heic") ||
    name.endsWith(".heif") ||
    file.type === "image/heic" ||
    file.type === "image/heif"
  );
}

/**
 * Processes an uploaded file — converts HEIC to PNG if needed,
 * otherwise returns the original file as an object URL.
 */
export async function processImageFile(file: File): Promise<string> {
  if (isHeicFile(file)) {
    const pngBlob = await convertHeicToBlob(file);
    return URL.createObjectURL(pngBlob);
  }
  return URL.createObjectURL(file);
}
