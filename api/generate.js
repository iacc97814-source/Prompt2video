export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = process.env.REPLICATE_API_TOKEN;

  if (!token) {
    return res.status(500).json({
      error: "REPLICATE_API_TOKEN is not configured."
    });
  }

  try {
    const body =
      typeof req.body === "string"
        ? JSON.parse(req.body)
        : (req.body || {});

    const prompt = String(body.prompt || "").trim();
    const duration = Number(body.duration || 15);
    const style = String(body.style || "Cinematic realistic");

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required." });
    }

    if (![5, 10, 15].includes(duration)) {
      return res.status(400).json({
        error: "Duration must be 5, 10 or 15 seconds."
      });
    }

    const finalPrompt = `${prompt}

Visual style: ${style}.
Create natural movement, believable facial expressions,
consistent characters, cinematic camera movement and detailed lighting.
If characters speak, include natural spoken dialogue and clear voices.
Create a coherent cinematic video.`;

    const response = await fetch(
      "https://api.replicate.com/v1/models/kwaivgi/kling-v3-video/predictions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Prefer": "wait=1"
        },
        body: JSON.stringify({
          input: {
            mode: "pro",
            prompt: finalPrompt,
            duration: duration,
            aspect_ratio: "16:9",
            generate_audio: true,
            negative_prompt:
              "blurry faces, broken anatomy, extra fingers, duplicate people, distorted objects"
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.detail || data.error || "Replicate request failed."
      });
    }

    return res.status(200).json({
      id: data.id,
      status: data.status,
      output: data.output || null
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message || "Server error."
    });
  }
}
