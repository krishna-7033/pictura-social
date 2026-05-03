import React from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  Search,
  MessageCircle,
  Heart,
  PlusSquare,
  Menu,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { currentUser, logout } = useAuth();

  const navItems = [
    { icon: <Home size={24} />, label: "Home", path: "/" },
    { icon: <Search size={24} />, label: "Search", path: "/search" },
    // Explore and Reels removed per request
    { icon: <MessageCircle size={24} />, label: "Messages", path: "/messages" },
    {
      icon: <Heart size={24} />,
      label: "Notifications",
      path: "/notifications",
    },
    { icon: <PlusSquare size={24} />, label: "Create", path: "/create" },
    {
      icon: currentUser ? (
        <img
          src={currentUser.avatar}
          alt="Profile"
          className="w-6 h-6 rounded-full object-cover shadow-sm"
        />
      ) : (
        <Menu size={24} />
      ),
      label: "Profile",
      path: currentUser ? `/profile/${currentUser.username}` : "/profile",
    },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col h-full py-8 px-4 w-64 glass-effect fixed border-r border-white/30 z-40">
        <div className="mb-10 px-4">
          <h1
            className="text-4xl font-bold italic text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500"
            style={{ fontFamily: "'Grand Hotel', cursive" }}
          >
            Pictura
          </h1>
        </div>

        <nav className="flex-1 flex flex-col gap-2">
          {navItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-4 p-3 rounded-2xl transition-all hover:bg-white/60 hover:shadow-sm hover:scale-[1.02] ${isActive ? "font-bold text-purple-600 bg-white/50 shadow-sm" : "text-gray-700"}`
              }
            >
              <div className="transition-transform group-hover:scale-110">
                {item.icon}
              </div>
              <span className="text-base tracking-wide">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {currentUser && (
          <button
            onClick={logout}
            className="flex items-center gap-4 p-3 rounded-2xl hover:bg-red-50 text-red-500 transition-all mt-auto hover:scale-[1.02]"
          >
            <LogOut size={24} />
            <span className="text-base font-semibold">Log out</span>
          </button>
        )}
      </div>

      {/* Mobile Top & Bottom Nav */}
      <div className="md:hidden flex flex-col w-full h-full">
        {/* Top Header */}
        <header className="fixed top-0 w-full h-14 glass-effect border-b border-white/30 flex items-center justify-between px-4 z-50">
          <h1
            className="text-2xl font-bold italic text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500"
            style={{ fontFamily: "'Grand Hotel', cursive" }}
          >
            Pictura
          </h1>
          <div className="flex gap-4 items-center">
            <NavLink
              to="/notifications"
              className={({ isActive }) =>
                isActive
                  ? "text-purple-600"
                  : "text-gray-700 hover:text-purple-500"
              }
            >
              <Heart size={24} />
            </NavLink>
            <NavLink
              to="/messages"
              className={({ isActive }) =>
                isActive
                  ? "text-purple-600"
                  : "text-gray-700 hover:text-purple-500"
              }
            >
              <MessageCircle size={24} />
            </NavLink>
            <button onClick={logout} className="text-red-500">
              <LogOut size={24} />
            </button>
          </div>
        </header>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 w-full h-14 glass-effect border-t border-white/30 flex justify-around items-center z-50 pb-safe">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive
                ? "text-purple-600 scale-110 transition-transform"
                : "text-gray-500"
            }
          >
            <Home size={26} />
          </NavLink>
          <NavLink
            to="/search"
            className={({ isActive }) =>
              isActive
                ? "text-purple-600 scale-110 transition-transform"
                : "text-gray-500"
            }
          >
            <Search size={26} />
          </NavLink>
          <NavLink
            to="/create"
            className={({ isActive }) =>
              isActive
                ? "text-purple-600 scale-110 transition-transform"
                : "text-gray-500"
            }
          >
            <PlusSquare size={26} />
          </NavLink>
          <NavLink
            to={currentUser ? `/profile/${currentUser.username}` : "/profile"}
            className={({ isActive }) =>
              isActive
                ? "ring-2 ring-purple-500 rounded-full p-[2px] scale-110 transition-transform"
                : "text-gray-500"
            }
          >
            {currentUser ? (
              <img
                src={currentUser.avatar}
                alt="Profile"
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <Menu size={24} />
            )}
          </NavLink>
        </nav>
      </div>
    </>
  );
};

export default Navbar;
