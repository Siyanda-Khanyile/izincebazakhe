exports.handler = async () => ({
  statusCode: 200,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=3600',
  },
  body: JSON.stringify({
    cloudName:    process.env.CLOUDINARY_CLOUD_NAME    || '',
    uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET || '',
  }),
});
