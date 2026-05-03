import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import GradientBlinds from "../components/GradientBlinds";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
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
        {/* Login Box */}
        <div className="bg-white p-8 border border-ig-border rounded-sm flex flex-col items-center shadow-lg backdrop-blur-md bg-opacity-80">
          <h1
            className="text-4xl font-bold italic mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500"
            style={{ fontFamily: "'Grand Hotel', cursive" }}
          >
            Pictura
          </h1>

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
              disabled={!email || password.length < 6}
            >
              Log in
            </button>
            {error && (
              <p className="text-red-500 text-center text-sm mt-2">{error}</p>
            )}
          </form>

          <div className="flex w-full items-center my-4">
            <div className="flex-1 h-px bg-ig-border"></div>
          </div>
          <a href="#" className="text-xs text-ig-primary mt-4 font-semibold">
            Forgot password?
          </a>
        </div>

        {/* Signup Box */}
        <div className="bg-white p-6 border border-ig-border rounded-sm text-center">
          <p className="text-sm">
            Don't have an account?{" "}
            <Link to="/signup" className="text-ig-primary font-bold ml-1">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default Login;
