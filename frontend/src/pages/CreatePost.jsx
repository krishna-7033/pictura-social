import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { postsApi } from "../utils/api";
import { Image as ImageIcon, ArrowLeft } from "lucide-react";

const CreatePost = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [selectedImage, setSelectedImage] = useState(null);
  const [caption, setCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleShare = async () => {
    if (!selectedImage) return;

    setIsUploading(true);

    try {
      await postsApi.create(selectedImage, caption);
      setIsUploading(false);
      navigate("/");
    } catch (error) {
      console.error("Failed to create post:", error);
      setIsUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-3xl mx-auto pt-8 pb-20 px-4 flex justify-center items-center h-full min-h-[80vh]"
    >
      <div className="w-full bg-white border border-ig-border rounded-xl overflow-hidden shadow-sm flex flex-col md:flex-row aspect-auto md:aspect-[4/3] max-h-[800px]">
        {/* Header (Mobile only) */}
        <div className="md:hidden flex justify-between items-center p-3 border-b border-ig-border">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft size={24} />
          </button>
          <h2 className="font-semibold text-base">New post</h2>
          <button
            onClick={handleShare}
            disabled={!selectedImage || isUploading}
            className="text-ig-primary font-semibold disabled:opacity-50"
          >
            Share
          </button>
        </div>

        {/* Image Selection / Preview Area */}
        <div
          className={`w-full ${selectedImage ? "md:w-3/5" : "md:w-full"} flex items-center justify-center bg-gray-100 relative`}
        >
          {!selectedImage ? (
            <div className="flex flex-col items-center p-8 text-center">
              <ImageIcon size={64} className="text-gray-400 mb-4" />
              <h2 className="text-xl mb-4 font-normal">
                Drag photos and videos here
              </h2>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/png, image/jpeg, image/jpg"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current.click()}
                className="bg-ig-primary hover:bg-ig-primary-hover text-white font-semibold py-1.5 px-4 rounded-lg text-sm transition-colors"
              >
                Select from computer
              </button>
            </div>
          ) : (
            <img
              src={selectedImage}
              alt="Selected"
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Caption Area */}
        {selectedImage && (
          <div className="w-full md:w-2/5 flex flex-col border-t md:border-t-0 md:border-l border-ig-border bg-white">
            <div className="hidden md:flex justify-between items-center p-3 border-b border-ig-border">
              <button onClick={() => setSelectedImage(null)}>
                <ArrowLeft size={24} />
              </button>
              <h2 className="font-semibold text-base">Create new post</h2>
              <button
                onClick={handleShare}
                disabled={isUploading}
                className="text-ig-primary font-semibold hover:text-ig-primary-hover transition-colors"
              >
                {isUploading ? "Sharing..." : "Share"}
              </button>
            </div>

            <div className="flex items-center gap-3 p-4">
              <img
                src={currentUser.avatar}
                alt="Profile"
                className="w-8 h-8 rounded-full border border-ig-border object-cover"
              />
              <span className="font-semibold text-sm">
                {currentUser.username}
              </span>
            </div>

            <div className="p-4 flex-grow">
              <textarea
                placeholder="Write a caption..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full h-32 resize-none outline-none text-sm placeholder-gray-400 bg-transparent"
                maxLength={2200}
              />
              <div className="flex justify-end border-b border-ig-border pb-2">
                <span className="text-xs text-gray-300">
                  {caption.length}/2200
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default CreatePost;
