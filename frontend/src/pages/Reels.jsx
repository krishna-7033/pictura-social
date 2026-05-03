import React from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Send, MoreVertical } from 'lucide-react';

const Reels = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-[calc(100vh-120px)] w-full max-w-sm mx-auto bg-black rounded-3xl overflow-hidden relative shadow-2xl mt-4"
    >
      {/* Mock Video Background */}
      <img 
        src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop" 
        alt="Reel" 
        className="w-full h-full object-cover opacity-80"
      />

      {/* Overlay Content */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 flex flex-col justify-end p-4">
        
        <div className="flex justify-between items-end">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=creator" alt="Creator" className="w-10 h-10 rounded-full border-2 border-white" />
              <span className="font-bold text-white shadow-sm">@creative_vibe</span>
              <button className="border border-white text-white px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">Follow</button>
            </div>
            <p className="text-white text-sm mb-2 drop-shadow-md">Lost in the aesthetic ✨ #vibes #art #design</p>
            <div className="flex items-center gap-2 bg-white/20 w-fit px-3 py-1 rounded-full backdrop-blur-md">
              <span className="text-white text-xs">🎵 Original Audio</span>
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex flex-col items-center gap-6 pb-4 pl-4">
            <button className="flex flex-col items-center gap-1 group">
              <Heart size={32} className="text-white transition-transform group-hover:scale-110" />
              <span className="text-white text-xs font-semibold">12.4K</span>
            </button>
            <button className="flex flex-col items-center gap-1 group">
              <MessageCircle size={32} className="text-white transition-transform group-hover:scale-110" />
              <span className="text-white text-xs font-semibold">342</span>
            </button>
            <button className="flex flex-col items-center gap-1 group">
              <Send size={32} className="text-white transition-transform group-hover:scale-110" />
            </button>
            <button className="flex flex-col items-center gap-1 group">
              <MoreVertical size={28} className="text-white transition-transform group-hover:scale-110" />
            </button>
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=audio" alt="Audio" className="w-8 h-8 rounded-md border-2 border-white animate-spin-slow mt-2" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Reels;
