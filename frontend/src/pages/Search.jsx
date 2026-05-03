import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search as SearchIcon } from "lucide-react";

const Search = () => {
  const [query, setQuery] = useState("");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto pt-8 pb-20 px-4 relative z-10"
    >
      <div className="relative mb-8">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon className="text-white/80" size={20} />
        </div>
        <input
          type="text"
          className="w-full bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/60 rounded-2xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-sm transition-all"
          placeholder="Search creators, tags, and photos..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <h2 className="text-xl font-bold mb-4 text-white drop-shadow-md">
        Trending Topics
      </h2>
      <div className="grid grid-cols-2 gap-4">
        {[
          "#creative",
          "#aesthetic",
          "#design",
          "#travel",
          "#photography",
          "#lifestyle",
        ].map((tag, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.05 }}
            className="p-6 rounded-2xl cursor-pointer flex items-center justify-center border border-white/20 bg-white/5 transition-colors"
          >
            <span className="font-bold text-white">{tag}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default Search;
