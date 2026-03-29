import { GoogleGenAI } from "@google/genai";
import { GenerationOutputSchema } from "../../src/lib/schemas";
import { z } from "zod";
import { createAuth } from "@/lib/auth";

export async function onRequestPost(context: any) {
  const { request, env } = context;
  const auth = createAuth(env.DB);

  // 1. verify BetterAuth session
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
    });
  }

  const userTier = session.user.tier || "free";

  try {
    const body = await request.json();
    const { prompt, systemInstruction, requestedModel } = body;

    // 2. check user tier
    if (userTier !== "pro") {
      return new Response(
        JSON.stringify({
          error: "pro tier required for server-side generation",
        }),
        { status: 403 },
      );
    }

    // 3. figure out which model to use
    // free tier is locked to gemini-2.5-flash
    // pro tier can use any gemini-2.* or gemini-3.* model
    let modelToUse = "gemini-2.5-flash";

    if (userTier === "pro") {
      const isAllowedProModel =
        requestedModel &&
        (requestedModel.startsWith("gemini-2.") ||
          requestedModel.startsWith("gemini-3."));
      modelToUse = isAllowedProModel ? requestedModel : "gemini-2.0-pro"; // default pro model
    }

    const apiKey = env.GEMINI_MASTER_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "server misconfigured: missing api key" }),
        { status: 500 },
      );
    }

    // 4. initialize ai and generate content with structured output (responseJsonSchema)
    const ai = new GoogleGenAI({ apiKey });

    // transform zod schema to json schema for the ai
    const jsonSchema = z.toJSONSchema(GenerationOutputSchema);

    const response = await ai.models.generateContent({
      model: modelToUse,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseJsonSchema: jsonSchema,
      },
    });

    return new Response(JSON.stringify({ text: response.text }), {
      headers: { "content-type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
