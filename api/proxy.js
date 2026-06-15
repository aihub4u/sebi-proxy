export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  // DEBUG endpoint - GET request returns info
  if (req.method === "GET") {
    return res.status(200).json({ status: "proxy alive", time: new Date().toISOString() });
  }

  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const TARGET = "https://appiyouat.karix.solutions/appiyo/d/project/sebi_feedback_report/api/sebi_feedback_report";
  const TOKEN  = "W3ldogtBI4PYuwFPuS098vlEgqaHbthe4Ci1fin0CpIfXZJCEMLuKFgxM9RtZPcl";

  try {
    // Always send a valid body - use incoming body or default date range
    const incoming = req.body && Object.keys(req.body).length > 0
      ? req.body
      : { ProcessVariables: { from_date: "2026-06-01T00:00:00.000", to_date: "2026-06-15T23:59:59.999Z" } };

    const bodyStr = JSON.stringify(incoming);

    const upstream = await fetch(TARGET, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "authentication-token": TOKEN,
      },
      body: bodyStr,
    });

    const text = await upstream.text();
    const statusCode = upstream.status;

    // Return everything for debugging
    let parsed;
    try { parsed = JSON.parse(text); } catch { parsed = null; }

    if (statusCode >= 400) {
      return res.status(statusCode).json({
        error: "Upstream API error",
        upstream_status: statusCode,
        upstream_body: parsed ?? text,
        sent_body: incoming,
      });
    }

    return res.status(200).json(parsed ?? { raw: text });

  } catch (err) {
    return res.status(502).json({
      error: err.message,
      type: err.constructor.name,
    });
  }
}
