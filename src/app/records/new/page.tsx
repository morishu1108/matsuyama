import { RecordForm } from "@/components/records/RecordForm";

export default function NewRecordPage() {
  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-semibold mb-6">学習記録を追加</h1>
      <RecordForm />
    </div>
  );
}
