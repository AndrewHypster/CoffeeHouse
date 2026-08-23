"use client";

import Loader from "@/components/loader";
import Post from "@/components/post";
import { PageNotFoundError } from "next/dist/shared/lib/utils";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";

const PostPage = ({ params }) => {
  const [post, setPost] = useState("loading");
  useEffect(() => {
    const getPost = async () => {
      const { id } = await params;
      console.log("post id", id);
      try {
        const res = await fetch(`/api/db/poems?post-id=${id}`);
        const data = await res.json();

        setPost(data.post);
      } catch (err) {
        setPost(false);
        console.log(err);
      }
    };

    getPost();
  }, []);

  if (post == "loading") <Loader />;
  if (!post) {
    notFound();
  }

  if (post && post != "loading")
    return (
      <div className='w-fit m-auto pt-[3rem]'>
        <Post
        author={post.author}
        authorId={post.authorId}
        avatar={post.avatar}
        avatar_type={post.avatar_type}
        content={post.content}
        date={post.createdAt}
        id={post.id}
        liked={post.liked}
        likes={Number(post.likesCount)}
        title={post.title}
      />
      </div>
      
    );
};

export default PostPage;
