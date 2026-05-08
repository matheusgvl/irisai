import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { startOfWeek, endOfWeek, subMonths, startOfMonth, endOfMonth, format } from "date-fns";
import { ptBR } from "date-fns/locale";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const now = new Date();
    
    // Core KPIs
    const sessionsThisWeek = await prisma.clinicalSession.count({
      where: {
        userId: session.user.id,
        date: { gte: startOfWeek(now), lte: endOfWeek(now) },
      },
    });

    const totalCompleted = await prisma.clinicalSession.count({
      where: { userId: session.user.id, status: "Completed" },
    });

    const totalPatients = await prisma.patient.count({ 
      where: { userId: session.user.id } 
    });

    // Time-series data for the last 6 months
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const start = startOfMonth(monthDate);
      const end = endOfMonth(monthDate);

      const count = await prisma.clinicalSession.count({
        where: {
          userId: session.user.id,
          date: { gte: start, lte: end },
        },
      });

      monthlyData.push({
        month: format(monthDate, "MMM", { locale: ptBR }),
        manual: count * 1, // Assume 1 hour per manual session
        ai: (count * 10) / 60, // 10 mins with AI
        count
      });
    }

    const totalTimeSaved = monthlyData.reduce((acc, curr) => acc + (curr.manual - curr.ai), 0);

    return NextResponse.json({
      kpis: {
        sessionsThisWeek,
        totalCompleted,
        totalPatients,
        totalTimeSaved: parseFloat(totalTimeSaved.toFixed(1)),
      },
      monthlyData
    });
  } catch (error) {
    console.error("ANALYTICS_GET_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
