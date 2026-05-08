import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const staff = await prisma.staff.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(staff);
  } catch (error) {
    console.error("STAFF_GET_ERROR", error);
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
    const { name, role, crm, email, phone, specialty } = body;

    if (!name || !role) {
      return new NextResponse("Name and role are required", { status: 400 });
    }

    const staffMember = await prisma.staff.create({
      data: {
        name,
        role,
        crm,
        email,
        phone,
        specialty,
        userId: session.user.id,
      },
    });

    return NextResponse.json(staffMember);
  } catch (error) {
    console.error("STAFF_POST_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
