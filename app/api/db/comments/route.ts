import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { commentLikes, comments, users } from "@/lib/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { getServerSession } from "next-auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const postId = Number(searchParams.get("postId"));

  if (!postId) {
    return Response.json({ error: "postId is required" }, { status: 400 });
  }

  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: "session is required" }, { status: 403 });
  }

  const userId = session.user.id;

  const commentsResult = await db
    .select({
      id: comments.id,
      content: comments.content,
      createdAt: comments.createdAt,

      authorId: comments.authorId,
      author: users.name,
      avatar: users.avatar,
      avatar_type: users.avatar_type,

      parentId: comments.parentId,

      likesCount: sql<number>`
      (
        SELECT COUNT(*)
        FROM ${commentLikes}
        WHERE ${commentLikes.commentId} = ${comments.id}
      )
    `.as("likes_count"),

      liked: userId
        ? sql<boolean>`
          EXISTS (
            SELECT 1
            FROM ${commentLikes}
            WHERE ${commentLikes.commentId} = ${comments.id}
            AND ${commentLikes.userId} = ${userId}
          )
        `.as("liked")
        : sql<boolean>`false`.as("liked"),
    })
    .from(comments)
    .leftJoin(users, eq(comments.authorId, users.id))
    .where(eq(comments.poemId, postId))
    .orderBy(desc(comments.createdAt));

  return Response.json(commentsResult);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = Number(session.user.id);

  const body = await request.json();

  const { postId, content, parentId = null } = body;

  if (!postId || !content?.trim()) {
    return Response.json(
      { error: "postId and content are required" },
      { status: 400 },
    );
  }

  const newComment = await db
    .insert(comments)
    .values({
      authorId: userId,
      poemId: Number(postId),
      parentId: parentId ? Number(parentId) : null,
      content: content.trim(),
    })
    .returning();

  return Response.json(newComment, { status: 201 });
}
