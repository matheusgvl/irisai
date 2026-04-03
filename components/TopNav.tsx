"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { mockUser } from "@/lib/data";
import { Bell, Search, Menu, X, LayoutDashboard, Users, Activity, Settings, Mic } from "lucide-react";
import clsx from "clsx";
import { ThemeToggle } from "./ThemeToggle";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Nova Sessão", href: "/dashboard/record", icon: Mic },
  { name: "Pacientes", href: "/dashboard/patients", icon: Users },
  { name: "Métricas", href: "/dashboard/analytics", icon: Activity },
];

export function TopNav() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
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
    <header className="h-16 flex items-center justify-between px-4 md:px-8 bg-(--card)/80 backdrop-blur-md border-b border-(--border) sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button 
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 -ml-2 rounded-md block md:hidden text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-lg md:text-xl font-bold tracking-tight">{getPageTitle()}</h1>
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

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex block md:hidden">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <nav className="relative flex w-full max-w-xs flex-col bg-(--card) shadow-2xl animate-in slide-in-from-left duration-300">
            <div className="h-16 flex items-center justify-between px-6 border-b border-(--border)">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-linear-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-bold shadow-lg">
                  I
                </div>
                <span className="font-bold text-lg tracking-tight">Iris Scribe</span>
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 -mr-2 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-4 flex-1 overflow-y-auto">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2">Menu</div>
              <div className="flex flex-col gap-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link 
                      key={item.name} 
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={clsx(
                        "flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 text-sm font-medium",
                        isActive 
                          ? "bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400" 
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-gray-200"
                      )}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="p-4 border-t border-(--border)">
              <Link 
                href="/dashboard/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
              >
                <Settings className="w-4 h-4" />
                Configurações
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
