"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Pause, RotateCcw, X } from "lucide-react";
import { toast } from "sonner";
import type { Category, StudyRecord } from "@/lib/types";
import { format } from "date-fns";

type Props = {
  record?: StudyRecord;
};

export function RecordForm({ record }: Props) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState(record?.title ?? "");
  const [content, setContent] = useState(record?.content ?? "");
  const [duration, setDuration] = useState(record?.duration?.toString() ?? "");
  const [date, setDate] = useState(
    record?.date ? format(new Date(record.date), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd")
  );
  const [categoryId, setCategoryId] = useState(record?.categoryId ?? "none");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(
    record?.tags?.map((t) => t.tag.name) ?? []
  );
  const [loading, setLoading] = useState(false);

  // Timer
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories);
  }, []);

  useEffect(() => {
    if (timerRunning) {
      intervalRef.current = setInterval(() => setTimerSeconds((s) => s + 1), 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerRunning]);

  const timerToMinutes = () => Math.ceil(timerSeconds / 60);

  const applyTimer = () => {
    setDuration(timerToMinutes().toString());
    toast.success(`${timerToMinutes()}分を記録時間に設定しました`);
  };

  const formatTimer = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return h > 0
      ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
      : `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const addTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      const t = tagInput.trim().toLowerCase();
      if (!tags.includes(t)) setTags((prev) => [...prev, t]);
      setTagInput("");
    }
  };

  const removeTag = (t: string) => setTags((prev) => prev.filter((x) => x !== t));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return toast.error("タイトルを入力してください");
    if (!duration || Number(duration) <= 0) return toast.error("学習時間を入力してください");

    setLoading(true);
    try {
      const body = {
        title: title.trim(),
        content: content.trim() || null,
        duration: Number(duration),
        date,
        categoryId: categoryId === "none" ? null : categoryId,
        tags,
      };

      const res = await fetch(record ? `/api/records/${record.id}` : "/api/records", {
        method: record ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error();
      toast.success(record ? "記録を更新しました" : "記録を追加しました");
      router.push("/records");
      router.refresh();
    } catch {
      toast.error("保存に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Timer */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">学習タイマー</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <span className="font-mono text-3xl font-semibold tabular-nums w-28">
              {formatTimer(timerSeconds)}
            </span>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={timerRunning ? "secondary" : "default"}
                onClick={() => setTimerRunning((v) => !v)}
              >
                {timerRunning ? (
                  <><Pause className="h-4 w-4 mr-1" />一時停止</>
                ) : (
                  <><Play className="h-4 w-4 mr-1" />開始</>
                )}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => { setTimerRunning(false); setTimerSeconds(0); }}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              {timerSeconds > 0 && (
                <Button type="button" size="sm" variant="outline" onClick={applyTimer}>
                  時間を適用
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form fields */}
      <div className="grid gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="title">タイトル *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例: React Hooks の復習"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="duration">学習時間（分）*</Label>
            <Input
              id="duration"
              type="number"
              min={1}
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="60"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="date">日付</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>カテゴリ</Label>
          <Select value={categoryId} onValueChange={(v) => setCategoryId(v ?? "none")}>
            <SelectTrigger>
              <SelectValue placeholder="選択してください" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">なし</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  <span className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: c.color }}
                    />
                    {c.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="tags">タグ（Enter で追加）</Label>
          <Input
            id="tags"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={addTag}
            placeholder="例: javascript"
          />
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {tags.map((t) => (
                <Badge key={t} variant="secondary" className="gap-1 pr-1">
                  {t}
                  <button type="button" onClick={() => removeTag(t)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="content">メモ</Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="学習内容・気づき・メモなど"
            rows={5}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "保存中..." : record ? "更新する" : "追加する"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          キャンセル
        </Button>
      </div>
    </form>
  );
}
