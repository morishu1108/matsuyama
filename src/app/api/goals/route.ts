import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const goals = await db.goal.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(goals);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const goal = await db.goal.create({
    data: {
      title: body.title,
      targetHours: Number(body.targetHours),
      period: body.period,
      categoryId: body.categoryId || null,
    },
    include: { category: true },
  });
  return NextResponse.json(goal, { status: 201 });
}
