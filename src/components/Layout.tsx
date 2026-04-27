import { Construction, Home, LayoutDashboard, Info } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { Outlet } from "react-router-dom";

export const Layout = () => {
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="gradient-asphalt text-secondary-foreground sticky top-0 z-40">
        <div className="hazard-stripes h-2" />
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <NavLink to="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary shadow-warm">
              <Construction className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <h1 className="text-base font-extrabold leading-tight">Lapor Jalan Rusak AI</h1>
              <p className="text-[10px] text-secondary-foreground/70">Analisis kerusakan dengan AI</p>
            </div>
          </NavLink>

          {/* Desktop nav */}
          <nav className="hidden gap-1 sm:flex">
            <DesktopLink to="/" label="Beranda" icon={Home} />
            <DesktopLink to="/dashboard" label="Dashboard" icon={LayoutDashboard} />
            <DesktopLink to="/about" label="About" icon={Info} />
          </nav>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card shadow-card sm:hidden">
        <div className="mx-auto flex max-w-3xl items-stretch justify-around">
          <MobileLink to="/" label="Beranda" icon={Home} />
          <MobileLink to="/dashboard" label="Dashboard" icon={LayoutDashboard} />
          <MobileLink to="/about" label="About" icon={Info} />
        </div>
      </nav>
    </div>
  );
};

const DesktopLink = ({
  to,
  label,
  icon: Icon,
}: {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}) => (
  <NavLink
    to={to}
    end={to === "/"}
    className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-secondary-foreground/70 transition hover:bg-white/10 hover:text-secondary-foreground"
    activeClassName="!bg-primary !text-secondary"
  >
    <Icon className="h-4 w-4" />
    {label}
  </NavLink>
);

const MobileLink = ({
  to,
  label,
  icon: Icon,
}: {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}) => (
  <NavLink
    to={to}
    end={to === "/"}
    className="flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-semibold text-muted-foreground transition"
    activeClassName="!text-secondary"
  >
    {({ isActive }: { isActive: boolean }) => null}
    <Icon className="h-5 w-5" />
    <span>{label}</span>
  </NavLink>
);
