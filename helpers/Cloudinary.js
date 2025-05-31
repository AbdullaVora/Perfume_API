const cloudinary = require('cloudinary').v2;

const normalizeMedia = (media) => {
  if (typeof media === 'string') {
    return media;
  } else if (media && typeof media === 'object' && 'url' in media) {
    return media.url;
  }
  return null; // fallback for unexpected cases
};


// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads media (image or video) to Cloudinary
 * @param {String} media - Base64 string or media URL
 * @param {String} folder - Folder to store the media
 * @returns {Promise<String>} - URL of uploaded media
 */
const uploadMedia = async (media, folder = 'products') => {
  console.log('Uploading media to Cloudinary:', media);
  const mediaFile = normalizeMedia(media);
  try {
    // Skip upload if it's already a URL
    if (!mediaFile.startsWith('data:') && mediaFile.startsWith('https')) {
      return mediaFile;
    }

    const result = await cloudinary.uploader.upload(mediaFile, {
      folder,
      resource_type: 'auto', // auto-detect image/video
      timeout: 60000,
    });

    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Media upload failed');
  }
};

/**
 * Uploads multiple media files (images or videos)
 * @param {Array} mediaFiles - Array of base64 strings or URLs
 * @param {String} folder - Folder to store media files
 * @returns {Promise<Array>} - Array of media URLs
 */
// const uploadMultipleMedia = async (mediaFiles = [], folder = 'products') => {
//   try {
//     console.log('Uploading media fiLES to Cloudinary:', mediaFiles);

//     const uploadPromises = mediaFiles.map(file => uploadMedia(file, folder));
//     return await Promise.all(uploadPromises);
//   } catch (error) {
//     console.error('Multiple media upload error:', error);
//     throw new Error('Failed to upload multiple media files');
//   }
// };

const uploadMultipleMedia = async (mediaFiles = [], folder = 'products') => {
  try {
    const filteredFiles = mediaFiles.filter(Boolean); // removes null/undefined
    console.log('Uploading media files to Cloudinary:', filteredFiles);

    const uploadPromises = filteredFiles.map(file => uploadMedia(file, folder));
    return (await Promise.all(uploadPromises)).filter(Boolean); // skip any failed/null uploads
  } catch (error) {
    console.error('Multiple media upload error:', error);
    throw new Error('Failed to upload multiple media files');
  }
};


module.exports = {
  uploadMedia,
  uploadMultipleMedia
};
