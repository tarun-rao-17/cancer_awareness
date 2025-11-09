export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let data = req.body;
  // fallback: try to parse body (platforms vary)
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

  const { name, email, message } = data || {};
  if (!name || !email || !message) {
    return res.status(422).json({ error: 'Missing fields' });
  }

  // In production you should forward this to an email, CRM, or DB.
  // If SENDGRID_API_KEY is provided, you could send via SendGrid here.
  // For now we log to the server logs (visible in Vercel) and return success.
  console.log('Contact submission:', { name, email, message });

  return res.status(200).json({ ok: true });
}
