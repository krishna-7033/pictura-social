import React, { useState, useEffect } from "react";
import GridMotion from "../components/GridMotion";
import { motion } from "framer-motion";
import PostCard from "../components/PostCard";
import { useAuth } from "../context/AuthContext";
import { postsApi } from "../utils/api";

const Home = () => {
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const fetchedPosts = await postsApi.getAll();
        setPosts(fetchedPosts);
      } catch (error) {
        console.error("Failed to load posts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const handleLike = async (postId) => {
    try {
      const result = await postsApi.like(postId);
      const updatedPosts = posts.map((post) => {
        if (post._id === postId) {
          return { ...post, likes: result.likes };
        }
        return post;
      });
      setPosts(updatedPosts);
    } catch (error) {
      console.error("Failed to like post:", error);
    }
  };

  const handleEdit = (post, newCaption) => {
    (async () => {
      try {
        const updated = await postsApi.update(post._id || post.id, {
          caption: newCaption,
        });
        setPosts((prev) =>
          prev.map((p) =>
            p._id === (updated._id || updated.id)
              ? { ...p, caption: updated.caption }
              : p,
          ),
        );
      } catch (err) {
        console.error("Failed to edit post:", err);
      }
    })();
  };

  const handleDelete = (postId) => {
    (async () => {
      try {
        await postsApi.delete(postId);
        setPosts((prev) =>
          prev.filter((p) => p._id !== postId && p.id !== postId),
        );
      } catch (err) {
        console.error("Failed to delete post:", err);
      }
    })();
  };

  const handleComment = async (postId, text) => {
    try {
      const result = await postsApi.comment(postId, text);
      const updatedPosts = posts.map((post) => {
        if (post._id === postId) {
          return { ...post, comments: result.comments };
        }
        return post;
      });
      setPosts(updatedPosts);
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full pt-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ig-text"></div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-0">
        <GridMotion items={[]} gradientColor="rgba(10,10,10,0.9)" />
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="relative z-10 max-w-xl mx-auto pt-8 pb-20 px-0 sm:px-4"
      >
        {posts.length > 0 ? (
          posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onLike={handleLike}
              onComment={handleComment}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <div className="text-center text-ig-text-secondary mt-20">
            <h2 className="text-xl mb-2 text-ig-text">No posts yet</h2>
            <p>Follow some people or create your first post!</p>
          </div>
        )}
      </motion.div>
    </>
  );
};

export default Home;
