import { NextResponse } from "next/server";
import { db } from "@/lib/db/index";
import { poems, users } from "@/lib/db/schema";
import { desc, asc, eq, ilike, and } from "drizzle-orm";

// GET: Читання всіх віршів (сортування за датою та автором)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, parseInt(searchParams.get("limit") || "10"));
    const offset = (page - 1) * limit;

    const authorQuery = searchParams.get("author"); // може бути ім'ям або ID
    const search = searchParams.get("search");

    const conditions = [];

    // Фільтрація за назвою вірша
    if (search) {
      conditions.push(ilike(poems.title, `%${search}%`));
    }

    // Фільтрація за автором (якщо передано текст або ID)
    if (authorQuery) {
      const authorId = Number(authorQuery);
      if (!Number.isNaN(authorId)) {
        conditions.push(eq(poems.authorId, authorId));
      } else {
        conditions.push(ilike(users.name, `%${authorQuery}%`));
      }
    }

    // Використовуємо звичайний select з join замість db.query
    const result = await db
      .select({
        id: poems.id,
        title: poems.title,
        content: poems.content,
        createdAt: poems.createdAt,
        author: {
          name: users.name,
        },
      })
      .from(poems)
      .leftJoin(users, eq(poems.authorId, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(poems.createdAt), asc(poems.authorId))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("DB GET ERROR", error);
    return NextResponse.json(
      { error: "Помилка при читанні віршів" },
      { status: 500 },
    );
  }
}

// POST: Запис нового вірша
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { author_id = '0', title, content } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Заповни всі обов’язкові поля!" },
        { status: 400 },
      );
    }

    const authorId = Number(author_id);
    if (Number.isNaN(authorId)) {
      return NextResponse.json(
        { error: "Невірний author_id" },
        { status: 400 },
      );
    }

    const newPoem = await db
      .insert(poems)
      .values({
        authorId,
        title,
        content,
      })
      .returning(); // .returning() повертає створений рядок (працює в Postgres)

    return NextResponse.json(
      { success: true, poem: newPoem[0] },
      { status: 201 },
    );
  } catch (error) {
    console.error("DB POST ERROR", error);
    return NextResponse.json(
      { error: "Помилка при збереженні вірша" },
      { status: 500 },
    );
  }
}
