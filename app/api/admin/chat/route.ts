import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const prompt = body?.prompt;
    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "missing prompt" }, { status: 400 });
    }

    const resp: any = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
    let text = "";
    if (typeof resp === "string") text = resp;
    text = text || resp?.text || resp?.output?.[0]?.content || resp?.candidates?.[0]?.content || resp?.candidates?.[0]?.text || "";

    return NextResponse.json({ reply: text });
  } catch (err: any) {
    console.error("/api/admin/chat error:", err);
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}

export async function PATCH() {
  return NextResponse.json({ success: false, error: "Not implemented" }, { status: 404 });
}
