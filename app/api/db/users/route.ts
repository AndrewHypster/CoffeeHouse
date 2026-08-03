import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, name, mail, role } = body;

    if (typeof id !== "number") {
      return NextResponse.json(
        { error: "Невірний ідентифікатор користувача" },
        { status: 400 },
      );
    }

    const data: Partial<typeof users.$inferInsert> = {};

    if (typeof name === "string") {
      data.name = name.trim();
    }

    if (typeof mail === "string") {
      data.mail = mail.trim();
    }

    if (typeof role === "string") {
      data.role = role;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "Немає даних для оновлення" },
        { status: 400 },
      );
    }

    const [updatedUser] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("DB PATCH ERROR", error);
    return NextResponse.json(
      { error: "Помилка при оновленні користувача" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const rows = await db
      .select({ id: users.id, name: users.name })
      .from(users)
      .orderBy(users.id);
    return NextResponse.json(rows);
  } catch (error) {
    console.error("USERS GET ERROR", error);
    return NextResponse.json(
      { error: "Помилка при читанні користувачів" },
      { status: 500 },
    );
  }
}
