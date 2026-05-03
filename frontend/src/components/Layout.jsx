import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import GridMotion from "./GridMotion";

const Layout = () => {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-ig-bg text-ig-text">
      <div className="fixed inset-0 pointer-events-none z-0">
        <GridMotion items={[]} gradientColor="rgba(10,10,10,0.9)" />
      </div>
      {/* Sidebar for desktop, Bottom nav for mobile */}
      <div className="md:w-64 flex-shrink-0 md:h-screen md:sticky md:top-0 md:border-r border-ig-border z-50">
        <Navbar />
      </div>

      {/* Main Content Area */}
      <main className="relative z-10 flex-grow pb-16 md:pb-0 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
