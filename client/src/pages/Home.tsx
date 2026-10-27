import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  CalendarDays,
  Check,
  ChevronRight,
  CircleAlert,
  ClipboardCheck,
  Clock3,
  ExternalLink,
  FileText,
  Filter,
  Film,
  Gauge,
  Image as ImageIcon,
  Layers3,
  LockKeyhole,
  MessageSquare,
  MoreHorizontal,
  Play,
  Plus,
  RefreshCw,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  Sparkles,
  Tag,
  ThumbsUp,
  TrendingUp,
  UploadCloud,
  Users,
  WandSparkles,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation } from "wouter";

type View =
  | "overview"
  | "strategy"
  | "pipeline"
  | "review"
  | "calendar"
  | "analytics"
  | "engagement"
  | "settings";

type Status = "ready" | "active" | "review" | "blocked" | "scheduled";

const navByPath: Record<string, View> = {
  "/": "overview",
  "/strategy": "strategy",
  "/pipeline": "pipeline",
  "/review": "review",
  "/calendar": "calendar",
  "/analytics": "analytics",
  "/engagement": "engagement",
  "/settings": "settings",
};
const viewCopy: Record<
  View,
  { eyebrow: string; title: string; description: string }
> = {
  overview: {
    eyebrow: "OPERATIONS / OVERVIEW",
    title: "Good morning, Olivia.",
    description: "Here’s the state of your channel network at a glance.",
  },
  strategy: {
    eyebrow: "CHANNEL OS / STRATEGY",
    title: "Set the direction.",
    description:
      "Give the operator a clear destination, then keep every production aligned.",
  },
  pipeline: {
    eyebrow: "CONTENT OS / PIPELINE",
    title: "Move ideas forward.",
    description:
      "A single view of every topic, asset, decision, and next action.",
  },
  review: {
    eyebrow: "QUALITY CONTROL / REVIEW STUDIO",
    title: "Make the final call.",
    description:
      "AI prepares the package. You decide what earns a place on the channel.",
  },
  calendar: {
    eyebrow: "DISTRIBUTION / CALENDAR",
    title: "Publish with intent.",
    description:
      "Plan the next release window without losing sight of the work behind it.",
  },
  analytics: {
    eyebrow: "PERFORMANCE / ANALYTICS",
    title: "Learn from the signal.",
    description:
      "Real channel evidence, translated into decisions worth reviewing.",
  },
  engagement: {
    eyebrow: "AUDIENCE / ENGAGEMENT",
    title: "Stay close to the audience.",
    description:
      "Turn questions and patterns into thoughtful, reviewable responses.",
  },
  settings: {
    eyebrow: "CONTROL PLANE / SETTINGS",
    title: "Keep the system aligned.",
    description:
      "Channel policy, provider health, permissions, and safety controls.",
  },
};

const jobs = [
  {
    title: "The quiet systems behind a 2-person business",
    channel: "Northstar / Main",
    stage: "Narration",
    progress: 72,
    status: "active" as Status,
    updated: "2 min ago",
    color: "#a88bff",
  },
  {
    title: "5 AI workflows that save a Friday afternoon",
    channel: "Northstar / Main",
    stage: "Quality review",
    progress: 100,
    status: "review" as Status,
    updated: "18 min ago",
    color: "#ff8a91",
  },
  {
    title: "Why your automation stack feels harder than it should",
    channel: "Field Notes",
    stage: "Script",
    progress: 36,
    status: "active" as Status,
    updated: "41 min ago",
    color: "#68c7d6",
  },
];

const reviewItems = [
  {
    title: "5 AI workflows that save a Friday afternoon",
    meta: "Northstar / Main · 8 min watch",
    score: 94,
    issue: "1 source note to confirm",
    type: "Tutorial",
    accent: "#ff767d",
  },
  {
    title: "The creator’s guide to calm automation",
    meta: "Field Notes · 11 min watch",
    score: 88,
    issue: "Thumbnail text is ready",
    type: "Explainer",
    accent: "#a88bff",
  },
  {
    title: "A better way to plan your content week",
    meta: "Northstar / Main · 6 min watch",
    score: 91,
    issue: "Rights confirmation pending",
    type: "Story",
    accent: "#68c7d6",
  },
  {
    title: "What actually makes a workflow stick",
    meta: "Northstar / Main · 9 min watch",
    score: 86,
    issue: "Final metadata selection",
    type: "Essay",
    accent: "#e3af62",
  },
];

const calendarItems = [
  {
    day: "18",
    month: "SEP",
    title: "5 AI workflows that save a Friday afternoon",
    channel: "Northstar / Main",
    time: "09:30",
    status: "Ready for approval",
    accent: "#ff767d",
  },
  {
    day: "21",
    month: "SEP",
    title: "The creator’s guide to calm automation",
    channel: "Field Notes",
    time: "14:00",
    status: "Metadata in review",
    accent: "#a88bff",
  },
  {
    day: "24",
    month: "SEP",
    title: "A better way to plan your content week",
    channel: "Northstar / Main",
    time: "10:00",
    status: "Script approved",
    accent: "#68c7d6",
  },
  {
    day: "28",
    month: "SEP",
    title: "What actually makes a workflow stick",
    channel: "Northstar / Main",
    time: "09:30",
    status: "Research brief",
    accent: "#e3af62",
  },
];

function Pill({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "green" | "pink" | "purple" | "amber";
}) {
  const styles = {
    neutral: "border-white/10 bg-white/[0.04] text-white/55",
    green: "border-[#73d9a8]/25 bg-[#73d9a8]/10 text-[#9aeac5]",
    pink: "border-[#ff7d85]/25 bg-[#ff7d85]/10 text-[#ffafb3]",
    purple: "border-[#a88bff]/25 bg-[#a88bff]/10 text-[#c9baff]",
    amber: "border-[#e3af62]/25 bg-[#e3af62]/10 text-[#f2cb92]",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] ${styles[tone]}`}
    >
      {children}
    </span>
  );
}

function SectionHeader({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30">
          {eyebrow}
        </p>
        <h2 className="text-lg font-semibold tracking-tight text-white">
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}

function Panel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-white/[0.08] bg-white/[0.035] shadow-[0_16px_50px_rgba(0,0,0,0.12)] ${className}`}
    >
      {children}
    </section>
  );
}

