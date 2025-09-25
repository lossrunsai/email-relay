export default async function handler(req, res) {
  // --- CORS handling ---
  const ORIGIN = 'https://truckagentfinder.com';
; // for testing; later change to 'https://truckagentfinder.com'
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', ORIGIN);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Max-Age', '86400');
    return res.status(200).end();
  }
  res.setHeader('Access-Control-Allow-Origin', ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // --- Only allow POST requests (after handling OPTIONS) ---
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Pull values from request body
    const { subject, html, to, reply_to } = req.body;

    // Resend payload
    const payload = {
      from: "Truck Agent Finder <quotes@mail.truckagentfinder.com>", // must match verified domain in Resend
      to,
      reply_to,
      subject,
      html
    };

    // Send email via Resend
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await resp.json();

    if (!resp.ok) {
      console.error("Resend error:", data);
      return res.status(502).json({ error: "resend_failed", details: data });
    }

    // Success
    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("Relay error:", err);
    return res.status(500).json({ error: "relay_error" });
  }
}
