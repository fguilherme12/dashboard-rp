import { PageTopBar } from "@/components/layout/page-top-bar";
import { Sidebar } from "@/components/layout/sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:pl-64">
        <div className="mx-auto max-w-7xl px-4 py-6 pt-16 lg:px-8 lg:pt-8">
          <PageTopBar />
          {children}
        </div>
      </main>
    </div>
  );
}
