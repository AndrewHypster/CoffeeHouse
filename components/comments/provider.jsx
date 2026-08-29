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
  const [comments, setComments] = useState(initialComments);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    console.log('comments is ', isOpen)
  }, [isOpen])

  const toggleComments = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <CommentsContext.Provider
      value={{
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