// ── netlify/functions/generate.mjs ──
// Two endpoints:
//   POST /api/generate  → text completions (grok-4-1-fast-non-reasoning)
//   POST /api/vision    → image/receipt processing (grok-2-vision-latest)

const xai = async (apiKey, payload) => {
  const response = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || "API error " + response.status);
  }
  return data;
};

const toTransformed = (data) => ({
  content:
    data.choices?.map((c) => ({
      type: "text",
      text: c.message?.content || "",
    })) || [],
});

export default async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "No API key configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const url = new URL(req.url);
  const path = url.pathname;

  try {
    const body = await req.json();

    // ── VISION endpoint ──────────────────────────────────────────────────────
    if (path === "/api/vision") {
      const { imageBase64, mimeType = "image/jpeg", prompt, textContent } = body;

      let userContent;

      if (imageBase64) {
        userContent = [
          {
            type: "image_url",
            image_url: {
              url: `data:${mimeType};base64,${imageBase64}`,
              detail: "high",
            },
          },
          {
            type: "text",
            text:
              prompt ||
              `You are reading a grocery/store receipt. Extract every purchased item.
Return ONLY valid JSON:
{
  "storeName": "store name or null",
  "date": "YYYY-MM-DD or null",
  "total": "dollar amount string or null",
  "items": [
    { "name": "item name", "quantity": 1, "price": "dollar amount or null", "category": "one of: Produce, Meat & Seafood, Dairy & Eggs, Bakery, Frozen, Canned & Dry, Snacks, Beverages, Household, Personal Care, Other" }
  ]
}
Be thorough — capture every line item. Normalize item names (e.g. "ORG WHOLE MLK" becomes "Organic Whole Milk"). Infer category from context.`,
          },
        ];
      } else if (textContent) {
        userContent = [
          {
            type: "text",
            text: `You are reading a grocery order confirmation or receipt in text/email form. Extract every purchased item.
Text:
${textContent}

Return ONLY valid JSON:
{
  "storeName": "store name or null",
  "date": "YYYY-MM-DD or null",
  "total": "dollar amount string or null",
  "items": [
    { "name": "item name", "quantity": 1, "price": "dollar amount or null", "category": "one of: Produce, Meat & Seafood, Dairy & Eggs, Bakery, Frozen, Canned & Dry, Snacks, Beverages, Household, Personal Care, Other" }
  ]
}`,
          },
        ];
      } else {
        return new Response(
          JSON.stringify({ error: "Provide imageBase64 or textContent" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      const data = await xai(apiKey, {
        model: "grok-2-vision-latest",
        max_tokens: 4096,
        temperature: 0.1,
        messages: [
          {
            role: "system",
            content:
              "You are a receipt parser. You ALWAYS respond with valid JSON only — no markdown, no backticks, no explanation. Your response must start with { and end with }.",
          },
          { role: "user", content: userContent },
        ],
      });

      return new Response(JSON.stringify(toTransformed(data)), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ── TEXT / GENERATE endpoint ─────────────────────────────────────────────
    const { messages, max_tokens = 8192 } = body;

    const data = await xai(apiKey, {
      model: "grok-4-1-fast-non-reasoning",
      max_tokens,
      temperature: 1.0,
      messages: [
        {
          role: "system",
          content:
            "You are a professional family meal planner. You ALWAYS respond with valid JSON only — no markdown, no backticks, no explanation text before or after the JSON. Your response must start with { and end with }. You know thousands of family-friendly recipes and can suggest meals beyond what the user provides. Every recipe must include exact measurements, temperatures, and cooking times. Format all prep steps and cooking steps as arrays of SHORT individual steps — one task per step, one sentence max. Never combine multiple recipes into one step.",
        },
        ...messages,
      ],
    });

    return new Response(JSON.stringify(toTransformed(data)), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Server error: " + error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

export const config = { path: ["/api/generate", "/api/vision"] };
