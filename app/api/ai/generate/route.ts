import { NextRequest, NextResponse } from "next/server";
import { AiRequestSchema } from "@/lib/data/schemas";
import { generateGroundedAi } from "@/lib/ai/provider";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsedRequest = AiRequestSchema.safeParse(body);

    if (!parsedRequest.success) {
      return NextResponse.json(
        { error: "Invalid AI Request format", details: parsedRequest.error.format() },
        { status: 400 }
      );
    }

    const response = await generateGroundedAi(parsedRequest.data);
    return NextResponse.json(response);
  } catch (error: any) {
    console.error("AI Generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI response", message: error.message },
      { status: 500 }
    );
  }
}
