"use client";

import { usePathname } from "next/navigation";
import { mockUser } from "@/lib/data";
import { Bell, Search } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function TopNav() {
  const pathname = usePathname();
  
  // Format the title based on the path
  const getPageTitle = () => {
    if (pathname === "/dashboard") return "Dashboard";
    if (pathname.includes("/dashboard/record")) return "Nova Sessão";
    if (pathname.includes("/dashboard/session")) return "Detalhes da Sessão";
    if (pathname.includes("/dashboard/patients")) return "Pacientes";
    if (pathname.includes("/dashboard/settings")) return "Configurações";
    return "Iris Scribe";
  };

  return (
    <header className="h-16 flex items-center justify-between px-8 bg-(--card)/80 backdrop-blur-md border-b border-(--border) sticky top-0 z-10">
      <div>
        <h1 className="text-xl font-bold tracking-tight">{getPageTitle()}</h1>
      </div>
      
      <div className="flex items-center gap-6">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Buscar..." 
            className="pl-9 pr-4 py-2 w-64 rounded-full bg-gray-100 dark:bg-white/5 border border-transparent focus:border-teal-500 focus:bg-white dark:focus:bg-black transition-all text-sm outline-none"
          />
        </div>

        {/* Actions & Profile */}
        <div className="flex items-center gap-4">
          <ThemeToggle />
          
          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 relative transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#18181b]"></span>
          </button>
          
          <div className="h-8 w-px bg-gray-200 dark:bg-white/10 mx-1"></div>
          
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium leading-none">{mockUser.name}</p>
              <p className="text-xs text-gray-500 mt-1">{mockUser.role}</p>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={mockUser.avatarUrl} 
              alt={mockUser.name} 
              className="w-10 h-10 rounded-full border-2 border-white dark:border-[#27272a] shadow-sm"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
