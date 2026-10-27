import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { startLogin } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import { BarChart3, CalendarDays, ChevronDown, ClipboardCheck, Film, LayoutDashboard, LogOut, MessageSquare, PanelLeft, Settings2, Sparkles, Users, Workflow } from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";
import { Button } from "./ui/button";

const menuItems = [
  { icon: LayoutDashboard, label: "Overview", path: "/" },
  { icon: Sparkles, label: "Strategy", path: "/strategy" },
  { icon: Workflow, label: "Content pipeline", path: "/pipeline" },
  { icon: ClipboardCheck, label: "Review studio", path: "/review" },
  { icon: CalendarDays, label: "Publishing calendar", path: "/calendar" },
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
  { icon: MessageSquare, label: "Engagement", path: "/engagement" },
  { icon: Settings2, label: "Channel settings", path: "/settings" },
];

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 270;
const MIN_WIDTH = 220;
const MAX_WIDTH = 390;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { loading, user } = useAuth();

  useEffect(() => localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString()), [sidebarWidth]);

  if (loading) return <DashboardLayoutSkeleton />;

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0b0d12] text-white flex items-center justify-center px-6">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-black/20">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ff5a5f] shadow-lg shadow-[#ff5a5f]/20"><Film className="h-5 w-5" /></div>
            <div><p className="text-sm font-semibold tracking-tight">Operator Console</p><p className="text-xs text-white/45">YouTube Automation Studio</p></div>
          </div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#ff8c92]">Private workspace</p>
          <h1 className="text-3xl font-semibold tracking-tight">Run the channel with clarity.</h1>
          <p className="mt-3 text-sm leading-6 text-white/55">Sign in to manage channels, review AI production, and approve every external action.</p>
          <Button onClick={() => startLogin()} className="mt-8 h-12 w-full rounded-xl bg-[#ff5a5f] font-semibold text-white hover:bg-[#ff6e73]">Sign in to continue</Button>
          <p className="mt-4 text-center text-[11px] text-white/35">Approval-first by design. Nothing publishes without you.</p>
        </div>
      </div>
    );
  }

  return <SidebarProvider style={{ "--sidebar-width": `${sidebarWidth}px` } as CSSProperties}><DashboardLayoutContent setSidebarWidth={setSidebarWidth}>{children}</DashboardLayoutContent></SidebarProvider>;
}

type DashboardLayoutContentProps = { children: React.ReactNode; setSidebarWidth: (width: number) => void };

function DashboardLayoutContent({ children, setSidebarWidth }: DashboardLayoutContentProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const activeMenuItem = menuItems.find(item => item.path === location) ?? menuItems[0];

  useEffect(() => { if (isCollapsed) setIsResizing(false); }, [isCollapsed]);
  useEffect(() => {
    const move = (event: MouseEvent) => {
      if (!isResizing) return;
      const left = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const width = event.clientX - left;
      if (width >= MIN_WIDTH && width <= MAX_WIDTH) setSidebarWidth(width);
    };
    const up = () => setIsResizing(false);
    if (isResizing) { document.addEventListener("mousemove", move); document.addEventListener("mouseup", up); document.body.style.cursor = "col-resize"; document.body.style.userSelect = "none"; }
    return () => { document.removeEventListener("mousemove", move); document.removeEventListener("mouseup", up); document.body.style.cursor = ""; document.body.style.userSelect = ""; };
  }, [isResizing, setSidebarWidth]);

  return <>
    <div className="relative" ref={sidebarRef}>
      <Sidebar collapsible="icon" className="border-r border-white/[0.07] bg-[#10131a]" disableTransition={isResizing}>
        <SidebarHeader className="h-[78px] justify-center border-b border-white/[0.06] px-3">
          <div className="flex w-full items-center gap-3">
            <button onClick={toggleSidebar} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/65 transition hover:bg-white/[0.08] hover:text-white" aria-label="Toggle navigation"><PanelLeft className="h-4 w-4" /></button>
            {!isCollapsed && <div className="min-w-0"><p className="truncate text-[13px] font-semibold tracking-tight text-white">Operator Console</p><p className="truncate text-[11px] text-white/35">YouTube Automation Studio</p></div>}
          </div>
        </SidebarHeader>
        {!isCollapsed && <div className="mx-3 mt-5 rounded-2xl border border-white/[0.07] bg-white/[0.035] p-3"><div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-[#73d9a8] shadow-[0_0_12px_#73d9a8]" /><span className="text-[11px] font-medium text-white/65">Workspace online</span></div><p className="mt-2 truncate text-xs font-medium text-white">Northstar Media</p><p className="mt-0.5 text-[11px] text-white/35">3 connected channels</p></div>}
        <SidebarContent className="px-2 pt-5"><p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/25">Workspace</p><SidebarMenu>
          {menuItems.map(item => { const isActive = location === item.path; return <SidebarMenuItem key={item.path}><SidebarMenuButton isActive={isActive} onClick={() => setLocation(item.path)} tooltip={item.label} className={`h-10 rounded-xl text-[13px] transition ${isActive ? "bg-[#ff5a5f]/12 text-[#ff9a9e] hover:bg-[#ff5a5f]/15 hover:text-[#ffb0b3]" : "text-white/48 hover:bg-white/[0.05] hover:text-white"}`}><item.icon className="h-[17px] w-[17px]" /><span>{item.label}</span>{item.label === "Review studio" && <span className="ml-auto rounded-full bg-[#ff5a5f] px-1.5 py-0.5 text-[10px] font-bold text-white">4</span>}</SidebarMenuButton></SidebarMenuItem>; })}
        </SidebarMenu></SidebarContent>
        <SidebarFooter className="border-t border-white/[0.06] p-3"><DropdownMenu><DropdownMenuTrigger asChild><button className="flex w-full items-center gap-2.5 rounded-xl px-1.5 py-2 text-left transition hover:bg-white/[0.05]"><Avatar className="h-8 w-8 border border-white/10"><AvatarFallback className="bg-[#2a2333] text-xs font-semibold text-[#ffafb2]">{user?.name?.charAt(0).toUpperCase() ?? "O"}</AvatarFallback></Avatar><div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden"><p className="truncate text-xs font-medium text-white/85">{user?.name || "Operator"}</p><p className="mt-0.5 truncate text-[10px] text-white/35">{user?.email || "Owner access"}</p></div><ChevronDown className="h-3.5 w-3.5 text-white/30 group-data-[collapsible=icon]:hidden" /></button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-48 border-white/10 bg-[#181b23] text-white"><DropdownMenuItem onClick={logout} className="cursor-pointer text-red-300 focus:bg-white/10 focus:text-red-200"><LogOut className="mr-2 h-4 w-4" />Sign out</DropdownMenuItem></DropdownMenuContent></DropdownMenu></SidebarFooter>
      </Sidebar>
      <div className={`absolute right-0 top-0 z-50 h-full w-1 cursor-col-resize transition hover:bg-[#ff5a5f]/25 ${isCollapsed ? "hidden" : ""}`} onMouseDown={() => !isCollapsed && setIsResizing(true)} />
    </div>
    <SidebarInset className="bg-[#0b0d12] text-white">
      {isMobile && <div className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-white/[0.07] bg-[#0b0d12]/95 px-3 backdrop-blur"><button onClick={toggleSidebar} className="rounded-lg p-2 text-white/65"><PanelLeft className="h-4 w-4" /></button><span className="text-sm font-medium">{activeMenuItem.label}</span></div>}
      <main className="min-h-screen">{children}</main>
    </SidebarInset>
  </>;
}
