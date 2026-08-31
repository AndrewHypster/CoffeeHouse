"use client";

import Link from "next/link";
import s from "./post.module.css";
import Avatar from "../avatar";
import LikeButton from "../like-btn";
import { useSession } from "next-auth/react";
import ShareButton from "../share-btn";
import { MessageCircle } from "lucide-react";
import { useComments } from "../comments/provider";

function formatDateTime(isoString) {
  return isoString.split("-").join(".");
}

const Post = ({
  authorId,
  author,
  avatar,
  avatar_type,
  date,
  title,
  content,
  id,
  liked,
  likes,
}) => {
  const { data: session } = useSession();
  const { setPostId, setIsOpen } = useComments();

  return (
    <>
      <small className={s.poemInfo}>
        {author && session ? (
          <Link href={`/profile/${authorId}`} className={s.poemAuthor}>
            <Avatar avatar={avatar} type={avatar_type} />
            <p>{author}</p>
          </Link>
        ) : null}

        <p className={s.poemDate}>{formatDateTime(date)}</p>
      </small>

      <h2 className={s.poemTitle}>{title}</h2>
      <p className={s.poemText + " whitespace-pre-wrap"}>{content}</p>
      {session && (
        <div className="flex gap-[.8rem]">
          <LikeButton
            poemId={id}
            initialLiked={liked}
            initialCount={Number(likes)}
          />
          <button>
            <MessageCircle onClick={() => {
              setPostId(id)
              setIsOpen(true)
              }} size={18} />
          </button>

          <ShareButton link={`/poems/${id}`} />
        </div>
      )}
    </>
  );
};

export default Post;
