// server/utils/uploadToCloudinary.ts

import { getCloudinary } from "./cloudinary";

export interface IUploadedFileResponse {
  filename: string;
  url: string;
  resourceType: string;
}

export interface IUploadResponse {
  status: boolean;
  message: string;
  data?: IUploadedFileResponse;
}

export interface IDeleteResponse {
  status: boolean;
  message: string;
}

export const uploadSingleFile = async (
  file: {
    data: Buffer;
    type?: string;
    filename?: string;
  },
  folderName: string,
  resourceType: "image" | "video" | "raw" | "auto" = "auto"
): Promise<IUploadResponse> => {
  try {
    if (!file?.data) {
      return {
        status: false,
        message: "File data not found",
      };
    }

    const cloudinary = getCloudinary();

    const result = await new Promise<{
      public_id: string;
      secure_url: string;
      resource_type: string;
    }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: folderName,
            resource_type: resourceType,
          },
          (error, result) => {
            if (error || !result) {
              reject(error || new Error("Upload failed"));
              return;
            }

            resolve({
              public_id: result.public_id,
              secure_url: result.secure_url,
              resource_type: result.resource_type,
            });
          }
        )
        .end(file.data);
    });

    return {
      status: true,
      message: "File uploaded successfully",
      data: {
        filename: result.public_id,
        url: result.secure_url,
        resourceType: result.resource_type,
      },
    };
  } catch (error) {
    const err = error as Error;

    return {
      status: false,
      message: err.message,
    };
  }
};

export const deleteSingleFile = async ({
  filename,
  resourceType,
}: {
  filename: string;
  resourceType: "image" | "video" | "raw";
}): Promise<IDeleteResponse> => {
  try {
    const cloudinary = getCloudinary();

    const result = await cloudinary.uploader.destroy(filename, {
      resource_type: resourceType,
    });

    if (result.result !== "ok") {
      return {
        status: false,
        message: "Failed to delete file",
      };
    }

    return {
      status: true,
      message: "File deleted successfully",
    };
  } catch (error) {
    const err = error as Error;

    return {
      status: false,
      message: err.message,
    };
  }
};