function WorkspaceHeader({
  view,
  onCreate,
}: {
  view: View;
  onCreate: () => void;
}) {
  const copy = viewCopy[view];
  return (
    <header className="flex flex-col gap-5 border-b border-white/[0.07] px-6 pb-6 pt-7 md:flex-row md:items-end md:justify-between md:px-10 md:pt-9">
      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#ff8f95]">
          {copy.eyebrow}
        </p>
        <h1 className="text-[30px] font-semibold tracking-[-0.04em] text-white md:text-[36px]">
          {copy.title}
        </h1>
        <p className="mt-2 text-sm text-white/45">{copy.description}</p>
      </div>
      <div className="flex items-center gap-2">
        <button className="hidden h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 text-xs font-medium text-white/60 transition hover:bg-white/[0.08] hover:text-white md:flex">
          <Search className="h-3.5 w-3.5" /> Search{" "}
          <span className="ml-2 rounded border border-white/10 px-1.5 py-0.5 text-[10px] text-white/25">
            ⌘ K
          </span>
        </button>
        <Button
          onClick={onCreate}
          className="h-10 rounded-xl bg-[#ff5a5f] px-4 text-xs font-semibold text-white shadow-lg shadow-[#ff5a5f]/10 transition hover:bg-[#ff7378]"
        >
          <Plus className="mr-1.5 h-4 w-4" /> Create video
        </Button>
      </div>
    </header>
  );
}

