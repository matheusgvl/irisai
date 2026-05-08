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

    const clinicalSession = await prisma.clinicalSession.findUnique({
      where: {
        id: id,
        userId: session.user.id,
      },
      include: {
        patient: true,
      },
    });

    if (!clinicalSession) {
      return new NextResponse("Not Found", { status: 404 });
    }

    return NextResponse.json(clinicalSession);
  } catch (error) {
    console.error("SESSION_GET_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { medicalData, summary } = body;

    const updatedSession = await prisma.clinicalSession.update({
      where: {
        id: id,
        userId: session.user.id,
      },
      data: {
        ...(medicalData ? { medicalData } : {}),
        ...(summary ? { summary } : {}),
      },
    });

    return NextResponse.json(updatedSession);
  } catch (error) {
    console.error("SESSION_PATCH_ERROR", error);
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

    await prisma.clinicalSession.delete({
      where: {
        id: id,
        userId: session.user.id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("SESSION_DELETE_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
