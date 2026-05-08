import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patientId");

    const sessions = await prisma.clinicalSession.findMany({
      where: {
        userId: session.user.id,
        ...(patientId ? { patientId } : {}),
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            age: true,
            gender: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error("SESSIONS_GET_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { patientId, duration, transcript, summary, medicalData } = body;

    if (!patientId) {
      return new NextResponse("Patient ID is required", { status: 400 });
    }

    const clinicalSession = await prisma.clinicalSession.create({
      data: {
        patientId,
        userId: session.user.id,
        duration,
        transcript,
        summary,
        medicalData, // This stores the JSON structure for symptoms, diagnosis, etc.
        status: "Completed",
      },
    });

    return NextResponse.json(clinicalSession);
  } catch (error) {
    console.error("SESSIONS_POST_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
