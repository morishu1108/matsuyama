"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PlusCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Goal, Category, Stats } from "@/lib/types";

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [targetHours, setTargetHours] = useState("");
  const [period, setPeriod] = useState<"weekly" | "monthly">("weekly");
  const [categoryId, setCategoryId] = useState("none");

  const fetchAll = () =>
    Promise.all([
      fetch("/api/goals").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/stats").then((r) => r.json()),
    ]).then(([g, c, s]) => {
      setGoals(g);
      setCategories(c);
      setStats(s);
    });

  useEffect(() => { fetchAll(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetHours) return;
    setLoading(true);
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          targetHours: Number(targetHours),
          period,
          categoryId: categoryId === "none" ? null : categoryId,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("目標を追加しました");
      setTitle("");
      setTargetHours("");
      setPeriod("weekly");
      setCategoryId("none");
      setOpen(false);
      fetchAll();
    } catch {
      toast.error("追加に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/goals/${id}`, { method: "DELETE" });
    toast.success("目標を削除しました");
    fetchAll();
  };

  const getProgress = (goal: Goal) => {
    if (!stats) return 0;
    const actual = goal.period === "weekly" ? stats.weekHours : stats.monthHours;
    return Math.min(100, Math.round((actual / goal.targetHours) * 100));
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">目標設定</h1>
          <p className="text-muted-foreground text-sm mt-1">学習目標を管理しましょう</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button />}>
            <PlusCircle className="h-4 w-4 mr-2" />
            追加
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>目標を追加</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label htmlFor="gtitle">目標名</Label>
                <Input
                  id="gtitle"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="例: 毎週10時間勉強する"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="targetHours">目標時間（時間）</Label>
                  <Input
                    id="targetHours"
                    type="number"
                    min={1}
                    value={targetHours}
                    onChange={(e) => setTargetHours(e.target.value)}
                    placeholder="10"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>期間</Label>
                  <Select value={period} onValueChange={(v) => setPeriod((v ?? "weekly") as "weekly" | "monthly")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">週間</SelectItem>
                      <SelectItem value="monthly">月間</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>カテゴリ（任意）</Label>
                <Select value={categoryId} onValueChange={(v) => setCategoryId(v ?? "none")}>
                  <SelectTrigger>
                    <SelectValue placeholder="選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">なし</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "追加中..." : "追加する"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {goals.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">目標がまだありません</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {goals.map((g) => {
            const progress = getProgress(g);
            const actual = g.period === "weekly" ? stats?.weekHours : stats?.monthHours;
            return (
              <Card key={g.id}>
                <CardContent className="py-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{g.title}</span>
                        <Badge variant="outline" className="text-xs">
                          {g.period === "weekly" ? "週間" : "月間"}
                        </Badge>
                        {g.category && (
                          <Badge
                            variant="outline"
                            className="text-xs gap-1"
                            style={{ borderColor: g.category.color + "80" }}
                          >
                            <span
                              className="h-1.5 w-1.5 rounded-full"
                              style={{ background: g.category.color }}
                            />
                            {g.category.name}
                          </Badge>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {actual ?? 0} / {g.targetHours} 時間
                          </span>
                          <span
                            className={
                              progress >= 100
                                ? "text-green-400 font-medium"
                                : "text-muted-foreground"
                            }
                          >
                            {progress}%
                            {progress >= 100 && " 達成！"}
                          </span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger
                        render={<Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive shrink-0" />}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>目標を削除しますか？</AlertDialogTitle>
                          <AlertDialogDescription>
                            「{g.title}」を削除します。この操作は元に戻せません。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>キャンセル</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(g.id)}>
                            削除する
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
