"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { buttonVariants } from "@/components/ui/button";
import type { StudyRecord } from "@/lib/types";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

export default function RecordsPage() {
  const [records, setRecords] = useState<StudyRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecords = () =>
    fetch("/api/records")
      .then((r) => r.json())
      .then((data) => { setRecords(data); setLoading(false); });

  useEffect(() => { fetchRecords(); }, []);

  const handleDelete = async (id: string) => {
    await fetch(`/api/records/${id}`, { method: "DELETE" });
    toast.success("記録を削除しました");
    fetchRecords();
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">学習記録</h1>
          <p className="text-muted-foreground text-sm mt-1">{records.length} 件</p>
        </div>
        <Link href="/records/new" className={buttonVariants()}>
          <PlusCircle className="h-4 w-4 mr-2" />
          追加
        </Link>
      </div>

      {loading ? (
        <div className="text-muted-foreground text-sm">読み込み中...</div>
      ) : records.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">記録がまだありません</p>
            <Link href="/records/new" className={buttonVariants({ className: "mt-4" })}>
              最初の記録を追加する
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {records.map((r) => (
            <Card key={r.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/records/${r.id}`}
                        className="font-medium hover:text-primary transition-colors truncate"
                      >
                        {r.title}
                      </Link>
                      {r.category && (
                        <Badge
                          variant="outline"
                          className="text-xs gap-1 shrink-0"
                          style={{ borderColor: r.category.color + "80" }}
                        >
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ background: r.category.color }}
                          />
                          {r.category.name}
                        </Badge>
                      )}
                      {r.tags.map(({ tag }) => (
                        <Badge key={tag.id} variant="secondary" className="text-xs shrink-0">
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>{format(new Date(r.date), "yyyy年M月d日(E)", { locale: ja })}</span>
                      <Separator orientation="vertical" className="h-3" />
                      <span>{r.duration}分</span>
                      {r.content && (
                        <>
                          <Separator orientation="vertical" className="h-3" />
                          <span className="truncate max-w-[300px]">{r.content}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Link
                      href={`/records/${r.id}`}
                      className={buttonVariants({ variant: "ghost", size: "icon", className: "h-8 w-8" })}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Link>
                    <AlertDialog>
                      <AlertDialogTrigger
                        render={<Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" />}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>記録を削除しますか？</AlertDialogTitle>
                          <AlertDialogDescription>
                            「{r.title}」を削除します。この操作は元に戻せません。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>キャンセル</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(r.id)} className="bg-destructive text-white hover:bg-destructive/80">
                            削除する
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
