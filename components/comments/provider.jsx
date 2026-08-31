"use client";

import { createContext, useContext, useState } from "react";

const CommentsContext = createContext(null);

export const CommentsProvider = ({ children }) => {
  const [comments, setComments] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [postId, setPostId] = useState(null);

  const toggleComments = () => {
    setIsOpen((prev) => !prev);
  };

  const addComment = (comment) => {
    console.log("NEW:", comment);

setComments((prev) => {
  const next = [...prev, comment];

  console.log(
    "NEXT IDS:",
    next.map((comment) => comment.id)
  );

  return next;
});}

  return (
    <CommentsContext.Provider
      value={{
        postId,
        setPostId,

        comments,
        setComments,
        addComment,

        isOpen,
        setIsOpen,
        toggleComments,
      }}
    >
      {children}
    </CommentsContext.Provider>
  );
};

export const useComments = () => {
  const context = useContext(CommentsContext);

  if (!context) {
    throw new Error("useComments must be used inside CommentsProvider");
  }

  return context;
};
