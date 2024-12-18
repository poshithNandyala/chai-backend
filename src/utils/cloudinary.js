import {v2 as cloudinary} from "cloudinary"
import fs from "fs"


cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded successfull
        //console.log("file is uploaded on cloudinary ", response.url);
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}

const deleteFromCloudinary = async (link) => {
    try {
        // If no link is provided, return an error response
        if (!link) {
            console.error("Error: No link provided for deletion.");
            return { status: 'error', message: "No link provided for deletion." };
        }

        // Extract the public ID from the link (handling both image and video links).
        let publicId = link.replace("https://res.cloudinary.com/poshithcloud/image/upload/", "");
        publicId = publicId.replace("http://res.cloudinary.com/poshithcloud/image/upload/", "");
        publicId = publicId.replace("https://res.cloudinary.com/poshithcloud/video/upload/", "");
        publicId = publicId.replace("http://res.cloudinary.com/poshithcloud/video/upload/", "");

        // Remove file extension from the publicId.
        publicId = publicId.split(".")[0];

        // Ensure the publicId is formatted correctly (removing possible path components).
        publicId = publicId.split("/").slice(1).join("/");

        // If publicId extraction fails, return an error message
        if (!publicId) {
            console.error("Error: Invalid URL - Cannot extract the public ID.");
            return { status: 'error', message: "Invalid URL: Cannot extract the public ID." };
        }

        // Determine the resource type: "image" or "video", based on the URL
        const resourceType = link.includes("/image/") ? "image" : "video";

        // Attempt to delete the resource from Cloudinary
        const response = await cloudinary.uploader.destroy(publicId, {
            invalidate: true,        // Invalidate the cached URL after deletion
            resource_type: resourceType  // Specify whether the resource is an image or video
        });

        // If the resource is not found, return a relevant message
        if (response.result === 'not found') {
            console.error(`Error: Resource with Public ID: ${publicId} could not be found on Cloudinary.`);
            return { status: 'error', message: `Resource with Public ID: ${publicId} could not be found on Cloudinary.` };
        }

        // Return success if the resource was deleted successfully
        return {
            status: 'success',
            message: `Resource with Public ID: ${publicId} has been successfully deleted.`,
            data: response
        };

    } catch (error) {
        // Log the error in case of an unexpected issue
        console.error("Error deleting from Cloudinary:", error.message || error);
        return {
            status: 'error',
            message: `Error deleting from Cloudinary: ${error.message || error}`
        };
    }
};




export {uploadOnCloudinary, deleteFromCloudinary}