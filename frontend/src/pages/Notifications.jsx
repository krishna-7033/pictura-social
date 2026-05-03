import React, { useEffect, useState } from "react";
import { Bell, Check, Heart } from "lucide-react";
import { notificationsApi } from "../utils/api";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const items = await notificationsApi.getAll();
        setNotifications(items || []);
      } catch (err) {
        console.error("Failed to load notifications", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const markRead = async (id) => {
    try {
      await notificationsApi.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n)),
      );
    } catch (err) {
      console.error("Failed to mark read", err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full pt-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ig-text"></div>
      </div>
    );
  }

  if (!notifications.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <Bell size={64} className="text-gray-300 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">
          Notifications
        </h2>
        <p className="text-gray-500">
          Your activity and notifications will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Notifications</h2>
      <ul className="space-y-3">
        {notifications.map((n) => (
          <li
            key={n._id}
            className={`p-3 rounded border ${n.read ? "bg-gray-50" : "bg-white"}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={n.actor?.avatar}
                  alt={n.actor?.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <div className="text-sm font-medium">
                    {n.actor?.username || "Someone"}{" "}
                    {n.type === "like"
                      ? "liked your post"
                      : n.type === "comment"
                        ? "commented on your post"
                        : "started following you"}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {n.post?.imageUrl && (
                  <img
                    src={n.post.imageUrl}
                    alt="post"
                    className="w-12 h-12 object-cover rounded"
                  />
                )}
                {!n.read && (
                  <button
                    onClick={() => markRead(n._id)}
                    className="p-2 bg-ig-primary text-white rounded flex items-center gap-1 text-sm"
                  >
                    <Check size={14} /> Mark read
                  </button>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Notifications;
