import { NextResponse } from "next/server";
import { db } from "@/lib/db/index";
import { desc, asc } from "drizzle-orm";
import { poems } from "@/lib/db/schema";

// GET: Читання всіх віршів (сортування за датою та автором)
export async function GET() {
  try {
    const allPoems = await db.query.poems.findMany({
      orderBy: [desc(poems.createdAt), asc(poems.author)],
    });
    return NextResponse.json(allPoems, { status: 200 });
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
