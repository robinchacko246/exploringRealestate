import Link from "next/link";

export default function AgentsCRMLandingPage() {
  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative" style={{ minHeight: "65vh" }}>
        {/* Hero background */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/crm-hero-bg.png')" }}
        />
        {/* Gradient overlay — teal-tinted for CRM page */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(0,60,55,0.88) 0%, rgba(0,80,72,0.70) 50%, rgba(0,100,90,0.30) 100%)",
          }}
        />

        <div className="relative max-w-[1280px] mx-auto px-6 md:px-8 py-16 md:py-24">
          <div className="grid md:grid-cols-[1fr_420px] gap-12 items-center">

            {/* Left: headline */}
            <div className="text-white">
              <div className="inline-flex items-center gap-2 bg-[#009688]/30 border border-[#4DB6AC]/40 rounded-full px-4 py-1.5 text-[12.5px] font-semibold text-[#80CBC4] mb-5 tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4DB6AC] animate-pulse" />
                REALTOR CRM · INDIA
              </div>

              <h1 className="font-serif text-4xl md:text-5xl lg:text-[58px] font-semibold leading-[1.08] tracking-tight mb-5">
                Stop Losing Deals<br />
                <span className="text-[#4DB6AC]">in WhatsApp.</span>
              </h1>

              <p className="text-[15.5px] text-white/75 leading-relaxed max-w-md mb-8">
                PropertyFlow captures your clients, requirements, and follow-ups from WhatsApp — automatically. Built for Indian real estate agents who close deals, not manage spreadsheets.
              </p>

              {/* Key benefits */}
              <div className="flex flex-col gap-2.5 mb-8">
                {[
                  "Zero manual data entry — AI extracts everything",
                  "Never forget a follow-up with smart reminders",
                  "Match buyers to listings in seconds",
                ].map((b) => (
                  <div key={b} className="flex items-center gap-3 text-[14px] text-white/85">
                    <span className="w-5 h-5 rounded-full bg-[#009688] flex items-center justify-center text-white text-[11px] font-bold shrink-0">✓</span>
                    {b}
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/auth"
                  className="bg-[#009688] hover:bg-[#00796B] text-white text-[15px] font-semibold px-7 py-3.5 rounded-lg transition-colors inline-flex items-center gap-2"
                >
                  Start Free — 14 Days
                  <span>→</span>
                </Link>
                <a
                  href="#how"
                  className="border border-white/40 text-white text-[14px] font-medium px-5 py-3.5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  See How It Works
                </a>
              </div>

              <p className="mt-4 text-[12.5px] text-white/50">
                14-day free trial · No credit card · Cancel anytime
              </p>
            </div>

            {/* Right: CRM inbox preview */}
            <div className="hidden md:block">
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Mock header */}
                <div className="bg-[#009688] px-4 py-3 flex items-center justify-between">
                  <span className="text-white text-[13px] font-semibold">Client Inbox</span>
                  <span className="bg-white/20 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">4 new</span>
                </div>

                {/* Client rows */}
                {[
                  { initials: "RK", name: "Rajesh Kumar",  msg: "10 cent plot near Kakkanad?",       time: "9:14 am",   unread: 2,  hot: true  },
                  { initials: "PM", name: "Priya Menon",   msg: "3BHK villa under 80L — urgent",     time: "8:51 am",   unread: 0,  hot: false },
                  { initials: "AS", name: "Anil Suresh",   msg: "Selling 5 cent at Edappally",       time: "Yesterday", unread: 1,  hot: false },
                  { initials: "MR", name: "Meera Rajan",   msg: "Rental flat needed near Vyttila",   time: "Yesterday", unread: 0,  hot: true  },
                ].map((c, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 px-4 py-3.5 border-b border-[#F0F0F0] ${i === 0 ? "bg-[#E0F2F1]/30" : "bg-white"}`}
                  >
                    <div
                      className="h-9 w-9 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0"
                      style={{ backgroundColor: i === 0 ? "#009688" : "#E0F2F1", color: i === 0 ? "white" : "#009688" }}
                    >
                      {c.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[13.5px] font-semibold text-[#212121]">{c.name}</span>
                        {c.hot && (
                          <span className="text-[9px] font-bold uppercase tracking-wide bg-[#FF5252]/15 text-[#D32F2F] px-1.5 py-0.5 rounded-full">
                            HOT
                          </span>
                        )}
                      </div>
                      <p className="text-[12px] text-[#9E9E9E] truncate">{c.msg}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-[11px] text-[#BDBDBD]">{c.time}</span>
                      {c.unread > 0 && (
                        <span className="h-4 w-4 rounded-full bg-[#009688] text-white text-[10px] font-bold flex items-center justify-center">
                          {c.unread}
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {/* AI extracted card */}
                <div className="p-4 bg-[#F5FFFE]">
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className="w-4 h-4 rounded-full bg-[#009688] flex items-center justify-center">
                      <span className="text-white text-[9px] font-bold">AI</span>
                    </div>
                    <p className="text-[11px] font-semibold text-[#009688] uppercase tracking-wider">AI Extracted · Rajesh Kumar</p>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {[["Location", "Kakkanad"], ["Budget", "₹45 L"], ["Land", "10 cents"], ["Type", "Plot"]].map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between border border-[#E0F2F1] rounded-lg px-2.5 py-1.5 bg-white">
                        <span className="text-[11px] text-[#9E9E9E]">{k}</span>
                        <span className="text-[12px] font-semibold text-[#009688]">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ─────────────────────────────────────────────── */}
      <div className="bg-[#009688]">
        <div className="max-w-[1280px] mx-auto px-6 md:px-8 py-7">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-white text-center">
            {[
              ["3,200+", "Agents Using Daily"],
              ["1.2M",   "WhatsApp Messages Synced"],
              ["48%",    "Faster Deal Closure"],
              ["₹420 Cr","Deals Tracked"],
            ].map(([num, label]) => (
              <div key={label}>
                <p className="text-[28px] md:text-[32px] font-bold leading-none mb-1">{num}</p>
                <p className="text-[12.5px] text-white/70">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── WHY PROPERTYFLOW ────────────────────────────────────────── */}
      <section className="bg-[#F5F7FA] py-16 md:py-20">
        <div className="max-w-[1280px] mx-auto px-6 md:px-8">
          <div className="text-center mb-12">
            <span className="inline-block bg-[#E0F2F1] text-[#009688] text-[11px] font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
              Why PropertyFlow
            </span>
            <h2 className="font-serif text-3xl md:text-4xl text-[#212121] tracking-tight">
              Built for the way Indian agents work
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" fill="currentColor"/>
                    <path d="M12 0C5.374 0 0 5.373 0 12c0 2.12.554 4.107 1.523 5.832L.057 23.854l6.188-1.453A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22.008a9.99 9.99 0 0 1-5.117-1.404l-.366-.218-3.793.893.929-3.68-.24-.378A9.959 9.959 0 0 1 2.004 12C2.004 6.474 6.475 2.004 12 2.004S21.996 6.474 21.996 12C21.996 17.525 17.525 21.996 12 22.008z" fill="currentColor"/>
                  </svg>
                ),
                color: "#25D366",
                bg: "#E8F5E9",
                title: "WhatsApp Native",
                desc: "Your clients are already on WhatsApp. PropertyFlow works right where your business lives — no new apps to learn.",
              },
              {
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 6v2M12 16v2M6 12h2M16 12h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                ),
                color: "#1565C0",
                bg: "#E3F2FD",
                title: "AI Requirement Extraction",
                desc: "Budget, location, land size, property type — all captured automatically from every message. Zero manual typing.",
              },
              {
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M3 9h18" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M8 4V2M16 4V2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M7 14h2M11 14h2M15 14h2M7 17h2M11 17h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                ),
                color: "#6A1B9A",
                bg: "#F3E5F5",
                title: "Smart Follow-up Reminders",
                desc: "Never let a deal go cold. Timed nudges tell you exactly who to call today — before leads forget you.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: item.bg, color: item.color }}
                >
                  {item.icon}
                </div>
                <h3 className="text-[16px] font-bold text-[#212121] mb-2">{item.title}</h3>
                <p className="text-[13.5px] text-[#757575] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────── */}
      <section id="features" className="py-16 md:py-20 bg-white">
        <div className="max-w-[1280px] mx-auto px-6 md:px-8">
          <div className="text-center mb-12">
            <span className="inline-block bg-[#E0F2F1] text-[#009688] text-[11px] font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
              All Features
            </span>
            <h2 className="font-serif text-3xl md:text-4xl text-[#212121] tracking-tight">
              Everything you need to close more deals
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                color: "#009688", bg: "#E0F2F1",
                emoji: "💬",
                title: "WhatsApp Inbox",
                desc: "All client conversations in one organized view. No more scrolling through threads.",
              },
              {
                color: "#1565C0", bg: "#E3F2FD",
                emoji: "🤖",
                title: "AI Extraction",
                desc: "Budget, location, property type — captured automatically. Zero manual data entry.",
              },
              {
                color: "#6A1B9A", bg: "#F3E5F5",
                emoji: "👥",
                title: "Client Profiles",
                desc: "Buyer, seller, investor, rental — categorized with full history and requirements.",
              },
              {
                color: "#E65100", bg: "#FFF8E1",
                emoji: "🏠",
                title: "Property Matching",
                desc: "AI surfaces the 3 best-fit listings for every buyer. Share the right properties, fast.",
              },
              {
                color: "#1B5E20", bg: "#E8F5E9",
                emoji: "🔔",
                title: "Follow-up Nudges",
                desc: "Smart reminders every morning. Who to call, what to say, why it matters.",
              },
              {
                color: "#1A237E", bg: "#E8EAF6",
                emoji: "🔍",
                title: "Natural Search",
                desc: "\"Buyers under 50L in Kochi\" — search the way you think, get instant results.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="group border border-[#EEEEEE] bg-white rounded-xl p-5 hover:border-[#009688]/30 hover:shadow-[0_4px_20px_rgba(0,150,136,0.1)] transition-all"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-[22px] mb-4"
                  style={{ backgroundColor: f.bg }}
                >
                  {f.emoji}
                </div>
                <h3 className="text-[15px] font-bold text-[#212121] mb-1.5 group-hover:text-[#009688] transition-colors">
                  {f.title}
                </h3>
                <p className="text-[13.5px] text-[#757575] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────── */}
      <section id="how" className="py-16 md:py-20 bg-[#F5F7FA]">
        <div className="max-w-[1280px] mx-auto px-6 md:px-8">
          <div className="text-center mb-12">
            <span className="inline-block bg-[#E0F2F1] text-[#009688] text-[11px] font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
              Simple Process
            </span>
            <h2 className="font-serif text-3xl md:text-4xl text-[#212121] tracking-tight">
              From WhatsApp ping to closed deal
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-6 relative">
            {/* Connector line on desktop */}
            <div className="hidden md:block absolute top-8 left-[15%] right-[15%] h-0.5 bg-[#E0F2F1] z-0" />

            {[
              { n: "01", icon: "📱", title: "Client Pings You",      desc: "A buyer messages you on WhatsApp about a property." },
              { n: "02", icon: "🤖", title: "AI Extracts Details",   desc: "Budget, location, type — auto-captured. Nothing missed." },
              { n: "03", icon: "🏠", title: "Matched to Listings",   desc: "Best-fit properties surface instantly for that buyer." },
              { n: "04", icon: "🔔", title: "Reminders Close Deals", desc: "Follow-up nudges keep the deal alive until it closes." },
            ].map((step, i) => (
              <div key={step.n} className="relative z-10 text-center">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-[28px] mx-auto mb-4 shadow-sm"
                  style={{ backgroundColor: i === 0 ? "#009688" : "white", border: "3px solid #E0F2F1" }}
                >
                  <span>{step.icon}</span>
                </div>
                <p className="text-[12px] font-bold text-[#009688] uppercase tracking-widest mb-1">{step.n}</p>
                <h3 className="text-[15px] font-bold text-[#212121] mb-2">{step.title}</h3>
                <p className="text-[13px] text-[#757575] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────────────── */}
      <section id="pricing" className="py-16 md:py-20 bg-white">
        <div className="max-w-[1280px] mx-auto px-6 md:px-8">
          <div className="text-center mb-12">
            <span className="inline-block bg-[#E0F2F1] text-[#009688] text-[11px] font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
              Pricing
            </span>
            <h2 className="font-serif text-3xl md:text-4xl text-[#212121] tracking-tight">
              Simple plans. India-ready prices.
            </h2>
            <p className="text-[15px] text-[#757575] mt-3">No hidden fees. Cancel anytime.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Free plan */}
            <div className="border-2 border-[#EEEEEE] rounded-2xl p-7 hover:border-[#009688]/30 transition-colors">
              <div className="mb-5">
                <p className="text-[12px] font-semibold uppercase tracking-widest text-[#9E9E9E] mb-1">Starter Realtor</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-[40px] font-bold text-[#212121] leading-none">Free</span>
                </div>
                <p className="text-[13px] text-[#9E9E9E] mt-1">14-day trial · No card needed</p>
              </div>
              <ul className="space-y-3 mb-7">
                {[
                  "14-Day Free Trial Access",
                  "Up to 10 Clients",
                  "Up to 10 Property Listings",
                  "1 Image per Property",
                  "Property Matching Engine",
                  "WhatsApp Contact Links",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-[13.5px] text-[#424242]">
                    <span className="w-5 h-5 rounded-full bg-[#E0F2F1] text-[#009688] flex items-center justify-center text-[11px] font-bold shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth"
                className="block text-center border-2 border-[#009688] text-[#009688] text-[14px] font-semibold py-3 rounded-xl hover:bg-[#009688] hover:text-white transition-colors"
              >
                Get Started Free
              </Link>
            </div>

            {/* Pro plan */}
            <div className="border-2 border-[#009688] rounded-2xl p-7 relative shadow-[0_8px_32px_rgba(0,150,136,0.15)]">
              {/* Most popular badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-[#009688] text-white text-[11px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full">
                  Most Popular
                </span>
              </div>
              <div className="mb-5 mt-2">
                <p className="text-[12px] font-semibold uppercase tracking-widest text-[#009688] mb-1">Pro Realtor</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-[40px] font-bold text-[#212121] leading-none">₹499</span>
                  <span className="text-[14px] text-[#9E9E9E]">/ month</span>
                </div>
                <p className="text-[13px] text-[#9E9E9E] mt-1">Billed monthly · Cancel anytime</p>
              </div>
              <ul className="space-y-3 mb-7">
                {[
                  "Up to 50 Clients",
                  "Up to 60 Property Listings",
                  "Up to 2 Images per Property",
                  "AI Requirement Matcher",
                  "Priority Customer Support",
                  "Advanced Analytics Dashboard",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-[13.5px] text-[#424242]">
                    <span className="w-5 h-5 rounded-full bg-[#009688] text-white flex items-center justify-center text-[11px] font-bold shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth"
                className="block text-center bg-[#009688] text-white text-[14px] font-semibold py-3 rounded-xl hover:bg-[#00796B] transition-colors"
              >
                Upgrade to Pro →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIAL / TRUST STRIP ────────────────────────────────── */}
      <div className="bg-[#F5F7FA] border-t border-[#EEEEEE] py-10">
        <div className="max-w-[1280px] mx-auto px-6 md:px-8">
          <p className="text-center text-[13px] font-semibold uppercase tracking-widest text-[#9E9E9E] mb-8">
            Trusted by real estate professionals across Kerala
          </p>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                name: "Rajan K.",
                role: "Senior Broker, Ernakulam",
                quote: "PropertyFlow changed how I work. I used to lose leads in WhatsApp every week. Now every client is tracked and I get reminded exactly when to follow up.",
              },
              {
                name: "Priya S.",
                role: "Property Consultant, Thrissur",
                quote: "The AI extraction is magical. A client messages their requirements and it's all captured instantly. I close 40% more deals now than last year.",
              },
              {
                name: "Anil M.",
                role: "Real Estate Agent, Kozhikode",
                quote: "Simple, fast, and actually works. I recommended it to 5 other agents in my office. Everyone switched within a month.",
              },
            ].map((t) => (
              <div key={t.name} className="bg-white rounded-xl p-5 shadow-sm border border-[#EEEEEE]">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} width="14" height="14" viewBox="0 0 20 20" fill="#FFA000">
                      <path d="M10 1l2.39 4.84L18 6.58l-4 3.9.94 5.52L10 13.27l-4.94 2.73L6 10.48 2 6.58l5.61-.74z" />
                    </svg>
                  ))}
                </div>
                <p className="text-[13.5px] text-[#616161] leading-relaxed mb-4 italic">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#E0F2F1] flex items-center justify-center text-[#009688] font-bold text-[12px]">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-[#212121]">{t.name}</p>
                    <p className="text-[11.5px] text-[#9E9E9E]">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA SECTION ──────────────────────────────────────────────── */}
      <div className="bg-[#009688]">
        <div className="max-w-[1280px] mx-auto px-6 md:px-8 py-14 flex flex-col md:flex-row items-center justify-between gap-7">
          <div className="text-white text-center md:text-left">
            <h3 className="font-serif text-2xl md:text-3xl font-semibold mb-2">
              Stop losing leads in WhatsApp chaos.
            </h3>
            <p className="text-[15px] text-white/75">
              Join 3,200+ Indian agents who close faster with PropertyFlow.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <Link
              href="/auth"
              className="bg-white text-[#009688] text-[14px] font-bold px-7 py-3.5 rounded-xl hover:bg-[#E0F2F1] transition-colors whitespace-nowrap"
            >
              Start Free — 14 Days →
            </Link>
            <Link
              href="/listings"
              className="border border-white/40 text-white text-[14px] font-medium px-5 py-3.5 rounded-xl hover:bg-white/10 transition-colors whitespace-nowrap"
            >
              View Property Listings
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
