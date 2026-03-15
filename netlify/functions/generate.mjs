// ── netlify/functions/generate.mjs ──
// Two endpoints:
//   POST /api/generate  → text completions (grok-4-1-fast-non-reasoning)
//   POST /api/vision    → image/receipt/PDF processing (grok-2-vision-latest for images, text extraction for PDFs)

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
            text: `Extract every purchased grocery item from the following receipt or order confirmation text.

PARSING RULES:
- This may be an Instacart delivery order, Costco order, grocery store receipt, or email confirmation
- Instacart format: items appear as "Nx ProductName, size\nItem XXXXXX\nsize/unit\n$price" — the quantity is the number before "x", the price is the dollar amount WITHOUT strikethrough (the actual paid price)
- Ignore: Item codes (e.g. "Item 1234567"), strikethrough prices (these are original prices, not paid), tip lines, subtotal lines, delivery fee lines, membership credit lines, "Items Subtotal", "Total" summary lines
- For quantity: "3 x Kirkland Milk" means quantity 3
- For price: use the LOWER price when both a sale price and original price appear
- Store name: look for "Costco", "Wegmans", "Whole Foods", etc. in the text. If Instacart is delivering from Costco, storeName is "Costco"
- Detect date from any date strings in the text

TEXT:
${textContent}

Return ONLY valid JSON, nothing else:
{
  "storeName": "Costco",
  "date": "YYYY-MM-DD or null",
  "total": "dollar amount of final total or null",
  "items": [
    { "name": "Mama Mancini's Jumbo Beef Meatballs 48oz", "quantity": 1, "price": "$10.99", "category": "Meat & Seafood" },
    { "name": "Kirkland Signature Whole Milk 1 gal", "quantity": 3, "price": "$12.45", "category": "Dairy & Eggs" }
  ]
}

Categories: Produce, Meat & Seafood, Dairy & Eggs, Bakery, Frozen, Canned & Dry, Snacks, Beverages, Household, Personal Care, Other`,
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
              "You are an expert receipt and grocery order parser. You handle photo receipts, scanned text, email confirmations, and PDF receipts including Costco warehouse receipts (which use item codes and abbreviated names). You ALWAYS respond with valid JSON only — no markdown, no backticks, no explanation. Your response must start with { and end with }. For Costco PDFs: item descriptions are often abbreviated — expand them to human-readable names (e.g. \"KS BATH TISS\" becomes \"Kirkland Signature Bath Tissue\", \"KS OLIVE OIL\" becomes \"Kirkland Signature Olive Oil\"). Always include every line item — do not skip items. Infer quantities from multipliers like \"2 @\" or \"x2\". For household/Costco items, use categories: Household, Snacks, Beverages, Dairy & Eggs, Meat & Seafood, Produce, Bakery, Frozen, Personal Care, Canned & Dry, Other.",
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
