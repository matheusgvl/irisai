"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Activity, Settings, Mic } from "lucide-react";
import clsx from "clsx";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Nova Sessão", href: "/dashboard/record", icon: Mic },
  { name: "Pacientes", href: "/dashboard/patients", icon: Users },
  { name: "Métricas", href: "/dashboard/analytics", icon: Activity },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-(--border) bg-(--card) hidden md:flex flex-col h-screen fixed left-0 top-0">
      <div className="h-16 flex items-center px-6 border-b border-(--border)">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-bold shadow-lg">
            I
          </div>
          <span className="font-bold text-lg tracking-tight">Iris Scribe</span>
        </div>
      </div>
      
      <div className="p-4 flex-1">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2">Menu</div>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href}
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
        </nav>
      </div>

      <div className="p-4 border-t border-(--border)">
        <Link 
          href="/dashboard/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
        >
          <Settings className="w-4 h-4" />
          Configurações
        </Link>
      </div>
    </aside>
  );
}
