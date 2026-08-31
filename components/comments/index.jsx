"use client";

import s from "./comment.module.css";
import sPc from "./comments-pc.module.css";
import sMob from "./comments-mobile.module.css";
import Avatar from "../avatar";
import Link from "next/link";
import { useComments } from "./provider";
import { useEffect, useMemo, useState } from "react";

const Comment = ({
  authorId,
  avatar,
  avatar_type,
  author,
  createdAt,
  content,
  onReply,
}) => {
  return (
    <div className={s.comment}>
      <div className={s.info}>
        <Link className={s.author} href={`/profile/${authorId}`}>
          <Avatar avatar={avatar} type={avatar_type} />
          <div className="grid">
            <b>{author}</b>
            <small className="text-[.7em]">{createdAt}</small>
          </div>
        </Link>
      </div>

      <p className={s.text}>{content}</p>

      <button
        type="button"
        className="mt-1 text-xs text-gray-500 hover:text-black"
        onClick={onReply}
      >
        Відповісти
      </button>
    </div>
  );
};

const CommentItem = ({ comment, repliesMap, onReply }) => {
  const replies = repliesMap.get(comment.id) ?? [];

  return (
    <li>
      <Comment
        authorId={comment.authorId}
        avatar={comment.avatar}
        avatar_type={comment.avatar_type}
        author={comment.author}
        createdAt={comment.createdAt}
        content={comment.content}
        onReply={() => onReply(comment)}
      />

      {replies.length > 0 && (
        <ul className="pl-[1.5rem]">
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              repliesMap={repliesMap}
              onReply={onReply}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

const ForPC = () => {
  return (
    <div className={sPc.forPC}>
      <h2>For PC</h2>
    </div>
  );
};

const ForMobile = ({ isOpen, setIsOpen, comments, postId, addComment }) => {
  const [content, setContent] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [isSending, setIsSending] = useState(false);

  const repliesMap = useMemo(() => {
    const map = new Map();

    for (const comment of comments) {
      if (comment.parentId === null) continue;

      const replies = map.get(comment.parentId) ?? [];

      replies.push(comment);

      map.set(comment.parentId, replies);
    }

    return map;
  }, [comments]);

  const mainComments = useMemo(() => {
    return comments.filter((comment) => comment.parentId === null);
  }, [comments]);

  const submitComment = async (e) => {
    e.preventDefault();
    const text = content.trim();
    if (!text || !postId || isSending) return;
    setIsSending(true);
    try {
      const response = await fetch("/api/db/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          content: text,
          parentId: replyTo?.id ?? null,
        }),
      });
      if (!response.ok) {
        throw new Error("Не вдалося додати коментар");
      }
      const newComment = await response.json();

      addComment(newComment);

      setContent("");
      setReplyTo(null);
    } catch (error) {
      console.error("CREATE COMMENT ERROR:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleReply = (comment) => {
    console.log("Відповідаю на:", comment.id, comment.author);
    setReplyTo(comment);
  };

  return (
    <div
      className={`${sMob.forMobile} ${isOpen ? sMob.active : ""}`}
      onClick={() => setIsOpen(false)}
    >
      <div className={sMob.content} onClick={(e) => e.stopPropagation()}>
        <h3 className={sMob.title}>
          Коментарі <hr />
        </h3>

        <ul className={sMob.comments}>
          {mainComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              repliesMap={repliesMap}
              onReply={handleReply}
            />
          ))}
        </ul>
        <form
          onSubmit={submitComment}
          className="sticky bottom-0 mt-auto border-t bg-white p-3"
        >
          {replyTo && (
            <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
              <span>
                Відповідь для <b>{replyTo.author}</b>
              </span>

              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="text-gray-400 hover:text-black"
              >
                Скасувати
              </button>
            </div>
          )}

          <div className="flex items-end gap-2">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                replyTo ? "Написати відповідь..." : "Додати коментар..."
              }
              rows={1}
              maxLength={1000}
              className="min-h-[42px] flex-1 resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-gray-400 focus:bg-white"
            />

            <button
              type="submit"
              disabled={!content.trim() || isSending}
              className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-black text-white transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-30"
            >
              {isSending ? "..." : "↑"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CommentBox = () => {
  const { postId, comments, setComments, addComment, isOpen, setIsOpen } =
    useComments();

  useEffect(() => {
    if (!postId) return;

    const loadComments = async () => {
      const response = await fetch(`/api/db/comments?postId=${postId}`);

      const data = await response.json();

      setComments(data);
    };

    loadComments();
  }, [postId, setComments]);

  return (
    <>
      <ForPC isOpen={isOpen} setIsOpen={setIsOpen} comments={comments} />

      <ForMobile
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        comments={comments}
        postId={postId}
        setComments={setComments}
        addComment={addComment}
      />
    </>
  );
};

export default CommentBox;
