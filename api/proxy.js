export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    // Vercel auto-parses body as object — stringify it back for the upstream call
    const bodyToSend = typeof req.body === "string" ? req.body : JSON.stringify(req.body);

    const upstream = await fetch(
      "https://appiyouat.karix.solutions/appiyo/d/project/sebi_feedback_report/api/sebi_feedback_report",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "authentication-token": "W3ldogtBI4PYuwFPuS098vlEgqaHbthe4Ci1fin0CpIfXZJCEMLuKFgxM9RtZPcl",
        },
        body: bodyToSend,
      }
    );

    const text = await upstream.text();

    // Try to parse as JSON, fall through as text if not
    let data;
    try { data = JSON.parse(text); } catch { data = text; }

    res.status(upstream.status).json(
      typeof data === "object" ? data : { raw: data }
    );
  } catch (err) {
    res.status(502).json({ error: err.message, stack: err.stack });
  }
}
