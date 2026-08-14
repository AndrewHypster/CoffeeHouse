import { NextResponse } from "next/server";
import { db } from "@/lib/db/index";
import { users } from "@/lib/db/schema";

// GET: Читання авторів
export async function GET(request: Request) {
  try {
    const result = await db
      .select({
        id: users.id,
        name: users.name,
            avatar: users.avatar,
            avatar_type: users.avatar_type,
      })
      .from(users)
      .orderBy(users.id)

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("DB GET ERROR", error);
    return NextResponse.json(
      { error: "Помилка при читанні авторів" },
      { status: 500 },
    );
  }
}