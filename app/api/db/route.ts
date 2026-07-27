import { NextResponse } from "next/server";
import { db } from "@/lib/db/index";
import { poems } from "@/lib/db/schema";
import { desc, asc, eq, ilike, and } from "drizzle-orm";

// GET: Читання всіх віршів (сортування за датою та автором)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Параметри пагінації
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, parseInt(searchParams.get("limit") || "10"));
    const offset = (page - 1) * limit;

    // Параметри фільтрації
    const author = searchParams.get("author");
    const search = searchParams.get("search");

    const conditions = [];

    if (author) {
      conditions.push(eq(poems.author, author));
    }

    if (search) {
      conditions.push(ilike(poems.title, `%${search}%`));
    }

    const result = await db.query.poems.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: [desc(poems.createdAt), asc(poems.author)],
      limit: limit,
      offset: offset,
    });

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
    const { author, title, content } = body;

    if (!author || !title || !content) {
      return NextResponse.json(
        { error: "Заповни всі обов’язкові поля!" },
        { status: 400 },
      );
    }

    const newPoem = await db
      .insert(poems)
      .values({
        author,
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
