'use client';

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";


const Navbar = () => {
  const { user } = useAuth();

  return (
    <header className=" top-0 w-full z-50 flex justify-between items-center px-4 md:px-8 py-4 md:py-6 pointer-events-none">
      <div className="flex items-center pointer-events-auto">
        <button className="w-10 h-10 flex items-center justify-center hover:scale-105 transition-transform cursor-pointer">
          <span className="material-symbols-outlined text-xl">menu</span>
        </button>
      </div>
      
      <div className="absolute left-1/2 -translate-x-1/2 pointer-events-auto">
        <Link href="/">
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-black italic">VELOUR</h1>
        </Link>
      </div>
      
      <div className="flex items-center gap-2 pointer-events-auto">
        <button className="hidden md:flex w-10 h-10 items-center justify-center hover:scale-105 transition-transform cursor-pointer">
          <span className="material-symbols-outlined text-xl">search</span>
        </button>
        <button className="w-10 h-10 flex items-center justify-center hover:scale-105 transition-transform cursor-pointer">
          <span className="material-symbols-outlined text-xl">shopping_bag</span>
        </button>
        {user ? (
          <Link href={user.role === "admin" ? "/admin" : "/user-dashboard"} className="hidden md:flex w-10 h-10 items-center justify-center bg-black text-white rounded-full shadow-sm hover:scale-105 transition-transform cursor-pointer">
            <span className="text-[10px] font-bold font-mono">{user.email?.charAt(0).toUpperCase()}</span>
          </Link>
        ) : (
          <Link href="/login" className="hidden md:flex w-10 h-10 items-center justify-center hover:scale-105 transition-transform cursor-pointer">
            <span className="material-symbols-outlined text-xl">person</span>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Navbar;