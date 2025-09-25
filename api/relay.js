export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { subject, html, to, reply_to } = req.body;

    const payload = {
      from: "Truck Agent Finder <quotes@yourdomain.com>", // must match your domain DNS setup with Resend
      to,
      reply_to,
      subject,
      html
    };

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
      return res.status(500).json({ error: "Failed to send", details: data });
    }

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Unexpected error" });
  }
}
