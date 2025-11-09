export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let data = req.body;
  if (!data) {
    try {
      data = await new Promise((resolve, reject) => {
        let body = '';
        req.on('data', (chunk) => (body += chunk));
        req.on('end', () => resolve(JSON.parse(body || '{}')));
        req.on('error', reject);
      });
    } catch (e) {
      return res.status(400).json({ error: 'Invalid JSON' });
    }
  }

  console.log('Track event:', data);
  // In production forward to analytics provider or store in DB
  return res.status(200).json({ ok: true });
}
