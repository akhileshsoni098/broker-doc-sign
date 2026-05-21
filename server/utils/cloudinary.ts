// server/utils/cloudinary.ts

import { v2 as cloudinary } from "cloudinary";

let isConfigured = false;

export function configureCloudinary() {
  if (isConfigured) return cloudinary;

  const config = useRuntimeConfig();

  cloudinary.config({
    cloud_name: config.cloudinaryCloudName,
    api_key: config.cloudinaryApiKey,
    api_secret: config.cloudinaryApiSecret,
  });

  isConfigured = true;
  return cloudinary;
}

export function getCloudinary() {
  return configureCloudinary();
}

export default cloudinary;