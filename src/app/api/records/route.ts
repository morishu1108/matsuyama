import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get("categoryId");
  const tag = searchParams.get("tag");

  const records = await db.studyRecord.findMany({
    where: {
      ...(categoryId ? { categoryId } : {}),
      ...(tag
        ? { tags: { some: { tag: { name: tag } } } }
        : {}),
    },
    include: {
      category: true,
      tags: { include: { tag: true } },
    },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(records);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, content, duration, date, categoryId, tags } = body;

  const record = await db.studyRecord.create({
    data: {
      title,
      content,
      duration: Number(duration),
      date: date ? new Date(date) : new Date(),
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
    include: {
      category: true,
      tags: { include: { tag: true } },
    },
  });

  return NextResponse.json(record, { status: 201 });
}
