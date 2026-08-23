'use client'

import Link from "next/link";
import s from "./post.module.css";
import Avatar from "../avatar";
import LikeButton from "../like-btn";
import { useSession } from "next-auth/react";
import ShareButton from "../share-btn";

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
  const {data: session} = useSession();

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
      {session && <><LikeButton
        poemId={id}
        initialLiked={liked}
        initialCount={Number(likes)}
      />

      <ShareButton link={`/poems/${id}`} />
      
      </>}
      
    </>
  );
};

export default Post;
