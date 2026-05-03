import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import GradientBlinds from "../components/GradientBlinds";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await signup({ email, username, password });
    if (result.success) {
      navigate("/");
    } else {
      setError(result.message);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="relative min-h-screen bg-ig-bg flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="absolute inset-0 z-0">
        <GradientBlinds
          gradientColors={["#FF9FFC", "#5227FF"]}
          angle={0}
          noise={0.2}
          blindCount={12}
          blindMinWidth={40}
          spotlightRadius={0.6}
          spotlightSoftness={1}
          spotlightOpacity={1}
          mouseDampening={0.15}
          distortAmount={0}
          shineDirection="left"
          mixBlendMode="lighten"
        />
      </div>
      <div className="w-full max-w-sm space-y-4 relative z-10">
        {/* Signup Box */}
        <div className="bg-white p-8 border border-ig-border rounded-sm flex flex-col items-center shadow-lg backdrop-blur-md bg-opacity-80">
          <h1
            className="text-4xl font-bold italic mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500"
            style={{ fontFamily: "'Grand Hotel', cursive" }}
          >
            Pictura
          </h1>
          <p className="text-center text-ig-text-secondary font-semibold mb-6">
            Sign in to see photos and videos from your friends.
          </p>

          <form className="w-full flex flex-col gap-3" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email address"
              className="w-full bg-ig-bg border border-ig-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Username"
              className="w-full bg-ig-bg border border-ig-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full bg-ig-bg border border-ig-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 hover:shadow-lg active:scale-95 text-white font-semibold py-3 rounded-lg text-sm mt-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:scale-105"
              disabled={!email || !username || password.length < 6}
            >
              Sign In
            </button>
            {error && (
              <p className="text-red-500 text-center text-sm mt-2">{error}</p>
            )}
          </form>

          <p className="text-xs text-center text-gray-400 mt-6 px-4">
            By signing in, you agree to our Terms, Data Policy and Cookies
            Policy.
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-white p-6 border border-ig-border rounded-sm text-center shadow-lg backdrop-blur-md bg-opacity-80">
          <p className="text-sm">
            Have an account?{" "}
            <Link
              to="/login"
              className="text-purple-600 font-bold ml-1 hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default Signup;
