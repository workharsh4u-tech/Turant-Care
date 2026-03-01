import { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/lib/auth";
import { FileText, LogOut, Home } from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  nav?: { label: string; icon: ReactNode; active?: boolean; onClick?: () => void }[];
}

export default function DashboardLayout({ children, title, subtitle, nav }: DashboardLayoutProps) {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <FileText className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display font-bold hidden sm:inline">TurantCare</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:inline">{profile?.full_name || profile?.email}</span>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Nav tabs */}
      {nav && nav.length > 0 && (
        <div className="border-b border-border bg-card">
          <div className="container mx-auto px-4 sm:px-6 flex gap-1 overflow-x-auto py-1">
            {nav.map((item, i) => (
              <Button
                key={i}
                variant={item.active ? "default" : "ghost"}
                size="sm"
                onClick={item.onClick}
                className="flex-shrink-0"
              >
                {item.icon}
                <span className="ml-1.5">{item.label}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <main className="container mx-auto px-4 sm:px-6 py-6">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-display font-bold">{title}</h1>
          {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        {children}
      </main>
    </div>
  );
}
