"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const CommentsContext = createContext(null);

export const CommentsProvider = ({
  children,
  initialComments,
}) => {
  const [comments, setComments] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [postId, setPostId] = useState(null);

  const toggleComments = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <CommentsContext.Provider
      value={{
        postId,
        setPostId,
        comments,
        setComments,
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