const cloudinary = require('cloudinary').v2;

exports.handler = async () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

  // Return empty gracefully if not yet configured
  if (!cloudName || !process.env.CLOUDINARY_API_KEY) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ images: [], videos: [] }),
    };
  }

  cloudinary.config({
    cloud_name:  cloudName,
    api_key:     process.env.CLOUDINARY_API_KEY,
    api_secret:  process.env.CLOUDINARY_API_SECRET,
  });

  const toImage = (r) => ({
    src:     `https://res.cloudinary.com/${cloudName}/image/upload/q_auto,f_auto/${r.public_id}`,
    thumb:   `https://res.cloudinary.com/${cloudName}/image/upload/c_fill,w_600,h_600,q_auto,f_auto/${r.public_id}`,
    caption: 'Culinary Creation',
    date:    r.created_at,
  });

  const toVideo = (r) => ({
    src:    `https://res.cloudinary.com/${cloudName}/video/upload/q_auto/${r.public_id}`,
    poster: `https://res.cloudinary.com/${cloudName}/video/upload/f_jpg,so_1/${r.public_id}.jpg`,
    date:   r.created_at,
  });

  const byDateDesc = (a, b) => new Date(b.created_at) - new Date(a.created_at);

  try {
    const [imagesRes, videosRes] = await Promise.all([
      cloudinary.api.resources({
        type:          'upload',
        prefix:        'izinceba/',
        resource_type: 'image',
        max_results:   200,
        direction:     'desc',
      }),
      cloudinary.api.resources({
        type:          'upload',
        prefix:        'izinceba/',
        resource_type: 'video',
        max_results:   50,
        direction:     'desc',
      }),
    ]);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=15',
      },
      body: JSON.stringify({
        images: imagesRes.resources.sort(byDateDesc).map(toImage),
        videos: videosRes.resources.sort(byDateDesc).map(toVideo),
      }),
    };
  } catch (err) {
    console.error('Cloudinary fetch error:', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ images: [], videos: [], error: 'Cloudinary unavailable' }),
    };
  }
};
