import { Sidebar } from "@/components/Sidebar";
import { TopNav } from "@/components/TopNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex bg-(--background) min-h-screen">
      <Sidebar />
      <div className="flex-col flex-1 w-full md:pl-64">
        <TopNav />
        <main className="p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
