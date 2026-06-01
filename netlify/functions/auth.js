exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  try {
    const { password } = JSON.parse(event.body || '{}');
    const ok = !!process.env.ADMIN_PASSWORD && password === process.env.ADMIN_PASSWORD;
    return {
      statusCode: ok ? 200 : 401,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok }),
    };
  } catch {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false }),
    };
  }
};
