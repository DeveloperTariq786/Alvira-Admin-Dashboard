import { storage } from "../firebase"; // Assuming firebase.ts is in src folder
import { ref, uploadBytesResumable, getDownloadURL, UploadTaskSnapshot } from "firebase/storage";

interface UploadedImageData {
  name: string;
  url: string;
  path: string;
}

/**
 * Uploads an image file to Firebase Storage and returns its name, download URL, and storage path.
 * @param file The image file to upload.
 * @param pathPrefix The prefix for the storage path (e.g., 'gallery', 'product-images'). Defaults to 'images'.
 * @param onProgress Optional callback to track upload progress (receives snapshot).
 * @returns Promise<UploadedImageData>
 */
export const uploadImageAndGetURL = async (
  file: File,
  pathPrefix: string = "images",
  onProgress?: (snapshot: UploadTaskSnapshot) => void
): Promise<UploadedImageData> => {
  if (!file) {
    throw new Error("No file provided for upload.");
  }
  if (!file.type.startsWith("image/")) {
    throw new Error("Invalid file type. Only images are allowed.");
  }

  // Create a unique file name to avoid overwrites, e.g., images/1678886400000-my-image.png
  const timestamp = new Date().getTime();
  const uniqueFileName = `${timestamp}-${file.name.replace(/\s+/g, '_')}`; // Replace spaces with underscores
  const storagePath = `${pathPrefix}/${uniqueFileName}`;
  const storageRef = ref(storage, storagePath);

  try {
    const uploadTask = uploadBytesResumable(storageRef, file);

    if (onProgress) {
      uploadTask.on('state_changed', onProgress);
    }

    // Wait for the upload to complete
    await uploadTask;

    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);

    return {
      name: file.name,
      url: downloadURL,
      path: storagePath, // Return the full path in storage
    };
  } catch (error: any) {
    console.error("Error uploading image to Firebase Storage:", error);
    // Provide more specific error messages if possible
    if (error.code) {
      switch (error.code) {
        case 'storage/unauthorized':
          throw new Error("Permission denied. Check your Firebase Storage security rules.");
        case 'storage/canceled':
          throw new Error("Upload canceled.");
        case 'storage/unknown':
          throw new Error("An unknown error occurred during upload. Please try again.");
        default:
          throw new Error(`Firebase Storage error: ${error.message}`);
      }
    }
    throw new Error(`Failed to upload image: ${error.message || 'Unknown error'}`);
  }
};

/**
 * Deletes an image from Firebase Storage.
 * @param imagePath The full path of the image in Firebase Storage (e.g., 'images/1678886400000-my-image.png').
 * @returns Promise<void>
 */
// TODO: Implement deleteImage function if needed later
// import { deleteObject } from "firebase/storage";
// export const deleteImage = async (imagePath: string): Promise<void> => {
//   const imageRef = ref(storage, imagePath);
//   try {
//     await deleteObject(imageRef);
//   } catch (error: any) {
//     console.error("Error deleting image from Firebase Storage:", error);
//     if (error.code === 'storage/object-not-found') {
//       console.warn(`Image not found at path: ${imagePath}. It might have been already deleted.`);
//       return; // Or throw a specific error if strictness is required
//     }
//     throw new Error(`Failed to delete image: ${error.message || 'Unknown error'}`);
//   }
// };

// Example of how to use onProgress:
// uploadImageAndGetURL(file, 'user-uploads', (snapshot) => {
//   const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
//   console.log('Upload is ' + progress + '% done');
// }); 