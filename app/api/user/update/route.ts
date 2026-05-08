import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { name, crm, specialty } = body;

    const updatedUser = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        name,
        crm,
        specialty,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("USER_UPDATE_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
