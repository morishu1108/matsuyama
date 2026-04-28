import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const record = await db.studyRecord.findUnique({
    where: { id },
    include: { category: true, tags: { include: { tag: true } } },
  });
  if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(record);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { title, content, duration, date, categoryId, tags } = body;

  await db.tagsOnRecords.deleteMany({ where: { recordId: id } });

  const record = await db.studyRecord.update({
    where: { id },
    data: {
      title,
      content,
      duration: Number(duration),
      date: date ? new Date(date) : undefined,
      categoryId: categoryId || null,
      tags: {
        create: tags
          ? await Promise.all(
              (tags as string[]).map(async (name: string) => {
                const tag = await db.tag.upsert({
                  where: { name },
                  update: {},
                  create: { name },
                });
                return { tagId: tag.id };
              })
            )
          : [],
      },
    },
    include: { category: true, tags: { include: { tag: true } } },
  });

  return NextResponse.json(record);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.studyRecord.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
