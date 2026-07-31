import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { and, eq, ne } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function PATCH(request: Request) {
  try {
    const { name, mail } = await request.json();

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Не авторизовано" },
        { status: 401 }
      );
    }

    const data: Partial<typeof users.$inferInsert> = {};

    if (typeof name === "string" && name.trim()) {
      data.name = name.trim();
    }

    if (typeof mail === "string" && mail.trim()) {
      // перевірка, щоб пошта не була зайнята
      const exists = await db.query.users.findFirst({
        where: and(
          eq(users.mail, mail.trim()),
          ne(users.id, session.user.id)
        ),
      });

      if (exists) {
        return NextResponse.json(
          { error: "Ця пошта вже використовується" },
          { status: 400 }
        );
      }

      data.mail = mail.trim();
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "Немає даних для оновлення" },
        { status: 400 }
      );
    }

    const [updatedUser] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, session.user.id))
      .returning();

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("DB PATCH ERROR", error);

    return NextResponse.json(
      { error: "Помилка при оновленні користувача" },
      { status: 500 }
    );
  }
}