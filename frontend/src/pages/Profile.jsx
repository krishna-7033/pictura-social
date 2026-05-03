import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { usersApi, postsApi } from "../utils/api";
import {
  Settings,
  Grid,
  Bookmark,
  UserSquare,
  Heart,
  MessageCircle,
} from "lucide-react";

const Profile = () => {
  const { username } = useParams();
  const { currentUser } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // If no username provided, use current user
  const displayUsername = username || currentUser.username;
  const isOwnProfile = currentUser.username === displayUsername;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await usersApi.getProfile(displayUsername);
        if (profile) {
          setProfileUser(profile);
          setUserPosts(profile.posts || []);
        }
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        setLoading(false);
      }
    };
    fetchProfile();
  }, [displayUsername]);

  const handleEditPost = (post) => {
    (async () => {
      try {
        const updated = await postsApi.update(post._id || post.id, {
          caption: post.caption,
        });
        setUserPosts((prev) =>
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

  const handleDeletePost = (postId) => {
    (async () => {
      try {
        await postsApi.delete(postId);
        setUserPosts((prev) =>
          prev.filter((p) => p._id !== postId && p.id !== postId),
        );
      } catch (err) {
        console.error("Failed to delete post:", err);
      }
    })();
  };

  const handleFollow = async () => {
    try {
      const result = await usersApi.follow(profileUser._id);
      setProfileUser((prev) => ({
        ...prev,
        followers: result.followers,
      }));
    } catch (error) {
      console.error("Failed to follow user:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center pt-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ig-text"></div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="text-center pt-20 text-ig-text font-semibold text-xl">
        User not found
      </div>
    );
  }

  const isFollowing =
    profileUser.followers?.some((f) => f === currentUser.id) || false;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-[935px] mx-auto pt-8 pb-20 px-4 sm:px-8"
    >
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row mb-10 pb-10 border-b border-ig-border">
        {/* Avatar */}
        <div className="flex-shrink-0 sm:mr-16 mb-6 sm:mb-0 flex justify-center sm:w-72">
          <img
            src={profileUser.avatar}
            alt={profileUser.username}
            className="w-24 h-24 sm:w-36 sm:h-36 rounded-full border border-ig-border object-cover p-1"
          />
        </div>

        {/* Info */}
        <div className="flex-grow flex flex-col items-center sm:items-start text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
            <h2 className="text-xl font-normal text-white drop-shadow-md">
              {profileUser.username}
            </h2>
            {isOwnProfile ? (
              <div className="flex gap-2">
                <button className="bg-gray-100 hover:bg-gray-200 text-ig-text font-semibold px-4 py-1.5 rounded-lg text-sm transition-colors">
                  Edit profile
                </button>
                <button className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
                  <Settings size={24} />
                </button>
              </div>
            ) : (
              <button
                onClick={handleFollow}
                className={`${isFollowing ? "bg-gray-100 text-ig-text" : "bg-ig-primary text-white"} hover:opacity-80 font-semibold px-6 py-1.5 rounded-lg text-sm transition-colors`}
              >
                {isFollowing ? "Following" : "Follow"}
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="flex gap-8 mb-4">
            <span className="text-base text-white drop-shadow-md">
              <span className="font-semibold">{userPosts.length}</span> posts
            </span>
            <span className="text-base text-white drop-shadow-md">
              <span className="font-semibold">
                {profileUser.followers?.length || 0}
              </span>{" "}
              followers
            </span>
            <span className="text-base text-white drop-shadow-md">
              <span className="font-semibold">
                {profileUser.following?.length || 0}
              </span>{" "}
              following
            </span>
          </div>

          {/* Bio */}
          <div>
            <p className="text-sm mt-1 whitespace-pre-wrap text-white drop-shadow-md">
              {profileUser.bio}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-12 border-t -mt-[41px] border-transparent mb-4">
        <button className="flex items-center gap-2 border-t border-white/30 pt-4 text-xs font-semibold tracking-widest text-white drop-shadow-md">
          <Grid size={12} /> POSTS
        </button>
        <button className="flex items-center gap-2 pt-4 text-xs font-semibold tracking-widest text-white drop-shadow-md opacity-90 hover:opacity-100 transition-opacity">
          <Bookmark size={12} /> SAVED
        </button>
        <button className="flex items-center gap-2 pt-4 text-xs font-semibold tracking-widest text-white drop-shadow-md opacity-90 hover:opacity-100 transition-opacity">
          <UserSquare size={12} /> TAGGED
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-1 sm:gap-6">
        {userPosts.map((post) => (
          <div
            key={post._id || post.id}
            className="aspect-square relative group cursor-pointer bg-black"
          >
            <img
              src={post.imageUrl}
              alt="Post thumbnail"
              className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
            />
            {/* Overlay stats on hover */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-6 text-white font-bold">
              <div className="flex items-center gap-2">
                <Heart className="fill-white" size={20} />
                <span>{post.likes.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="fill-white" size={20} />
                <span>{post.comments.length}</span>
              </div>
              {isOwnProfile && (
                <div className="absolute top-2 right-2 flex gap-2">
                  <button
                    onClick={() => handleEditPost(post)}
                    className="bg-white/20 hover:bg-white/30 px-2 py-1 rounded text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeletePost(post._id || post.id)}
                    className="bg-white/20 hover:bg-white/30 px-2 py-1 rounded text-xs text-red-500"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {userPosts.length === 0 && (
          <div className="col-span-3 text-center py-10 text-ig-text-secondary">
            No posts yet
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Profile;
