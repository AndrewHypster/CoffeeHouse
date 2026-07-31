import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const formData = await request.formData();

    const userId = Number(formData.get("userId"));
    const mail = formData.get("mail");

    if (!userId || !mail) {
      return NextResponse.json(
        { error: "userId та mail обов'язкові" },
        { status: 400 },
      );
    }

    // Перевірити, чи пошта вже не використовується
    const existing = await db.query.users.findFirst({
      where: eq(users.mail, mail),
    });

    if (existing) {
      return NextResponse.json(
        { error: "Ця пошта вже прив'язана" },
        { status: 409 },
      );
    }

    // Прив'язати пошту лише до користувача, у якого вона ще не встановлена
    const [updatedUser] = await db
      .update(users)
      .set({ mail })
      .where(and(eq(users.id, userId), isNull(users.mail)))
      .returning();

    if (!updatedUser) {
      return NextResponse.json(
        { error: "Користувача не знайдено або він вже прив'язаний" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("LINK ACCOUNT ERROR:", error);

    return NextResponse.json(
      { error: "Внутрішня помилка сервера" },
      { status: 500 },
    );
  }
}
