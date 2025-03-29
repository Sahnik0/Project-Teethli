
// Cloudinary configuration
const CLOUD_NAME = "dkrlsysdg";
const UPLOAD_PRESET = "election_candidates";

// Type definitions for Cloudinary responses
interface CloudinaryUploadResponse {
  public_id: string;
  secure_url: string;
  format: string;
  width: number;
  height: number;
  created_at: string;
  resource_type: string;
  tags: string[];
  bytes: number;
  type: string;
  url: string;
  original_filename: string;
}

/**
 * Uploads an image to Cloudinary
 * @param imageFile - The file to upload
 * @param folder - Optional folder name to organize uploads
 * @returns Promise with the upload response
 */
export const uploadToCloudinary = async (
  imageFile: File,
  folder = "patient_images"
): Promise<CloudinaryUploadResponse> => {
  try {
    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("folder", folder);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Cloudinary upload failed:", errorText);
      throw new Error(`Cloudinary upload failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log("Cloudinary upload successful:", result);
    return result;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
};

/**
 * Gets a responsive image URL with transformations
 * @param publicId - Cloudinary public ID
 * @param maxWidth - Maximum width for responsive image
 * @returns Optimized image URL
 */
export const getOptimizedImageUrl = (publicId: string, maxWidth = 800): string => {
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/c_limit,w_${maxWidth},q_auto,f_auto/${publicId}`;
};

/**
 * Creates a Cloudinary transformation URL for thumbnail
 * @param publicId - Cloudinary public ID
 * @returns Thumbnail image URL
 */
export const getThumbnailUrl = (publicId: string): string => {
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/c_thumb,w_200,h_200,g_face/${publicId}`;
};
