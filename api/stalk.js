// api/stalk.js
const axios = require('axios');

module.exports = async (req, res) => {
  // Setup CORS agar bisa diakses dari frontend mana saja (opsional)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  try {
    // 1. Get Turnstile Token
    const { data: solver } = await axios.post(
      'https://fathurweb.qzz.io/api/solver/turnstile-min',
      new URLSearchParams({
        url: 'https://www.anonymous-viewer.com',
        siteKey: '0x4AAAAAABNbm8zfrpvm5sRD'
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }}
    );

    if (!solver.status || !solver.result) {
      throw new Error('Gagal mendapatkan cfToken dari solver');
    }

    const cfToken = solver.result;

    // 2. Get TikTok Data
    const { data } = await axios.get(
      `https://www.anonymous-viewer.com/api/tiktok/display?username=${username}`,
      {
        headers: {
          "accept": "*/*",
          "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
          "user-agent": "Mozilla/5.0 (Linux; Android 10)",
          "x-turnstile-token": cfToken,
          "referer": `https://www.anonymous-viewer.com/tiktok/${username}`
        }
      }
    );

    // Return hasil ke frontend
    return res.status(200).json(data);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ 
      error: error.message || 'Terjadi kesalahan pada server',
      details: 'Mungkin API Solver down atau target memblokir request.'
    });
  }
};
