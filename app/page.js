import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  MessageCircle,
  BrainCircuit,
  BellRing,
  Users,
  Building2,
  Search,
  ArrowRight,
  Check,
  Sparkles,
} from "lucide-react";

export const metadata = {
  title: "PropertyFlow CRM — WhatsApp CRM for Indian Real Estate",
  description:
    "Never forget a client, requirement, or follow-up. WhatsApp-native CRM for brokers and agents in India.",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-lg text-primary-foreground shadow-[var(--shadow-glow)]" style={{ background: "var(--gradient-primary)" }}>
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <div className="font-display text-lg font-bold">PropertyFlow</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Realtor CRM</div>
            </div>
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#pricing" className="hover:text-foreground">Pricing</a>
            <a href="#flow" className="hover:text-foreground">How it works</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/auth"><Button variant="ghost" size="sm">Sign in</Button></Link>
            <Link href="/auth"><Button size="sm" className="shadow-[var(--shadow-glow)]">Get started</Button></Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10 opacity-90"
          style={{ background: "var(--gradient-hero)" }}
        />
        <div
          className="absolute inset-0 -z-10 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 10%, oklch(0.62 0.13 165 / 0.4), transparent 40%), radial-gradient(circle at 80% 90%, oklch(0.4 0.1 200 / 0.4), transparent 50%)",
          }}
        />

        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-24 md:py-32 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div className="text-sidebar-foreground">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs backdrop-blur">
              <span className="grid h-1.5 w-1.5 place-items-center rounded-full bg-primary" />
              Built for Indian real estate agents
            </div>
            <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
              The WhatsApp CRM<br />
              <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                that remembers everything
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-sidebar-foreground/70">
              Every client. Every requirement. Every follow-up. PropertyFlow turns chaotic WhatsApp chats into a structured pipeline — with AI that matches buyers to your listings automatically.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/auth">
                <Button size="lg" className="h-12 px-6 shadow-[var(--shadow-glow)]">
                  Start free <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <a href="#features">
                <Button size="lg" variant="outline" className="h-12 border-white/20 bg-white/5 px-6 text-sidebar-foreground hover:bg-white/10 hover:text-sidebar-foreground">
                  See features
                </Button>
              </a>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-xs text-sidebar-foreground/60">
              <span className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-primary" /> 14-day free trial</span>
              <span className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-primary" /> WhatsApp Business API</span>
              <span className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-primary" /> AI requirement extraction</span>
            </div>
          </div>

          {/* Mock WhatsApp inbox card */}
          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-primary/20 blur-3xl" />
            <div className="relative rounded-2xl border border-white/10 bg-card/95 p-2 shadow-2xl backdrop-blur-xl">
              <div className="grid grid-cols-[1fr_1.4fr] gap-2 rounded-xl bg-muted/60 p-2">
                <div className="rounded-lg bg-card p-3">
                  <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                    <MessageCircle className="h-3.5 w-3.5" /> Inbox
                  </div>
                  {[
                    { n: "Rajesh K.", m: "10 cent plot Kakkanad?", u: 2, hot: true },
                    { n: "Priya M.", m: "3BHK villa under 80L", u: 0, hot: false },
                    { n: "Anil S.", m: "Selling 5 cent at...", u: 1, hot: false },
                    { n: "Meera R.", m: "Rental needed Edappally", u: 0, hot: true },
                  ].map((c, i) => (
                    <div key={i} className={`flex items-center gap-2 rounded-md p-2 text-xs ${i === 0 ? "bg-accent" : ""}`}>
                      <div className="grid h-7 w-7 place-items-center rounded-full bg-primary/15 text-[10px] font-semibold text-primary">
                        {c.n.split(" ").map((s) => s[0]).join("")}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <span className="truncate font-medium">{c.n}</span>
                          {c.hot && <span className="rounded bg-destructive/15 px-1 text-[9px] font-bold text-destructive">HOT</span>}
                        </div>
                        <div className="truncate text-muted-foreground">{c.m}</div>
                      </div>
                      {c.u > 0 && <span className="grid h-4 w-4 place-items-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">{c.u}</span>}
                    </div>
                  ))}
                </div>
                <div className="rounded-lg bg-card p-3">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="grid h-8 w-8 place-items-center rounded-full bg-primary/15 text-xs font-semibold text-primary">RK</div>
                      <div>
                        <div className="text-xs font-semibold">Rajesh Kumar</div>
                        <div className="text-[10px] text-success">● online</div>
                      </div>
                    </div>
                    <BrainCircuit className="h-4 w-4 text-primary" />
                  </div>
                  <div className="space-y-2 text-[11px]">
                    <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-chat-incoming p-2 shadow-sm">
                      Looking for 10 cent plot near Kakkanad, budget around 45 lakh
                    </div>
                    <div className="ml-auto max-w-[80%] rounded-2xl rounded-tr-sm bg-chat-outgoing p-2 shadow-sm">
                      Got it Rajesh, I have 3 matching plots — sending now 🏡
                    </div>
                    <div className="rounded-lg border border-primary/30 bg-primary/5 p-2">
                      <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold text-primary">
                        <Sparkles className="h-3 w-3" /> AI extracted
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-[10px] text-foreground/80">
                        <div>📍 Kakkanad</div>
                        <div>💰 ₹45L</div>
                        <div>📐 10 cent</div>
                        <div>🏷 Plot</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border/40 bg-muted/30">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 sm:grid-cols-4">
          {[
            ["3,200+", "Agents using daily"],
            ["1.2M", "WhatsApp messages synced"],
            ["48%", "Faster deal closure"],
            ["₹420Cr", "Deals tracked"],
          ].map(([n, l]) => (
            <div key={l}>
              <div className="font-display text-3xl font-bold tracking-tight">{n}</div>
              <div className="text-sm text-muted-foreground">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-xs font-semibold uppercase tracking-widest text-primary">Features</div>
          <h2 className="mt-2 font-display text-4xl font-bold tracking-tight md:text-5xl">
            Built for the way Indian agents actually work
          </h2>
          <p className="mt-4 text-muted-foreground">
            WhatsApp-first. AI-augmented. No data entry penalty.
          </p>
        </div>

        <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[
            { i: MessageCircle, t: "WhatsApp inbox", d: "Sync your WhatsApp Business chats. Reply, broadcast, send templates — all from one dashboard." },
            { i: BrainCircuit, t: "AI requirement extraction", d: "Auto-pulls budget, location, land size and property type from every chat. Zero typing." },
            { i: Users, t: "Smart client profiles", d: "Buyer, seller, investor, rental — categorized and tagged with full conversation history." },
            { i: Building2, t: "Property matching", d: "AI matches your listings to buyer requirements and suggests the next 3 leads to call." },
            { i: BellRing, t: "Never miss a follow-up", d: '"You forgot to follow up with Rajesh about the Kakkanad plot." Smart, timely nudges.' },
            { i: Search, t: "Natural language search", d: '"Buyers under 50 lakh in Kochi" or "villas in Kakkanad" — just type, get results.' },
          ].map(({ i: Icon, t, d }) => (
            <div key={t} className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]">
              <div className="mb-4 grid h-10 w-10 place-items-center rounded-lg bg-accent text-accent-foreground transition group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-semibold">{t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="flow" className="border-t border-border/40 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-xs font-semibold uppercase tracking-widest text-primary">How it works</div>
            <h2 className="mt-2 font-display text-4xl font-bold tracking-tight">From WhatsApp ping to closed deal</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-4">
            {[
              ["01", "Client pings on WhatsApp", "Their message lands in your unified inbox."],
              ["02", "AI extracts the requirement", "Budget, location, type — auto-saved."],
              ["03", "Matched to your listings", "We surface the 3 best-fit properties."],
              ["04", "Reminders close the loop", "Follow-up nudges until the deal is done."],
            ].map(([n, t, d]) => (
              <div key={n} className="rounded-xl border border-border bg-card p-6">
                <div className="font-display text-3xl font-bold text-primary">{n}</div>
                <div className="mt-3 font-display text-base font-semibold">{t}</div>
                <p className="mt-1 text-sm text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-7xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-xs font-semibold uppercase tracking-widest text-primary">Pricing</div>
          <h2 className="mt-2 font-display text-4xl font-bold tracking-tight">Simple plans. India-ready prices.</h2>
        </div>
        <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">
          {[
            { n: "Starter", p: "₹0", s: "/mo", d: "For solo agents getting organized.", f: ["100 clients", "Manual chat logging", "Reminders", "Basic search"] },
            { n: "Pro", p: "₹1,499", s: "/mo", d: "WhatsApp + AI for serious brokers.", f: ["Unlimited clients", "WhatsApp Business API", "AI requirement extraction", "Smart property matching", "Bulk broadcasts"], hi: true },
            { n: "Agency", p: "₹4,999", s: "/mo", d: "Multi-agent teams & analytics.", f: ["Everything in Pro", "5 team members", "Lead analytics", "Admin dashboard", "API access"] },
          ].map((tier) => (
            <div key={tier.n} className={`relative rounded-2xl border bg-card p-8 ${tier.hi ? "border-primary shadow-[var(--shadow-glow)]" : "border-border"}`}>
              {tier.hi && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary-foreground">
                  Most popular
                </div>
              )}
              <div className="font-display text-lg font-semibold">{tier.n}</div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-display text-4xl font-bold">{tier.p}</span>
                <span className="text-sm text-muted-foreground">{tier.s}</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{tier.d}</p>
              <ul className="mt-6 space-y-2.5 text-sm">
                {tier.f.map((line) => (
                  <li key={line} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
              <Link href="/auth" className="mt-8 block">
                <Button className="w-full" variant={tier.hi ? "default" : "outline"}>
                  Start with {tier.n}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div
          className="overflow-hidden rounded-3xl px-10 py-16 text-center text-sidebar-foreground"
          style={{ background: "var(--gradient-hero)" }}
        >
          <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            Stop losing leads in WhatsApp chaos.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sidebar-foreground/70">
            Join thousands of Indian real estate agents who close faster with PropertyFlow.
          </p>
          <Link href="/auth">
            <Button size="lg" className="mt-8 h-12 px-8 shadow-[var(--shadow-glow)]">
              Get started free <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-border/40 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 text-xs text-muted-foreground md:flex-row">
          <span>© {new Date().getFullYear()} PropertyFlow CRM. Made for Indian brokers.</span>
          <span>Built with ❤ in Kerala</span>
        </div>
      </footer>
    </div>
  );
}
