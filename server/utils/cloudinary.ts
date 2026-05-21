import { v2 as cloudinary } from "cloudinary"

export function useCloudinary() {
  const config = useRuntimeConfig()
  cloudinary.config({
    cloud_name: config.cloudinaryCloudName,
    api_key: config.cloudinaryApiKey,
    api_secret: config.cloudinaryApiSecret,
  })
  return cloudinary
}

export async function uploadDocument(buffer: Buffer, options?: { filename?: string; mimetype?: string }): Promise<{ url: string; publicId: string }> {
  const c = useCloudinary()
  return new Promise((resolve, reject) => {
    const uploadStream = c.uploader.upload_stream(
      { folder: "broker-docs", resource_type: "auto" },
      (err, result) => {
        if (err || !result) return reject(err || new Error("Upload failed"))
        resolve({ url: result.secure_url, publicId: result.public_id })
      }
    )
    uploadStream.end(buffer)
  })
}

export async function deleteDocument(publicId: string) {
  const c = useCloudinary()
  return c.uploader.destroy(publicId)
}
