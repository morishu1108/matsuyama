"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { BookOpen, Calendar, Clock, TrendingUp } from "lucide-react";
import type { Stats, StudyRecord } from "@/lib/types";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import Link from "next/link";

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<StudyRecord[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/stats").then((r) => r.json()),
      fetch("/api/records").then((r) => r.json()),
    ]).then(([s, records]) => {
      setStats(s);
      setRecent(records.slice(0, 5));
    });
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">ダッシュボード</h1>
        <p className="text-muted-foreground text-sm mt-1">学習の進捗を確認しましょう</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              総記録数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalRecords ?? "—"}</div>
            <p className="text-xs text-muted-foreground mt-1">件</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              今週の学習
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.weekHours ?? "—"}</div>
            <p className="text-xs text-muted-foreground mt-1">時間</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              今月の学習
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.monthHours ?? "—"}</div>
            <p className="text-xs text-muted-foreground mt-1">時間</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            過去30日の学習時間
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.dailyData ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={stats.dailyData}
                margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
              >
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
                  interval={4}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
                  unit="h"
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "6px",
                    fontSize: "12px",
                  }}
                  formatter={(v: unknown) => [`${v}時間`, "学習時間"]}
                />
                <Bar dataKey="hours" radius={[3, 3, 0, 0]} fill="var(--color-primary)" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
              読み込み中...
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">カテゴリ別</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats?.categoryData && stats.categoryData.length > 0 ? (
              stats.categoryData.map((c) => (
                <div key={c.name} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ background: c.color }}
                    />
                    {c.name}
                  </span>
                  <span className="text-muted-foreground">
                    {Math.round((c.minutes / 60) * 10) / 10}h
                  </span>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">記録がまだありません</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">最近の記録</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recent.length > 0 ? (
              recent.map((r, i) => (
                <div key={r.id}>
                  {i > 0 && <Separator className="my-2" />}
                  <Link href={`/records/${r.id}`} className="block group">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium group-hover:text-primary transition-colors truncate max-w-[160px]">
                        {r.title}
                      </span>
                      <Badge variant="secondary" className="text-xs shrink-0">
                        {r.duration}分
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {format(new Date(r.date), "M月d日(E)", { locale: ja })}
                      {r.category && (
                        <>
                          <span
                            className="ml-2 inline-block h-1.5 w-1.5 rounded-full align-middle"
                            style={{ background: r.category.color }}
                          />
                          <span className="ml-1">{r.category.name}</span>
                        </>
                      )}
                    </p>
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">記録がまだありません</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
