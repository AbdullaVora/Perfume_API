const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


/**
 * Uploads an image to Cloudinary
 * @param {String} image - Base64 string or image URL
 * @param {String} folder - Folder to store the image
 * @returns {Promise<String>} - URL of uploaded image
 */
const uploadImage = async (image, folder = 'products') => {
  try {
    // Skip upload if it's already a URL
    if (typeof image === 'string' && !image.startsWith('data:image')) {
      return image;
    }

    const result = await cloudinary.uploader.upload(image, {
      folder,
      resource_type: 'auto',
      timeout: 60000, 
    });
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Image upload failed');
  }
};



/**
 * Uploads multiple images
 * @param {Array} images - Array of base64 strings or URLs
 * @param {String} folder - Folder to store images
 * @returns {Promise<Array>} - Array of image URLs
 */
const uploadMultipleImages = async (images = [], folder = 'products') => {
  try {
    const uploadPromises = images.map(img => uploadImage(img, folder));
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Multiple image upload error:', error);
    throw new Error('Failed to upload multiple images');
  }
};

module.exports = {
  uploadImage,
  uploadMultipleImages
};