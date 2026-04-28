"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { RecordForm } from "@/components/records/RecordForm";
import type { StudyRecord } from "@/lib/types";

export default function RecordDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [record, setRecord] = useState<StudyRecord | null>(null);

  useEffect(() => {
    fetch(`/api/records/${id}`)
      .then((r) => r.json())
      .then(setRecord);
  }, [id]);

  if (!record) {
    return (
      <div className="p-6 text-muted-foreground text-sm">読み込み中...</div>
    );
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-semibold mb-6">記録を編集</h1>
      <RecordForm record={record} />
    </div>
  );
}
