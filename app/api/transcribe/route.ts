import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import openai from "@/lib/openai";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new NextResponse("No file provided", { status: 400 });
    }

    // OpenAI Whisper expects a file. We can pass the File object directly
    // since Next.js Request.formData() returns a standard File object.
    const response = await openai.audio.transcriptions.create({
      file: file,
      model: "whisper-1",
      language: "pt", 
    });

    return NextResponse.json({ transcript: response.text });
  } catch (error) {
    console.error("TRANSCRIBE_POST_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
