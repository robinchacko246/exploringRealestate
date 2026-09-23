"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
// createClient used for brand fetching (same pattern as PublicHeader which works)
import { createClient } from "@supabase/supabase-js";
// supabase used for auth operations
import { supabase } from "@/integrations/supabase/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { getCachedSettings, setCachedSettings } from "@/lib/brand-cache";

// Separate client instance for reading admin_settings (proven to work in PublicHeader)
const supabasePublic = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

const BRAND_DEFAULTS = {
  name:      "PropertyFlow",
  color:     "#009688",
  tagline:   "Kerala's #1 Property Platform",
  copyright: `© ${new Date().getFullYear()} PropertyFlow CRM`,
};

export default function AuthPage() {
  const router = useRouter();
  const [loading, setLoading]   = useState(false);
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [name, setName]         = useState("");

  // Brand — initialized synchronously from cache to eliminate flash of default text
  const [brand, setBrand] = useState(() => {
    const cached = getCachedSettings();
    return {
      name:      cached?.brand_name       || BRAND_DEFAULTS.name,
      color:     cached?.brand_color      || BRAND_DEFAULTS.color,
      tagline:   cached?.brand_tagline    || BRAND_DEFAULTS.tagline,
      copyright: cached?.footer_copyright || BRAND_DEFAULTS.copyright,
    };
  });

  useEffect(() => {
    // Fetch brand using the same direct createClient pattern as PublicHeader
    supabasePublic
      .from("admin_settings")
      .select("key, value")
      .then(({ data, error }) => {
        if (error) {
          console.warn("[auth/brand]", error.message);
          return;
        }
        if (!data) return;
        const map = {};
        data.forEach((r) => { map[r.key] = r.value; });
        setCachedSettings(map);
        setBrand({
          name:      map.brand_name       || BRAND_DEFAULTS.name,
          color:     map.brand_color      || BRAND_DEFAULTS.color,
          tagline:   map.brand_tagline    || BRAND_DEFAULTS.tagline,
          copyright: map.footer_copyright || BRAND_DEFAULTS.copyright,
        });
      });

    // Auth state listener — redirect to /app if already signed in
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === "SIGNED_IN" || event === "INITIAL_SESSION" || event === "TOKEN_REFRESHED")) {
        router.replace("/app");
      }
    });

    // Check for OAuth error parameters in URL
    if (typeof window !== "undefined") {
      const hash   = window.location.hash;
      const search = window.location.search;
      if (hash.includes("error") || search.includes("error")) {
        const params    = new URLSearchParams(hash.replace("#", "?") || search);
        const errorDesc = params.get("error_description") || params.get("error");
        if (errorDesc) toast.error(`Authentication failed: ${decodeURIComponent(errorDesc)}`);
      }
    }

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace("/app");
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error(error.message);
        setLoading(false);
      } else {
        toast.success("Welcome back!");
        router.replace("/app");
      }
    } catch (err) {
      toast.error(err?.message || "Sign in failed");
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/app`,
          data: { full_name: name },
        },
      });
      if (error) return toast.error(error.message);
      toast.success("Account created! Check your email to verify.");
    } catch (err) {
      toast.error(err?.message || "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/app` },
      });
      if (error) {
        toast.error(error.message || "Google sign-in failed. Please verify Google OAuth is enabled in Supabase.");
      }
    } catch (err) {
      toast.error(err?.message || "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* ── Left brand panel ────────────────────────────────────────────── */}
      <div
        className="relative hidden flex-col justify-between p-12 text-white lg:flex"
        style={{
          background: `linear-gradient(135deg, ${brand.color}ee 0%, ${brand.color}99 60%, #0a0a1a 100%)`,
        }}
      >
        {/* Logo */}
        <Link href="/listings" className="flex items-center gap-2">
          <div
            className="grid h-9 w-9 place-items-center rounded-lg"
            style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
          >
            <svg width="20" height="20" viewBox="0 0 34 34" fill="none">
              <path d="M7 17L17 8L27 17" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="12" y="17" width="10" height="9" rx="1" fill="white" />
              <rect x="15" y="20" width="4" height="6" rx="0.5" fill={brand.color} />
            </svg>
          </div>
          <div className="leading-tight">
            <div className="text-lg font-bold">{brand.name}</div>
            <div className="text-[10px] uppercase tracking-widest text-white/60">Realtor CRM</div>
          </div>
        </Link>

        {/* Testimonial */}
        <div className="space-y-6">
          <h2 className="text-4xl font-bold leading-tight">
            &ldquo;I stopped losing leads in WhatsApp the day I switched to {brand.name}.&rdquo;
          </h2>
          <div className="flex items-center gap-3">
            <div
              className="grid h-10 w-10 place-items-center rounded-full font-semibold text-sm"
              style={{ backgroundColor: "rgba(255,255,255,0.25)" }}
            >
              AJ
            </div>
            <div>
              <div className="font-medium">Anand Jose</div>
              <div className="text-xs text-white/60">Broker, Kochi</div>
            </div>
          </div>
        </div>

        {/* Footer copyright */}
        <div className="text-xs text-white/40">{brand.copyright}</div>
      </div>

      {/* ── Right form ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <Link href="/listings" className="mb-8 flex items-center gap-2 lg:hidden">
            <div
              className="grid h-8 w-8 place-items-center rounded-lg"
              style={{ backgroundColor: brand.color }}
            >
              <svg width="16" height="16" viewBox="0 0 34 34" fill="none">
                <path d="M7 17L17 8L27 17" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="12" y="17" width="10" height="9" rx="1" fill="white" />
                <rect x="15" y="20" width="4" height="6" rx="0.5" fill={brand.color} />
              </svg>
            </div>
            <span className="font-bold" style={{ color: brand.color }}>{brand.name}</span>
          </Link>

          <h1 className="text-3xl font-bold tracking-tight">Welcome</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in or create your {brand.name} agent account.</p>

          <Button
            variant="outline"
            className="mt-6 w-full"
            onClick={handleGoogle}
            disabled={loading}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09a6.6 6.6 0 0 1 0-4.18V7.07H2.18a11 11 0 0 0 0 9.86l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
            </svg>
            Continue with Google
          </Button>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
          </div>

          <Tabs defaultValue="signin">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Sign up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="mt-4">
              <form onSubmit={handleSignIn} className="space-y-3">
                <div>
                  <Label htmlFor="email-in">Email</Label>
                  <Input id="email-in" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="pwd-in">Password</Label>
                  <Input id="pwd-in" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full text-white"
                  style={{ backgroundColor: brand.color }}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-4">
              <form onSubmit={handleSignUp} className="space-y-3">
                <div>
                  <Label htmlFor="name-up">Full name</Label>
                  <Input id="name-up" required value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="email-up">Email</Label>
                  <Input id="email-up" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="pwd-up">Password</Label>
                  <Input id="pwd-up" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full text-white"
                  style={{ backgroundColor: brand.color }}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
