'use client'

import s from "./comment.module.css";
import sPc from "./comments-pc.module.css";
import sMob from "./comments-mobile.module.css";
import Avatar from "../avatar";
import Link from "next/link";
import { CommentsProvider, useComments } from "./provider";

const Comment = () => {
  return (
    <div className={s.comment}>
      <div className={s.info}>
        <Link className={s.author} href="/profile/0">
          <Avatar avatar={"?"} type={"smile"} />
          <b>Анонім</b>
        </Link>
        <small>2026.08.26</small>
      </div>

      <p className={s.text}>
        Lorem, ipsum dolor sit amet consectetur adipisicing elit. Nesciunt quis voluptas doloribus unde, aliquid officiis deleniti magni natus vero amet.
      </p>
    </div>
  );
};

const ForPC = () => {
  return (
    <div className={sPc.forPC}>
      <h2>For PC</h2>
    </div>
  );
};

const ForMobile = () => {
  const { isOpen } = useComments()

  return (
    <div className={`${sMob.forMobile} ${isOpen}`}>
      <div className={sMob.content}>
        <h3 className={sMob.title}>
          Коментарі <hr />
        </h3>
        <ul className={sMob.comments}>
          <li>
            <Comment />
          </li>
          <li>
            <Comment />
          </li>
          <li>
            <Comment />
          </li>
          <li>
            <Comment />
          </li>
          <li>
            <Comment />
          </li>
          <li>
            <Comment />
          </li>
        </ul>
      </div>
    </div>
  );
};

const CommentBox = () => {
  const comments = []

  return (
    <CommentsProvider initialComments={comments}>
      <ForPC  />
      <ForMobile />
    </CommentsProvider>
  );
};

export default CommentBox;
