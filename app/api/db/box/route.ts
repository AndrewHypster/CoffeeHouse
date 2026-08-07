import { NextResponse } from "next/server";
import { db } from "@/lib/db/index";
import { box } from "@/lib/db/schema";
import { sql, desc, eq, inArray } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const page = Math.max(1, Number(url.searchParams.get("page") || "1"));
    const limit = Math.min(50, Number(url.searchParams.get("limit") || "10"));
    const offset = (page - 1) * limit;

    const [items, countResult] = await Promise.all([
      db
        .select({ id: box.id, text: box.text, date: box.date })
        .from(box)
        .orderBy(desc(box.date), desc(box.id))
        .limit(limit)
        .offset(offset),
      db.select({ count: sql`count(*)` }).from(box),
    ]);

    const total = Number(countResult[0]?.count ?? 0);
    const pages = Math.max(1, Math.ceil(total / limit));

    return NextResponse.json({ items, total, pages }, { status: 200 });
  } catch (error) {
    console.error("BOX GET ERROR", error);
    return NextResponse.json(
      { error: "Помилка при читанні повідомлень" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Повідомлення має бути текстом." },
        { status: 400 },
      );
    }

    const [newMessage] = await db
      .insert(box)
      .values({
        text,
        date: new Date().toISOString().slice(0, 10),
      })
      .returning();

    return NextResponse.json(
      { ok: true, success: true, message: newMessage },
      { status: 200 },
    );
  } catch (error) {
    console.error("BOX POST ERROR", error);
    return NextResponse.json(
      { error: "Помилка при збереженні повідомлення" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const ids = Array.isArray(body?.ids) ? body.ids : [body?.id];
    const validIds = ids.filter((id) => typeof id === "number");

    if (validIds.length === 0) {
      return NextResponse.json(
        { error: "Потрібно вказати ідентифікатори для видалення" },
        { status: 400 },
      );
    }

    await db.delete(box).where(inArray(box.id, validIds));

    return NextResponse.json({ success: true, deleted: validIds.length });
  } catch (error) {
    console.error("BOX DELETE ERROR", error);
    return NextResponse.json(
      { error: "Помилка при видаленні повідомлень" },
      { status: 500 },
    );
  }
}
