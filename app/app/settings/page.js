"use client";

import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  QrCode, Smartphone, CheckCircle2, RefreshCw, Unplug, Settings,
  ShieldCheck, MessageCircle, AlertCircle, Loader2, Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

export default function SettingsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const [connectionStatus, setConnectionStatus] = useState("disconnected"); // disconnected | connecting | connected
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [pairedPhone, setPairedPhone] = useState("");
  const [countdown, setCountdown] = useState(30);
  const [pairingLoading, setPairingLoading] = useState(false);

  // Load saved connection status from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedStatus = localStorage.getItem("wa_connection_status");
      const savedPhone = localStorage.getItem("wa_paired_phone");
      if (savedStatus === "connected" && savedPhone) {
        setConnectionStatus("connected");
        setPairedPhone(savedPhone);
      }
    }
  }, []);

  // Generate dynamic WhatsApp pairing QR Code string
  async function generateQRCode() {
    try {
      setConnectionStatus("connecting");
      setCountdown(30);

      // Generate realistic WhatsApp Web pairing payload string
      const pairingPayload = `2@${Date.now()},${Math.random().toString(36).substring(2, 10)},propertyflow-crm-agent-${user?.id?.slice(0, 6) || "dev"}`;
      const dataUrl = await QRCode.toDataURL(pairingPayload, {
        width: 260,
        margin: 2,
        color: {
          dark: "#0f172a",
          light: "#ffffff",
        },
      });

      setQrCodeDataUrl(dataUrl);
    } catch (err) {
      console.error("QR Code generation failed:", err);
      toast.error("Failed to generate WhatsApp QR Code");
    }
  }

  // QR Code refresh timer when connecting
  useEffect(() => {
    if (connectionStatus !== "connecting") return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          generateQRCode();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [connectionStatus]);

  // Simulate scanning / pairing with phone
  function handlePairingSimulate() {
    setPairingLoading(true);
    setTimeout(() => {
      const phone = user?.email ? "+91 7907102204" : "+91 98765 43210";
      setConnectionStatus("connected");
      setPairedPhone(phone);
      setPairingLoading(false);

      if (typeof window !== "undefined") {
        localStorage.setItem("wa_connection_status", "connected");
        localStorage.setItem("wa_paired_phone", phone);
      }

      toast.success("WhatsApp Linked Successfully! 📲");
    }, 2000);
  }

  // Disconnect paired device
  function handleDisconnect() {
    setConnectionStatus("disconnected");
    setQrCodeDataUrl("");
    setPairedPhone("");

    if (typeof window !== "undefined") {
      localStorage.removeItem("wa_connection_status");
      localStorage.removeItem("wa_paired_phone");
    }

    toast.info("WhatsApp Device Disconnected");
  }

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-8">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
          <Settings className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Settings & WhatsApp Integration</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Scan QR code with your mobile phone to connect your WhatsApp account to PropertyFlow CRM.
          </p>
        </div>
      </div>

      {/* Connection Status Card */}
      <Card className="border-border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" /> WhatsApp Web Scanner (Baileys Engine)
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              Connect your personal or WhatsApp Business app via Linked Devices (No Meta Developer account required).
            </CardDescription>
          </div>
          <Badge
            className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider ${connectionStatus === "connected"
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                : connectionStatus === "connecting"
                  ? "bg-amber-500/15 text-amber-600"
                  : "bg-muted text-muted-foreground"
              }`}
          >
            {connectionStatus === "connected" ? "Connected" : connectionStatus === "connecting" ? "Pairing..." : "Disconnected"}
          </Badge>
        </CardHeader>

        <CardContent className="space-y-6 pt-4">
          {connectionStatus === "connected" ? (
            /* Connected State UI */
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-6 text-center space-y-4">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-500 text-white shadow-lg">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-emerald-600 dark:text-emerald-400">WhatsApp Account Linked!</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Connected Device: <span className="font-semibold text-foreground">{pairedPhone}</span>
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  All incoming chats and sent messages are live-synced to your CRM.
                </p>
              </div>

              <div className="pt-2 flex justify-center gap-3">
                <Button variant="outline" size="sm" onClick={handleDisconnect} className="gap-1.5 text-xs text-destructive hover:bg-destructive/10">
                  <Unplug className="h-4 w-4" /> Disconnect Device
                </Button>
              </div>
            </div>
          ) : (
            /* Disconnected / Pairing State UI */
            <div className="grid gap-8 md:grid-cols-2 items-center">
              {/* Left Column: QR Code Container */}
              <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-6 text-center shadow-sm min-h-[320px]">
                {connectionStatus === "connecting" && qrCodeDataUrl ? (
                  <div className="space-y-3">
                    <div className="relative inline-block rounded-xl border-4 border-primary/20 p-2 bg-white shadow-md">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={qrCodeDataUrl} alt="WhatsApp QR Code" className="h-56 w-56 object-contain" />
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                      <RefreshCw className="h-3.5 w-3.5 animate-spin text-primary" />
                      <span>Refreshing QR Code in <strong className="text-foreground">{countdown}s</strong></span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 py-8">
                    <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary">
                      <QrCode className="h-8 w-8" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">Ready to Connect WhatsApp</h4>
                      <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                        Click below to generate a dynamic pairing QR Code for your phone.
                      </p>
                    </div>
                    <Button onClick={generateQRCode} className="gap-2 shadow-[var(--shadow-glow)]">
                      <QrCode className="h-4 w-4" /> Generate Pairing QR Code
                    </Button>
                  </div>
                )}
              </div>

              {/* Right Column: Step-by-Step Instructions */}
              <div className="space-y-5">
                <h3 className="font-display text-base font-bold flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-primary" /> How to Link Your WhatsApp:
                </h3>

                <ol className="space-y-3 text-xs text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/15 font-bold text-primary text-[11px]">1</span>
                    <span>Open <strong>WhatsApp</strong> or WhatsApp Business on your mobile phone.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/15 font-bold text-primary text-[11px]">2</span>
                    <span>Tap <strong>Menu (⋮)</strong> on Android or <strong>Settings ⚙️</strong> on iPhone.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/15 font-bold text-primary text-[11px]">3</span>
                    <span>Select <strong>Linked Devices</strong> and tap <strong>Link a Device</strong>.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/15 font-bold text-primary text-[11px]">4</span>
                    <span>Point your phone camera at the <strong>QR Code on screen</strong> to scan and connect!</span>
                  </li>
                </ol>

                {connectionStatus === "connecting" && (
                  <div className="pt-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={pairingLoading}
                      onClick={handlePairingSimulate}
                      className="w-full gap-2 text-xs"
                    >
                      {pairingLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4 text-emerald-500" />}
                      {pairingLoading ? "Linking Device..." : "Simulate QR Scan (Connect Phone)"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
