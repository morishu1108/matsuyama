import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { startOfWeek, startOfMonth, subDays, format } from "date-fns";

export async function GET() {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const monthStart = startOfMonth(now);

  const [totalRecords, weekRecords, monthRecords, allRecords, categories] =
    await Promise.all([
      db.studyRecord.count(),
      db.studyRecord.findMany({ where: { date: { gte: weekStart } } }),
      db.studyRecord.findMany({ where: { date: { gte: monthStart } } }),
      db.studyRecord.findMany({
        where: { date: { gte: subDays(now, 29) } },
        orderBy: { date: "asc" },
      }),
      db.category.findMany({
        include: { studyRecords: true },
      }),
    ]);

  const weekMinutes = weekRecords.reduce((s, r) => s + r.duration, 0);
  const monthMinutes = monthRecords.reduce((s, r) => s + r.duration, 0);

  // Daily chart data (last 30 days)
  const dailyMap: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    const d = format(subDays(now, i), "MM/dd");
    dailyMap[d] = 0;
  }
  for (const r of allRecords) {
    const d = format(new Date(r.date), "MM/dd");
    if (d in dailyMap) dailyMap[d] += r.duration;
  }
  const dailyData = Object.entries(dailyMap).map(([date, minutes]) => ({
    date,
    minutes,
    hours: Math.round((minutes / 60) * 10) / 10,
  }));

  // Category breakdown
  const categoryData = categories
    .filter((c) => c.studyRecords.length > 0)
    .map((c) => ({
      name: c.name,
      color: c.color,
      minutes: c.studyRecords.reduce((s, r) => s + r.duration, 0),
    }));

  return NextResponse.json({
    totalRecords,
    weekHours: Math.round((weekMinutes / 60) * 10) / 10,
    monthHours: Math.round((monthMinutes / 60) * 10) / 10,
    dailyData,
    categoryData,
  });
}
