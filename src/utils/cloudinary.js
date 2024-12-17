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
        if (!link) return null;

        let publicId = link.replace("https://res.cloudinary.com/poshithcloud/image/upload/", "");
        publicId = publicId.replace("http://res.cloudinary.com/poshithcloud/image/upload/", "");
        publicId = publicId.split(".")[0];
        publicId = publicId.split("/");
        publicId.shift();
        publicId = publicId.join("/");

        // console.log("Extracted Public ID:", publicId);

        if (!publicId) return null;

        // Log Cloudinary config before calling destroy
        // console.log("Cloudinary Config:", cloudinary.config());

        // Call destroy
        const response = await cloudinary.uploader.destroy(publicId, { invalidate: true });
        // console.log("Delete Response:", response);

        return response;
    } catch (error) {
        console.error("Error deleting on Cloudinary:", error.message || error);
        return null;
    }
};



export {uploadOnCloudinary, deleteFromCloudinary}