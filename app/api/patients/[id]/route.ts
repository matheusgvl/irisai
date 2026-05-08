import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const patient = await prisma.patient.findUnique({
      where: {
        id: id,
        userId: session.user.id,
      },
      include: {
        sessions: {
          orderBy: {
            date: "desc",
          },
        },
      },
    });

    if (!patient) {
      return new NextResponse("Not Found", { status: 404 });
    }

    return NextResponse.json(patient);
  } catch (error) {
    console.error("PATIENT_GET_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await prisma.patient.delete({
      where: {
        id: id,
        userId: session.user.id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("PATIENT_DELETE_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
