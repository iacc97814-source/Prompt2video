export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = process.env.REPLICATE_API_TOKEN;

  if (!token) {
    return res.status(500).json({
      error: "REPLICATE_API_TOKEN is not configured on the server."
    });
  }

  const id = String(req.query?.id || "").trim();

  if (!id) {
    return res.status(400).json({
      error: "Prediction id is required."
    });
  }

  try {
    const response = await fetch(
      `https://api.replicate.com/v1/predictions/${encodeURIComponent(id)}`,
      {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error:
          data.detail ||
          data.error ||
          "Could not read prediction."
      });
    }

    return res.status(200).json({
      id: data.id,
      status: data.status,
      output: data.output || null,
      error: data.error || null
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message || "Server error."
    });
  }
}
