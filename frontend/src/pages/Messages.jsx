import React from "react";
import { MessageCircle } from "lucide-react";

const Messages = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <MessageCircle size={64} className="text-gray-300 mb-4" />
      <h2 className="text-2xl font-semibold text-gray-700 mb-2">Messages</h2>
      <p className="text-gray-500">Your direct messages will appear here</p>
    </div>
  );
};

export default Messages;