function Overview({ go }: { go: (view: View) => void }) {
  const [showAll, setShowAll] = useState(false);
  return (
    <div className="space-y-7 px-6 py-7 md:px-10 md:py-8">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Needs your review",
            value: "04",
            note: "2 high priority",
            icon: ClipboardIcon,
            tone: "pink",
          },
          {
            label: "In production",
            value: "07",
            note: "3 active right now",
            icon: WandSparkles,
            tone: "purple",
          },
          {
            label: "Next publish",
            value: "18 SEP",
            note: "Northstar / Main · 09:30",
            icon: CalendarIcon,
            tone: "cyan",
          },
          {
            label: "7d watch time",
            value: "+18.4%",
            note: "vs. previous period",
            icon: TrendingUp,
            tone: "green",
          },
        ].map(stat => (
          <Panel
            key={stat.label}
            className="group p-5 transition hover:-translate-y-0.5 hover:bg-white/[0.055]"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-white/42">{stat.label}</p>
                <p className="mt-3 text-[27px] font-semibold tracking-[-0.04em] text-white">
                  {stat.value}
                </p>
                <p className="mt-1 text-[11px] text-white/32">{stat.note}</p>
              </div>
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl ${stat.tone === "pink" ? "bg-[#ff5a5f]/12 text-[#ff9ca1]" : stat.tone === "purple" ? "bg-[#a88bff]/12 text-[#c9baff]" : stat.tone === "cyan" ? "bg-[#68c7d6]/12 text-[#9be1ea]" : "bg-[#73d9a8]/12 text-[#9aeac5]"}`}
              >
                <stat.icon className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className={`h-full rounded-full ${stat.tone === "pink" ? "bg-[#ff767d]" : stat.tone === "purple" ? "bg-[#a88bff]" : stat.tone === "cyan" ? "bg-[#68c7d6]" : "bg-[#73d9a8]"}`}
                style={{
                  width:
                    stat.tone === "green"
                      ? "72%"
                      : stat.tone === "pink"
                        ? "44%"
                        : stat.tone === "purple"
                          ? "65%"
                          : "82%",
                }}
              />
            </div>
          </Panel>
        ))}
      </div>
      <div className="grid gap-7 xl:grid-cols-[1.4fr_1fr]">
        <Panel className="p-5">
          <SectionHeader
            eyebrow="DECISION QUEUE"
            title="Ready for your call"
            action={
              <button
                onClick={() => go("review")}
                className="text-xs font-medium text-[#ff969a] transition hover:text-white"
              >
                View all <ChevronRight className="ml-1 inline h-3.5 w-3.5" />
              </button>
            }
          />
          <div className="space-y-2">
            {reviewItems.slice(0, showAll ? 4 : 3).map((item, index) => (
              <div
                key={item.title}
                className="group flex items-center gap-3 rounded-xl border border-white/[0.06] bg-black/10 p-3 transition hover:border-white/15 hover:bg-white/[0.05]"
              >
                <div
                  className="flex h-11 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg"
                  style={{
                    background: `linear-gradient(135deg, ${item.accent}30, #191c25)`,
                  }}
                >
                  <Play className="h-4 w-4 text-white/65" fill="currentColor" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-[13px] font-medium text-white/85">
                      {item.title}
                    </p>
                    {index === 0 && (
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#ff7378] shadow-[0_0_8px_#ff7378]" />
                    )}
                  </div>
                  <p className="mt-1 text-[11px] text-white/35">
                    {item.meta} ·{" "}
                    <span className="text-[#9aeac5]">Quality {item.score}</span>
                  </p>
                </div>
                <button
                  onClick={() => go("review")}
                  className="rounded-lg border border-white/10 px-2.5 py-2 text-[11px] font-medium text-white/55 transition hover:border-[#ff767d]/35 hover:text-white"
                >
                  Review
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => setShowAll(!showAll)}
            className="mt-4 text-[11px] text-white/32 transition hover:text-white/65"
          >
            {showAll ? "Show less" : "+ 1 more waiting for you"}
          </button>
        </Panel>
        <Panel className="p-5">
          <SectionHeader
            eyebrow="CHANNEL PULSE"
            title="Northstar network"
            action={
              <Pill tone="green">
                <span className="h-1.5 w-1.5 rounded-full bg-[#73d9a8]" />{" "}
                Healthy
              </Pill>
            }
          />
          <div className="rounded-xl border border-white/[0.06] bg-[#10131a] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/42">Audience momentum</p>
                <p className="mt-1 text-2xl font-semibold tracking-tight text-white">
                  +12.8%
                </p>
              </div>
              <div className="rounded-lg bg-[#73d9a8]/10 px-2 py-1 text-[10px] font-semibold text-[#9aeac5]">
                vs. 28 days
              </div>
            </div>
            <div className="mt-5 flex h-20 items-end gap-1.5">
              {[
                28, 34, 31, 45, 38, 53, 47, 64, 58, 73, 67, 82, 78, 92, 88, 100,
              ].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-sm bg-gradient-to-t from-[#73d9a8]/25 to-[#73d9a8]"
                  style={{ height: `${h}%`, opacity: 0.35 + i / 24 }}
                />
              ))}
            </div>
            <div className="mt-2 flex justify-between text-[10px] text-white/25">
              <span>01 SEP</span>
              <span>08 SEP</span>
              <span>15 SEP</span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { value: "84.2k", label: "Views" },
              { value: "6.8%", label: "CTR" },
              { value: "46.5%", label: "Retention" },
            ].map(stat => (
              <div
                key={stat.label}
                className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-3"
              >
                <p className="text-sm font-semibold text-white">{stat.value}</p>
                <p className="mt-1 text-[10px] text-white/32">{stat.label}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
      <div className="grid gap-7 xl:grid-cols-[1fr_1fr]">
        <Panel className="p-5">
          <SectionHeader
            eyebrow="ACTIVE WORK"
            title="Production jobs"
            action={
              <button
                onClick={() => go("pipeline")}
                className="text-xs font-medium text-white/42 transition hover:text-white"
              >
                Open pipeline{" "}
                <ChevronRight className="ml-1 inline h-3.5 w-3.5" />
              </button>
            }
          />
          <div className="space-y-4">
            {jobs.map(job => (
              <div key={job.title}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-white/78">
                      {job.title}
                    </p>
                    <p className="mt-1 text-[11px] text-white/32">
                      {job.channel} · {job.stage} · {job.updated}
                    </p>
                  </div>
                  <Pill
                    tone={
                      job.status === "review"
                        ? "pink"
                        : job.status === "active"
                          ? "purple"
                          : "neutral"
                    }
                  >
                    {job.status === "review" ? "Review" : "Running"}
                  </Pill>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.07]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${job.progress}%`,
                        background: job.color,
                      }}
                    />
                  </div>
                  <span className="font-mono text-[10px] text-white/35">
                    {job.progress}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Panel>
        <Panel className="p-5">
          <SectionHeader
            eyebrow="UP NEXT"
            title="Publishing calendar"
            action={
              <button
                onClick={() => go("calendar")}
                className="text-xs font-medium text-white/42 transition hover:text-white"
              >
                Full calendar{" "}
                <ChevronRight className="ml-1 inline h-3.5 w-3.5" />
              </button>
            }
          />
          <div className="space-y-2">
            {calendarItems.slice(0, 3).map(item => (
              <div
                key={item.title}
                className="flex items-center gap-3 rounded-xl border border-white/[0.06] p-3"
              >
                <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg border border-white/[0.07] bg-black/10">
                  <span className="text-[9px] font-semibold tracking-wider text-white/35">
                    {item.month}
                  </span>
                  <span className="text-base font-semibold text-white">
                    {item.day}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-white/78">
                    {item.title}
                  </p>
                  <p className="mt-1 text-[11px] text-white/32">
                    {item.channel} · {item.time}
                  </p>
                </div>
                <div
                  className="h-2 w-2 rounded-full"
                  style={{
                    background: item.accent,
                    boxShadow: `0 0 10px ${item.accent}`,
                  }}
                />
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function Strategy() {
  return (
    <div className="space-y-7 px-6 py-7 md:px-10 md:py-8">
      <div className="grid gap-7 xl:grid-cols-[1.45fr_0.75fr]">
        <Panel className="p-6">
          <SectionHeader
            eyebrow="ACTIVE MANDATE"
            title="Northstar / Main"
            action={
              <Pill tone="green">
                <Check className="h-3 w-3" /> Active
              </Pill>
            }
          />
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="Channel objective"
              value="Make practical AI feel calm, clear, and immediately useful for small teams."
              wide
            />
            <Field
              label="Primary audience"
              value="Small business owners and operators building their first systems."
              wide
            />
            <Field
              label="Content pillars"
              value="AI workflows, thoughtful tools, operating systems, creator economics"
              wide
            />
            <Field
              label="Brand voice"
              value="Clear, grounded, quietly optimistic, never hype-driven"
            />
            <Field label="Default format" value="Explainer · Tutorial" />
            <Field label="Publishing cadence" value="2 videos per week" />
            <Field
              label="Primary outcome"
              value="Net subscribers · 1,000 / 90 days"
            />
            <Field
              label="Guardrails"
              value="No unverified claims · Show trade-offs"
              wide
            />
          </div>
          <div className="mt-6 flex items-center justify-between border-t border-white/[0.07] pt-5">
            <p className="text-[11px] text-white/35">
              <LockKeyhole className="mr-1 inline h-3 w-3" /> Changes are
              versioned and recorded in the audit log.
            </p>
            <Button className="h-9 rounded-lg bg-white/[0.08] px-3 text-xs text-white hover:bg-white/[0.14]">
              Edit strategy
            </Button>
          </div>
        </Panel>
        <Panel className="p-6">
          <SectionHeader eyebrow="OPERATOR STATUS" title="Planning posture" />
          <div className="flex items-center gap-3 rounded-xl border border-[#73d9a8]/15 bg-[#73d9a8]/[0.06] p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#73d9a8]/15 text-[#9aeac5]">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-white/85">Ready to plan</p>
              <p className="mt-1 text-[11px] leading-5 text-white/38">
                The next operator run will use this mandate as its planning
                constraint.
              </p>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {[
              {
                label: "Research sources",
                value: "YouTube signals + approved sources",
                icon: Search,
              },
              {
                label: "Planning cadence",
                value: "Monday & Thursday · 06:00",
                icon: Clock3,
              },
              {
                label: "Approval policy",
                value: "Required at every external action",
                icon: ShieldCheck,
              },
            ].map(row => (
              <div
                key={row.label}
                className="flex items-center gap-3 border-b border-white/[0.06] pb-3"
              >
                <row.icon className="h-4 w-4 text-white/35" />
                <div>
                  <p className="text-[11px] text-white/35">{row.label}</p>
                  <p className="mt-1 text-xs text-white/75">{row.value}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-5 flex items-center text-xs font-medium text-[#ff969a]">
            Run planning review <ChevronRight className="ml-1 h-3.5 w-3.5" />
          </button>
        </Panel>
      </div>
      <Panel className="p-6">
        <SectionHeader
          eyebrow="EDITORIAL GUARDRAILS"
          title="The rules the operator should never forget"
          action={
            <button className="text-xs text-white/42 hover:text-white">
              Manage rules
            </button>
          }
        />
        <div className="grid gap-3 md:grid-cols-3">
          {[
            {
              title: "Prove the point",
              copy: "Every factual claim needs a source, a caveat, or a reviewer note.",
              tone: "pink",
            },
            {
              title: "Respect attention",
              copy: "Hooks should earn curiosity without manufacturing urgency or fear.",
              tone: "purple",
            },
            {
              title: "Make it useful",
              copy: "Every video should leave the viewer with a decision or next step.",
              tone: "green",
            },
          ].map(rule => (
            <div
              key={rule.title}
              className="rounded-xl border border-white/[0.07] bg-black/10 p-4"
            >
              <div
                className={`mb-5 h-1 w-9 rounded-full ${rule.tone === "pink" ? "bg-[#ff767d]" : rule.tone === "purple" ? "bg-[#a88bff]" : "bg-[#73d9a8]"}`}
              />
              <p className="text-sm font-medium text-white/85">{rule.title}</p>
              <p className="mt-2 text-xs leading-5 text-white/38">
                {rule.copy}
              </p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function Pipeline() {
  const stages = [
    "Research",
    "Script",
    "Packaging",
    "Production",
    "Review",
    "Approved",
  ];
  return (
    <div className="space-y-6 px-6 py-7 md:px-10 md:py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-xs text-white/65">
            <Filter className="h-3.5 w-3.5" /> All channels{" "}
            <ChevronRight className="h-3 w-3 rotate-90" />
          </button>
          <button className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-xs text-white/65">
            <Layers3 className="h-3.5 w-3.5" /> All stages{" "}
            <ChevronRight className="h-3 w-3 rotate-90" />
          </button>
        </div>
        <p className="text-[11px] text-white/30">
          18 active content items · updated just now
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[
          ...reviewItems,
          {
            title: "The quiet systems behind a 2-person business",
            meta: "Northstar / Main · 12 min watch",
            score: 0,
            issue: "Narration in progress",
            type: "Essay",
            accent: "#68c7d6",
          },
          {
            title: "Why your automation stack feels harder than it should",
            meta: "Field Notes · 7 min watch",
            score: 0,
            issue: "Script draft",
            type: "Explainer",
            accent: "#e3af62",
          },
        ].map((item, i) => (
          <Panel key={item.title} className="overflow-hidden">
            <div
              className="relative h-32"
              style={{
                background: `radial-gradient(circle at 20% 20%, ${item.accent}40, transparent 45%), linear-gradient(135deg, #161922, #0f1117)`,
              }}
            >
              <div className="absolute left-4 top-4">
                <Pill tone={item.score ? "pink" : "purple"}>{item.type}</Pill>
              </div>
              <div className="absolute bottom-4 left-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black/20">
                  <Play
                    className="h-3.5 w-3.5 text-white/75"
                    fill="currentColor"
                  />
                </div>
                <span className="text-[11px] text-white/50">
                  Preview package
                </span>
              </div>
              <button className="absolute right-4 top-4 text-white/35 hover:text-white">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="line-clamp-2 text-sm font-medium leading-5 text-white/85">
                    {item.title}
                  </p>
                  <p className="mt-2 text-[11px] text-white/32">{item.meta}</p>
                </div>
                {item.score > 0 && (
                  <span className="font-mono text-[11px] text-[#9aeac5]">
                    {item.score}/100
                  </span>
                )}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3">
                <span className="flex items-center gap-1.5 text-[11px] text-white/42">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: item.accent }}
                  />{" "}
                  {item.issue}
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-white/25" />
              </div>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}

