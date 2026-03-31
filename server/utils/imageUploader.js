const cloudinary = require('cloudinary').v2


exports.uploadImageToCloudinary = async (file, folder, height, quality) => {
    if (!file || !file.tempFilePath) {
        throw new Error("Invalid file provided for Cloudinary upload");
    }

    const options = { folder };
    if (height) {
        options.height = height;
    }
    if (quality) {
        options.quality = quality;
    }

    let resourceType = "auto";
    if (file.mimetype) {
        if (file.mimetype.startsWith("video") || file.mimetype.startsWith("audio")) {
            resourceType = "video";
        } else if (file.mimetype.startsWith("image")) {
            resourceType = "image";
        }
    }

    options.resource_type = resourceType;

    // Use chunked upload for larger media, especially video inputs.
    if (resourceType === "video") {
        options.chunk_size = parseInt(process.env.CLOUDINARY_CHUNK_SIZE, 10) || 6000000; // 6MB

        try {
            return await cloudinary.uploader.upload_large(file.tempFilePath, options);
        } catch (uploadLargeError) {
            console.warn("Cloudinary upload_large failed, falling back to upload:", uploadLargeError.message);
            return await cloudinary.uploader.upload(file.tempFilePath, options);
        }
    }

    return await cloudinary.uploader.upload(file.tempFilePath, options);
}