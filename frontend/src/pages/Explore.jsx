import React from 'react';
import { motion } from 'framer-motion';

const Explore = () => {
  // Generate random image heights for masonry effect
  const heights = ['h-48', 'h-64', 'h-80', 'h-40', 'h-72', 'h-56', 'h-64', 'h-48', 'h-80'];
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-5xl mx-auto pt-8 pb-20 px-4"
    >
      <h2 className="text-2xl font-bold mb-6 text-gray-800 px-2">Discover</h2>
      
      <div className="columns-2 md:columns-3 gap-4 space-y-4">
        {heights.map((height, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`w-full ${height} rounded-2xl overflow-hidden relative group cursor-pointer`}
          >
            <img 
              src={`https://source.unsplash.com/random/800x800?aesthetic,photography&sig=${i}`} 
              alt="Explore" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-purple-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default Explore;
