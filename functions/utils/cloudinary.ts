import path from 'path';
const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const uploadToCloudinary = async (image: string, public_id: string) => {
  try {
    const { secure_url } = await cloudinary.uploader.upload(
      path.join(__dirname, '..', '..', '..', '..', '..', image),
      {
        public_id,
        unique_filename: false,
        folder: 'images',
        overwrite: true,
      }
    );
    return secure_url;
  } catch (error) {
    throw error;
  }
};

// : `Neebook_${user?.firstName}_${user?.lastName}_${userId}`
