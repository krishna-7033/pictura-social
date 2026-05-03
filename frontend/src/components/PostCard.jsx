import React, { useState, useEffect, useRef } from "react";
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { postsApi } from "../utils/api";

const PostCard = ({ post, onLike, onComment, onEdit, onDelete }) => {
  const { currentUser } = useAuth();
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [showAllComments, setShowAllComments] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(post.caption || "");
  const menuRef = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const isLiked = post.likes.includes(currentUser.id);

  // Handle both new MongoDB structure and old localStorage structure
  const postAuthor = post.user || { username: "unknown", avatar: "" };
  const authorId = post.user?._id || post.userId;
  const authorUsername =
    typeof postAuthor === "string" ? postAuthor : postAuthor.username;

  const handleDoubleClick = () => {
    if (!isLiked) {
      onLike(post._id || post.id);
    }
    setShowHeartAnimation(true);
    setTimeout(() => setShowHeartAnimation(false), 1000);
  };

  const handleLikeClick = () => {
    onLike(post._id || post.id);
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (commentText.trim()) {
      onComment(post._id || post.id, commentText);
      setCommentText("");
    }
  };

  if (!postAuthor || (typeof postAuthor === "object" && !postAuthor.username))
    return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-effect rounded-3xl mb-8 overflow-hidden transition-all hover:shadow-xl max-w-[470px] w-full mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white/20">
        <Link
          to={`/profile/${authorUsername}`}
          className="flex items-center gap-3"
        >
          <img
            src={postAuthor.avatar}
            alt={authorUsername}
            className="w-10 h-10 rounded-full border-2 border-purple-200 object-cover shadow-sm"
          />
          <span className="font-bold text-sm text-gray-800 hover:text-purple-600 transition-colors">
            {authorUsername}
          </span>
        </Link>
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="text-gray-500 hover:text-purple-600 transition-colors"
            aria-haspopup="true"
            aria-expanded={menuOpen}
          >
            <MoreHorizontal size={24} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg p-2 text-sm z-40">
              {currentUser.id === (post.user?._id || post.userId) ? (
                <>
                  <button
                    onClick={() => {
                      setEditing(true);
                      setMenuOpen(false);
                      setEditValue(post.caption || "");
                    }}
                    className="w-full text-left px-2 py-1 hover:bg-gray-100 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete && onDelete(post._id || post.id);
                    }}
                    className="w-full text-left px-2 py-1 hover:bg-gray-100 rounded text-red-600"
                  >
                    Delete
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    alert("Reported");
                  }}
                  className="w-full text-left px-2 py-1 hover:bg-gray-100 rounded text-ig-text"
                >
                  Report
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Image with Double Click Like */}
      <div
        className="relative aspect-square sm:aspect-auto sm:max-h-[600px] w-full bg-gray-100 overflow-hidden flex items-center justify-center cursor-pointer group"
        onDoubleClick={handleDoubleClick}
      >
        <img
          src={post.imageUrl}
          alt="Post content"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
        />

        {/* Heart Animation Overlay */}
        <AnimatePresence>
          {showHeartAnimation && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.9 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
            >
              <Heart
                size={120}
                className="text-white fill-white drop-shadow-2xl"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div className="p-4 bg-white/20">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-5">
            <button
              onClick={handleLikeClick}
              className="transition-transform hover:scale-110 active:scale-90"
            >
              <Heart
                size={28}
                className={`${isLiked ? "text-red-500 fill-red-500 drop-shadow-sm" : "text-gray-700"}`}
              />
            </button>
            <button className="transition-transform hover:scale-110 active:scale-90">
              <MessageCircle
                size={28}
                className="text-gray-700 hover:text-purple-500 transition-colors"
              />
            </button>
            <button className="transition-transform hover:scale-110 active:scale-90">
              <Send
                size={28}
                className="text-gray-700 hover:text-purple-500 transition-colors"
              />
            </button>
          </div>
          <button className="transition-transform hover:scale-110 active:scale-90">
            <Bookmark
              size={28}
              className="text-gray-700 hover:text-purple-500 transition-colors"
            />
          </button>
        </div>

        {/* Likes Count */}
        <p className="font-bold text-sm mb-2 text-gray-800">
          {post.likes.length} likes
        </p>

        {/* Caption */}
        <p className="text-sm text-gray-800 mb-1">
          <Link
            to={`/profile/${authorUsername}`}
            className="font-bold mr-2 hover:text-purple-600 transition-colors"
          >
            {authorUsername}
          </Link>
          {post.caption}
        </p>

        {/* Comments Section */}
        {post.comments && post.comments.length > 0 && (
          <div className="mt-2 text-sm">
            {!showAllComments && post.comments.length > 2 ? (
              <button
                onClick={() => setShowAllComments(true)}
                className="text-gray-500 hover:text-gray-700 transition-colors mb-1 font-medium"
              >
                View all {post.comments.length} comments
              </button>
            ) : null}

            {(showAllComments ? post.comments : post.comments.slice(-2)).map(
              (comment, idx) => {
                // Handle both new structure (comment.user) and old structure (comment.userId)
                const commentAuthor = comment.user || { username: "user" };
                const commentAuthorUsername =
                  typeof commentAuthor === "string"
                    ? commentAuthor
                    : commentAuthor.username;
                return (
                  <div key={comment._id || idx} className="mb-1 text-gray-800">
                    <Link
                      to={`/profile/${commentAuthorUsername}`}
                      className="font-bold mr-2 hover:text-purple-600 transition-colors"
                    >
                      {commentAuthorUsername}
                    </Link>
                    <span>{comment.text}</span>
                  </div>
                );
              },
            )}
          </div>
        )}

        {/* Time */}
        <p className="text-[10px] text-gray-400 uppercase mt-3 mb-4 tracking-wider font-semibold">
          {new Date(post.createdAt).toLocaleDateString()}
        </p>
      </div>

      {/* Add Comment */}
      <div className="border-t border-white/30 p-4 flex items-center bg-white/10">
        <form className="w-full flex" onSubmit={handleCommentSubmit}>
          <input
            type="text"
            placeholder="Add a comment..."
            className="flex-grow text-sm outline-none placeholder-gray-500 bg-transparent text-gray-800"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <button
            type="submit"
            disabled={!commentText.trim()}
            className="text-purple-600 font-bold text-sm ml-3 disabled:opacity-50 hover:text-purple-800 transition-colors"
          >
            Post
          </button>
        </form>
      </div>
      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setEditing(false)}
          />
          <div className="bg-white rounded-lg p-6 z-60 w-[90%] max-w-md">
            <h3 className="font-semibold mb-3">Edit post</h3>
            <textarea
              className="w-full border p-2 rounded mb-3 h-28"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditing(false)}
                className="px-3 py-1 rounded bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onEdit && onEdit(post, editValue);
                  setEditing(false);
                }}
                className="px-3 py-1 rounded bg-purple-600 text-white"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default PostCard;