function ReviewStudio({
  onConfirm,
}: {
  onConfirm: (type: "publish" | "comment") => void;
}) {
  const [tab, setTab] = useState("Script");
  const tabs = [
    "Script",
    "Metadata",
    "Thumbnail",
    "Sources & rights",
    "Quality",
  ];
  return (
    <div className="space-y-6 px-6 py-7 md:px-10 md:py-8">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <div className="flex items-center gap-2">
            <Pill tone="pink">
              <CircleAlert className="h-3 w-3" /> Needs your review
            </Pill>
            <span className="text-[11px] text-white/30">
              Version 07 · updated 18 min ago
            </span>
          </div>
          <h2 className="mt-4 max-w-2xl text-2xl font-semibold tracking-tight text-white">
            5 AI workflows that save a Friday afternoon
          </h2>
          <p className="mt-2 text-sm text-white/40">
            Northstar / Main · Tutorial · 8:14 · proposed publish Sep 18 at
            09:30
          </p>
        </div>
        <div className="flex gap-2">
          <Button className="h-10 rounded-xl border border-white/10 bg-white/[0.05] px-3 text-xs text-white/65 hover:bg-white/[0.1]">
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Regenerate
          </Button>
          <Button
            onClick={() => onConfirm("publish")}
            className="h-10 rounded-xl bg-[#ff5a5f] px-4 text-xs font-semibold text-white hover:bg-[#ff7378]"
          >
            <ShieldCheck className="mr-1.5 h-3.5 w-3.5" /> Approve & schedule
          </Button>
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.55fr_0.75fr]">
        <Panel className="overflow-hidden">
          <div className="flex gap-1 overflow-x-auto border-b border-white/[0.07] px-4 pt-3">
            {tabs.map(item => (
              <button
                key={item}
                onClick={() => setTab(item)}
                className={`whitespace-nowrap border-b-2 px-3 py-3 text-xs font-medium transition ${tab === item ? "border-[#ff767d] text-white" : "border-transparent text-white/35 hover:text-white/65"}`}
              >
                {item}
              </button>
            ))}
          </div>
          {tab === "Script" && (
            <div className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30">
                  Editable script
                </p>
                <button className="text-xs text-[#ff969a]">Edit draft</button>
              </div>
              <div className="mt-6 space-y-5">
                <ScriptBlock
                  label="HOOK · 00:00–00:18"
                  title="The best automation workflows are the ones you stop noticing."
                  text="Not because they are flashy. Because they quietly return an hour to you every Friday afternoon."
                />
                <ScriptBlock
                  label="SETUP · 00:18–01:12"
                  title="Start with the work that repeats, not the tool that is trending."
                  text="In this video, we’re going to build five small systems around the work that happens every week: intake, handoff, follow-up, and the decisions that keep getting delayed."
                />
                <ScriptBlock
                  label="WORKFLOW 01 · 01:12–02:25"
                  title="A single source of truth for the work in motion."
                  text="The first workflow is a lightweight operating brief. It gives the team one place to see what changed, what is blocked, and what needs a human decision."
                />
              </div>
            </div>
          )}
          {tab === "Metadata" && <MetadataPanel />}
          {tab === "Thumbnail" && <ThumbnailPanel />}
          {tab === "Sources & rights" && <SourcesPanel />}
          {tab === "Quality" && <QualityPanel />}
        </Panel>
        <div className="space-y-6">
          <Panel className="p-5">
            <SectionHeader
              eyebrow="REVIEW HEALTH"
              title="Ready with one note"
            />
            <div className="space-y-3">
              {[
                {
                  label: "Script completeness",
                  value: "Passed",
                  tone: "green",
                },
                { label: "Metadata quality", value: "Passed", tone: "green" },
                {
                  label: "Factual sources",
                  value: "1 to confirm",
                  tone: "amber",
                },
                { label: "Media rights", value: "Passed", tone: "green" },
                { label: "Narration", value: "Passed", tone: "green" },
              ].map(check => (
                <div
                  key={check.label}
                  className="flex items-center justify-between border-b border-white/[0.06] pb-3 last:border-0 last:pb-0"
                >
                  <span className="text-xs text-white/50">{check.label}</span>
                  <Pill tone={check.tone as "green" | "amber"}>
                    {check.value}
                  </Pill>
                </div>
              ))}
            </div>
          </Panel>
          <Panel className="p-5">
            <SectionHeader
              eyebrow="FINAL GATE"
              title="Nothing moves silently"
            />
            <p className="text-xs leading-5 text-white/40">
              Scheduling is locked until you confirm the exact channel, content
              version, privacy, and publish time.
            </p>
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-[#ff767d]/15 bg-[#ff767d]/[0.06] p-3">
              <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-[#ff9ca1]" />
              <p className="text-[11px] leading-5 text-[#ffb5b8]/75">
                You will see the final payload again before YouTube is called.
              </p>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function Calendar() {
  return (
    <div className="space-y-6 px-6 py-7 md:px-10 md:py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-white/75">September 2026</p>
          <p className="mt-1 text-xs text-white/32">
            2 channels · 4 planned releases · 1 approval needed
          </p>
        </div>
        <div className="flex gap-2">
          <button className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/55">
            ‹
          </button>
          <button className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/55">
            Today
          </button>
          <button className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/55">
            ›
          </button>
        </div>
      </div>
      <Panel className="overflow-hidden">
        <div className="grid grid-cols-7 border-b border-white/[0.07] bg-white/[0.02]">
          {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map(day => (
            <div
              key={day}
              className="p-3 text-center text-[10px] font-semibold tracking-[0.15em] text-white/25"
            >
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {Array.from({ length: 35 }, (_, i) => {
            const day = i - 1;
            const item = calendarItems.find(x => Number(x.day) === day + 18);
            return (
              <div
                key={i}
                className={`min-h-[112px] border-b border-r border-white/[0.06] p-2.5 ${day < 1 || day > 30 ? "bg-black/10" : ""}`}
              >
                <span
                  className={`text-[11px] ${day === 17 ? "flex h-6 w-6 items-center justify-center rounded-full bg-[#ff5a5f] font-semibold text-white" : "text-white/35"}`}
                >
                  {day > 0 && day <= 30 ? day : ""}
                </span>
                {item && (
                  <div className="mt-2 rounded-lg border border-white/[0.08] bg-white/[0.045] p-2">
                    <div className="mb-1 flex items-center gap-1.5">
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: item.accent }}
                      />
                      <span className="text-[9px] font-semibold uppercase tracking-wide text-white/35">
                        {item.time}
                      </span>
                    </div>
                    <p className="line-clamp-2 text-[10px] leading-4 text-white/70">
                      {item.title}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}

function Analytics() {
  return (
    <div className="space-y-7 px-6 py-7 md:px-10 md:py-8">
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Views", value: "84,201", delta: "+18.4%", tone: "green" },
          {
            label: "Average CTR",
            value: "6.8%",
            delta: "+0.9 pts",
            tone: "purple",
          },
          {
            label: "Average retention",
            value: "46.5%",
            delta: "+3.2 pts",
            tone: "cyan",
          },
        ].map(card => (
          <Panel key={card.label} className="p-5">
            <p className="text-xs text-white/42">{card.label}</p>
            <div className="mt-3 flex items-end justify-between">
              <p className="text-2xl font-semibold tracking-tight text-white">
                {card.value}
              </p>
              <span
                className={`text-[11px] font-semibold ${card.tone === "green" ? "text-[#9aeac5]" : card.tone === "purple" ? "text-[#c9baff]" : "text-[#9be1ea]"}`}
              >
                {card.delta}
              </span>
            </div>
            <div className="mt-4 flex h-8 items-end gap-1">
              {[32, 45, 37, 54, 49, 68, 63, 78, 74, 92].map((h, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-t-sm ${card.tone === "green" ? "bg-[#73d9a8]" : card.tone === "purple" ? "bg-[#a88bff]" : "bg-[#68c7d6]"}`}
                  style={{ height: `${h}%`, opacity: 0.22 + i / 20 }}
                />
              ))}
            </div>
          </Panel>
        ))}
      </div>
      <div className="grid gap-7 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel className="p-5">
          <SectionHeader
            eyebrow="WHAT THE CHANNEL IS LEARNING"
            title="Pending recommendations"
            action={<Pill tone="amber">3 pending review</Pill>}
          />
          <div className="space-y-3">
            {[
              {
                title: "Lead with the workflow, not the tool",
                copy: "Tutorials with a visible before/after in the first 30 seconds retain 11% more viewers in the current cohort.",
                evidence: "4 videos · 95% confidence",
                icon: TrendingUp,
                tone: "green",
              },
              {
                title: "Quiet titles are outperforming urgency",
                copy: "Titles framed around a useful outcome are producing stronger 7-day CTR than urgency-led variants.",
                evidence: "6 videos · 88% confidence",
                icon: Tag,
                tone: "purple",
              },
              {
                title: "Shorter intros are worth testing",
                copy: "The audience drops most often between 00:18 and 00:27. A tighter setup may improve first-minute retention.",
                evidence: "5 videos · 81% confidence",
                icon: Gauge,
                tone: "pink",
              },
            ].map(rec => (
              <div
                key={rec.title}
                className="flex gap-3 rounded-xl border border-white/[0.07] bg-black/10 p-4"
              >
                <div
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${rec.tone === "green" ? "bg-[#73d9a8]/10 text-[#9aeac5]" : rec.tone === "purple" ? "bg-[#a88bff]/10 text-[#c9baff]" : "bg-[#ff767d]/10 text-[#ffafb3]"}`}
                >
                  <rec.icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white/82">
                    {rec.title}
                  </p>
                  <p className="mt-1.5 text-xs leading-5 text-white/40">
                    {rec.copy}
                  </p>
                  <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/25">
                    {rec.evidence}
                  </p>
                </div>
                <button className="self-start rounded-lg border border-white/10 px-2.5 py-1.5 text-[10px] text-white/45 hover:text-white">
                  Review
                </button>
              </div>
            ))}
          </div>
        </Panel>
        <Panel className="p-5">
          <SectionHeader eyebrow="RECENT RELEASES" title="Compare by video" />
          <div className="space-y-4">
            {[
              {
                title: "5 AI workflows...",
                views: "22.4k",
                retention: "52%",
                color: "#ff767d",
              },
              {
                title: "Calm automation",
                views: "18.2k",
                retention: "49%",
                color: "#a88bff",
              },
              {
                title: "Plan your week",
                views: "14.1k",
                retention: "44%",
                color: "#68c7d6",
              },
              {
                title: "Workflow that sticks",
                views: "11.7k",
                retention: "41%",
                color: "#e3af62",
              },
            ].map(video => (
              <div key={video.title} className="flex items-center gap-3">
                <div
                  className="h-8 w-8 rounded-lg"
                  style={{
                    background: `${video.color}25`,
                    border: `1px solid ${video.color}45`,
                  }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs text-white/68">
                    {video.title}
                  </p>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.07]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${parseInt(video.retention)}%`,
                        background: video.color,
                      }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-white/70">
                    {video.views}
                  </p>
                  <p className="mt-1 text-[10px] text-white/30">
                    {video.retention}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function Engagement({
  onConfirm,
}: {
  onConfirm: (type: "publish" | "comment") => void;
}) {
  return (
    <div className="space-y-6 px-6 py-7 md:px-10 md:py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Pill tone="green">
            <RefreshCw className="h-3 w-3" /> Synced 12 min ago
          </Pill>
          <span className="text-[11px] text-white/30">
            186 recent comments · 12 need attention
          </span>
        </div>
        <Button className="h-9 rounded-lg bg-white/[0.07] px-3 text-xs text-white/65 hover:bg-white/[0.12]">
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Sync now
        </Button>
      </div>
      <div className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
        <Panel className="p-5">
          <SectionHeader
            eyebrow="AUDIENCE SIGNAL"
            title="What people are asking"
          />
          <div className="space-y-3">
            {[
              { label: "Setup help", count: 38, tone: "pink" },
              { label: "Tool comparisons", count: 26, tone: "purple" },
              { label: "Templates & examples", count: 19, tone: "cyan" },
              { label: "Pricing questions", count: 14, tone: "amber" },
            ].map(theme => (
              <div key={theme.label}>
                <div className="flex justify-between text-xs">
                  <span className="text-white/55">{theme.label}</span>
                  <span className="text-white/32">{theme.count}</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                  <div
                    className={`h-full rounded-full ${theme.tone === "pink" ? "bg-[#ff767d]" : theme.tone === "purple" ? "bg-[#a88bff]" : theme.tone === "cyan" ? "bg-[#68c7d6]" : "bg-[#e3af62]"}`}
                    style={{ width: `${theme.count * 2}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-xl border border-[#a88bff]/15 bg-[#a88bff]/[0.05] p-4">
            <div className="flex items-center gap-2 text-[#c9baff]">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs font-medium">Idea emerging</span>
            </div>
            <p className="mt-2 text-xs leading-5 text-white/50">
              Three or more viewers asked for a “first automation stack”
              walkthrough. Draft idea is pending approval.
            </p>
            <button className="mt-3 text-[11px] font-medium text-[#c9baff]">
              Review idea →
            </button>
          </div>
        </Panel>
        <Panel className="p-5">
          <SectionHeader
            eyebrow="REPLY QUEUE"
            title="Drafts waiting for you"
            action={<Pill tone="pink">8 pending</Pill>}
          />
          <div className="space-y-2">
            {[
              {
                name: "Maya Chen",
                comment:
                  "This is the first workflow explanation that actually made sense. How would you adapt it for a team of one?",
                draft:
                  "For a team of one, I’d keep the same principle but collapse the handoff into a single weekly review...",
                sentiment: "Positive",
                color: "#ff767d",
              },
              {
                name: "Sam Ortega",
                comment:
                  "Do you have a template for the operating brief you mentioned?",
                draft:
                  "Yes — we’re polishing a simple version now. I’ll link it here as soon as it’s ready...",
                sentiment: "Question",
                color: "#68c7d6",
              },
              {
                name: "Ari Williams",
                comment:
                  "Would this work with Notion, or is it better in a spreadsheet?",
                draft:
                  "Both can work. I’d choose based on where your team already looks every day...",
                sentiment: "Question",
                color: "#a88bff",
              },
            ].map(row => (
              <div
                key={row.name}
                className="rounded-xl border border-white/[0.07] bg-black/10 p-4"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                    style={{ background: `${row.color}45` }}
                  >
                    {row.name
                      .split(" ")
                      .map(x => x[0])
                      .join("")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-medium text-white/75">
                        {row.name}
                      </p>
                      <Pill
                        tone={
                          row.sentiment === "Positive" ? "green" : "neutral"
                        }
                      >
                        {row.sentiment}
                      </Pill>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-white/45">
                      {row.comment}
                    </p>
                    <div className="mt-3 rounded-lg border border-white/[0.06] bg-white/[0.025] p-3">
                      <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/25">
                        AI draft · editable
                      </p>
                      <p className="text-xs leading-5 text-white/65">
                        {row.draft}
                      </p>
                    </div>
                    <div className="mt-3 flex justify-end gap-2">
                      <button className="rounded-lg border border-white/10 px-2.5 py-1.5 text-[10px] text-white/45 hover:text-white">
                        Edit
                      </button>
                      <button
                        onClick={() => onConfirm("comment")}
                        className="rounded-lg bg-[#ff5a5f]/15 px-2.5 py-1.5 text-[10px] font-semibold text-[#ffafb3] hover:bg-[#ff5a5f]/25"
                      >
                        Approve reply
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function Settings() {
  return (
    <div className="space-y-6 px-6 py-7 md:px-10 md:py-8">
      <div className="grid gap-6 xl:grid-cols-2">
        <Panel className="p-6">
          <SectionHeader
            eyebrow="CHANNEL NETWORK"
            title="Connected channels"
            action={
              <Button className="h-8 rounded-lg bg-white/[0.08] px-3 text-[11px] text-white/65 hover:bg-white/[0.13]">
                <Plus className="mr-1 h-3.5 w-3.5" /> Connect channel
              </Button>
            }
          />
          <div className="space-y-3">
            {[
              {
                name: "Northstar / Main",
                handle: "@northstarops",
                status: "Connected",
                subscribers: "18.4k",
                color: "#ff767d",
              },
              {
                name: "Field Notes",
                handle: "@fieldnotesstudio",
                status: "Connected",
                subscribers: "6.2k",
                color: "#a88bff",
              },
              {
                name: "Systems Weekly",
                handle: "Not connected",
                status: "Setup needed",
                subscribers: "—",
                color: "#68c7d6",
              },
            ].map(channel => (
              <div
                key={channel.name}
                className="flex items-center gap-3 rounded-xl border border-white/[0.07] p-3"
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold text-white"
                  style={{
                    background: `${channel.color}32`,
                    border: `1px solid ${channel.color}50`,
                  }}
                >
                  {channel.name.split("/")[0].trim().slice(0, 1)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white/80">
                    {channel.name}
                  </p>
                  <p className="mt-1 text-[11px] text-white/32">
                    {channel.handle} · {channel.subscribers} subscribers
                  </p>
                </div>
                <Pill tone={channel.status === "Connected" ? "green" : "amber"}>
                  {channel.status}
                </Pill>
                <button className="text-white/25 hover:text-white">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </Panel>
        <Panel className="p-6">
          <SectionHeader eyebrow="SAFETY POLICY" title="External actions" />
          <div className="space-y-4">
            {[
              {
                label: "Require final confirmation before upload",
                copy: "Always on · cannot be disabled",
                on: true,
              },
              {
                label: "Require final confirmation before scheduling",
                copy: "Always on · cannot be disabled",
                on: true,
              },
              {
                label: "Require approval before comment posting",
                copy: "Always on · cannot be disabled",
                on: true,
              },
              {
                label: "Allow AI to change approved metadata",
                copy: "Disabled by policy",
                on: false,
              },
            ].map(setting => (
              <div
                key={setting.label}
                className="flex items-center justify-between gap-4 border-b border-white/[0.06] pb-4 last:border-0 last:pb-0"
              >
                <div>
                  <p className="text-xs font-medium text-white/70">
                    {setting.label}
                  </p>
                  <p className="mt-1 text-[11px] text-white/32">
                    {setting.copy}
                  </p>
                </div>
                <div
                  className={`flex h-6 w-10 items-center rounded-full p-1 ${setting.on ? "justify-end bg-[#73d9a8]/35" : "justify-start bg-white/10"}`}
                >
                  <div
                    className={`h-4 w-4 rounded-full ${setting.on ? "bg-[#9aeac5]" : "bg-white/40"}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
      <Panel className="p-6">
        <SectionHeader eyebrow="PROVIDER HEALTH" title="Connected services" />
        <div className="grid gap-3 md:grid-cols-3">
          {[
            {
              name: "LLM provider",
              detail: "Structured output · healthy",
              icon: Sparkles,
              tone: "purple",
            },
            {
              name: "Media storage",
              detail: "82 GB available · healthy",
              icon: UploadCloud,
              tone: "cyan",
            },
            {
              name: "YouTube API",
              detail: "2 channels · tokens healthy",
              icon: Play,
              tone: "pink",
            },
          ].map(provider => (
            <div
              key={provider.name}
              className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-black/10 p-4"
            >
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl ${provider.tone === "purple" ? "bg-[#a88bff]/10 text-[#c9baff]" : provider.tone === "cyan" ? "bg-[#68c7d6]/10 text-[#9be1ea]" : "bg-[#ff767d]/10 text-[#ffafb3]"}`}
              >
                <provider.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-medium text-white/75">
                  {provider.name}
                </p>
                <p className="mt-1 text-[10px] text-[#9aeac5]">
                  {provider.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function Field({
  label,
  value,
  wide = false,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border border-white/[0.07] bg-black/10 p-4 ${wide ? "md:col-span-2" : ""}`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/27">
        {label}
      </p>
      <p className="mt-2 text-sm leading-5 text-white/70">{value}</p>
    </div>
  );
}
function ScriptBlock({
  label,
  title,
  text,
}: {
  label: string;
  title: string;
  text: string;
}) {
  return (
    <div className="border-l-2 border-[#ff767d]/45 pl-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[#ff969a]">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium leading-6 text-white/82">
        {title}
      </p>
      <p className="mt-2 text-sm leading-6 text-white/48">{text}</p>
    </div>
  );
}
function MetadataPanel() {
  return (
    <div className="space-y-5 p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Field
          label="Selected title"
          value="5 AI workflows that save a Friday afternoon"
        />
        <Field label="Category" value="Howto & Style" />
        <Field
          label="Description"
          value="A grounded walkthrough of five small systems that return time to a small team every week."
          wide
        />
        <Field
          label="Tags"
          value="AI workflows, small business systems, automation, productivity"
          wide
        />
      </div>
      <div className="rounded-xl border border-[#73d9a8]/15 bg-[#73d9a8]/[0.05] p-4">
        <p className="text-xs font-medium text-[#9aeac5]">SEO review passed</p>
        <p className="mt-1 text-xs text-white/40">
          The selected title is clear, specific, and aligned with the approved
          topic angle.
        </p>
      </div>
    </div>
  );
}
function ThumbnailPanel() {
  return (
    <div className="grid gap-6 p-6 md:grid-cols-[1fr_1fr]">
      <div
        className="flex aspect-video items-center justify-center rounded-xl border border-white/10"
        style={{
          background:
            "radial-gradient(circle at 25% 20%, #ff767d55, transparent 40%), linear-gradient(135deg, #181b24, #0d0f14)",
        }}
      >
        <div className="text-center">
          <ImageIcon className="mx-auto h-8 w-8 text-[#ff9ca1]" />
          <p className="mt-3 text-xs text-white/50">Thumbnail preview</p>
        </div>
      </div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30">
          Selected brief
        </p>
        <p className="mt-3 text-sm leading-6 text-white/70">
          Warm Friday desk scene, five small glowing workflow cards moving into
          a single calm weekly rhythm. No exaggerated facial expression. One
          short text line: “GET YOUR FRIDAY BACK”.
        </p>
        <div className="mt-5 rounded-xl border border-white/[0.07] bg-black/10 p-4">
          <p className="text-xs font-medium text-white/70">Rights status</p>
          <p className="mt-1 text-xs text-[#9aeac5]">
            Generated asset · provenance recorded
          </p>
        </div>
      </div>
    </div>
  );
}
function SourcesPanel() {
  return (
    <div className="space-y-3 p-6">
      {[
        {
          source: "YouTube Help · Manage your time with workflows",
          type: "Official source",
          status: "Verified",
        },
        {
          source: "Northstar internal workflow notes · Sep 2026",
          type: "Operator evidence",
          status: "Verified",
        },
        {
          source: "AI-generated example · workflow estimate",
          type: "Needs review",
          status: "Confirm wording",
        },
      ].map(source => (
        <div
          key={source.source}
          className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-black/10 p-4"
        >
          <FileText className="h-4 w-4 text-white/35" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-white/72">
              {source.source}
            </p>
            <p className="mt-1 text-[10px] text-white/32">{source.type}</p>
          </div>
          <Pill tone={source.status === "Verified" ? "green" : "amber"}>
            {source.status}
          </Pill>
          <ExternalLink className="h-3.5 w-3.5 text-white/25" />
        </div>
      ))}
    </div>
  );
}
function QualityPanel() {
  return (
    <div className="space-y-3 p-6">
      {[
        { label: "Hook arrives within first 30 seconds", ok: true },
        { label: "No unsupported factual claims", ok: true },
        { label: "Narration and captions are synchronized", ok: true },
        { label: "Thumbnail readable at mobile size", ok: true },
        { label: "One source note needs operator confirmation", ok: false },
      ].map(check => (
        <div
          key={check.label}
          className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-black/10 p-4"
        >
          <div
            className={`flex h-6 w-6 items-center justify-center rounded-full ${check.ok ? "bg-[#73d9a8]/15 text-[#9aeac5]" : "bg-[#e3af62]/15 text-[#f2cb92]"}`}
          >
            {check.ok ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <CircleAlert className="h-3.5 w-3.5" />
            )}
          </div>
          <span className="text-xs text-white/62">{check.label}</span>
        </div>
      ))}
    </div>
  );
}
function ClipboardIcon(props: React.ComponentProps<typeof ClipboardCheck>) {
  return <ClipboardCheck {...props} />;
}
function CalendarIcon(props: React.ComponentProps<typeof CalendarDays>) {
  return <CalendarDays {...props} />;
}

export default function Home() {
  const [location, setLocation] = useLocation();
  const [confirmation, setConfirmation] = useState<
    "publish" | "comment" | null
  >(null);
  const [toast, setToast] = useState<string | null>(null);
  const view = navByPath[location] ?? "overview";
  const go = (next: View) =>
    setLocation(next === "overview" ? "/" : `/${next}`);
  const confirmAction = () => {
    setConfirmation(null);
    setToast(
      confirmation === "publish"
        ? "Approval recorded. Scheduling remains ready for your final confirmation."
        : "Reply approved. Posting remains locked until final confirmation."
    );
    window.setTimeout(() => setToast(null), 4200);
  };
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#0b0d12]">
        <WorkspaceHeader
          view={view}
          onCreate={() => {
            setToast("New production brief opened in the content pipeline.");
            window.setTimeout(() => setToast(null), 3200);
          }}
        />
        {view === "overview" && <Overview go={go} />}
        {view === "strategy" && <Strategy />}
        {view === "pipeline" && <Pipeline />}
        {view === "review" && <ReviewStudio onConfirm={setConfirmation} />}
        {view === "calendar" && <Calendar />}
        {view === "analytics" && <Analytics />}
        {view === "engagement" && <Engagement onConfirm={setConfirmation} />}
        {view === "settings" && <Settings />}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 flex max-w-sm items-start gap-3 rounded-2xl border border-[#73d9a8]/20 bg-[#141a19] px-4 py-3 shadow-2xl">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#9aeac5]" />
            <p className="text-xs leading-5 text-white/75">{toast}</p>
            <button
              onClick={() => setToast(null)}
              className="text-white/25 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
        {confirmation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#171a22] p-6 shadow-2xl">
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ff5a5f]/12 text-[#ff9ca1]">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <button
                  onClick={() => setConfirmation(null)}
                  className="text-white/30 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#ff969a]">
                Final operator confirmation
              </p>
              <h3 className="mt-2 text-xl font-semibold tracking-tight text-white">
                {confirmation === "publish"
                  ? "Confirm this video action"
                  : "Confirm this reply action"}
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/45">
                {confirmation === "publish"
                  ? "You are approving the exact content version, channel, privacy state, and proposed schedule. The external action will remain auditable."
                  : "You are approving this edited reply for the selected channel. Posting will be recorded in the audit log."}
              </p>
              <div className="mt-5 space-y-2 rounded-xl border border-white/[0.07] bg-black/15 p-4">
                <div className="flex justify-between text-xs">
                  <span className="text-white/35">Channel</span>
                  <span className="text-white/72">
                    {confirmation === "publish"
                      ? "Northstar / Main"
                      : "Northstar / Main"}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/35">Action</span>
                  <span className="text-white/72">
                    {confirmation === "publish"
                      ? "Schedule as unlisted"
                      : "Post approved reply"}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/35">Safety gate</span>
                  <span className="text-[#9aeac5]">
                    Human approval required
                  </span>
                </div>
              </div>
              <div className="mt-6 flex gap-2">
                <Button
                  onClick={() => setConfirmation(null)}
                  className="h-10 flex-1 rounded-xl bg-white/[0.07] text-xs text-white/65 hover:bg-white/[0.12]"
                >
                  Go back
                </Button>
                <Button
                  onClick={confirmAction}
                  className="h-10 flex-1 rounded-xl bg-[#ff5a5f] text-xs font-semibold text-white hover:bg-[#ff7378]"
                >
                  Confirm action
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
