import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/sonner";

export const metadata = {
  title: "PropertyFlow CRM — WhatsApp CRM for Real Estate Agents",
  description:
    "The WhatsApp-native CRM built for Indian real estate agents. Never forget a client, requirement, or follow-up again.",
  openGraph: {
    title: "PropertyFlow CRM — WhatsApp CRM for Real Estate Agents",
    description:
      "The WhatsApp-native CRM built for Indian real estate agents. Never forget a client, requirement, or follow-up again.",
    type: "website",
    images: [
      "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/3524dd91-2b9a-4e14-a6c3-29ee307daaf2/id-preview-3f659211--c01c7889-161c-41d3-9304-32b502a5db28.lovable.app-1779711177785.png",
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PropertyFlow CRM — WhatsApp CRM for Real Estate Agents",
    description:
      "The WhatsApp-native CRM built for Indian real estate agents. Never forget a client, requirement, or follow-up again.",
    images: [
      "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/3524dd91-2b9a-4e14-a6c3-29ee307daaf2/id-preview-3f659211--c01c7889-161c-41d3-9304-32b502a5db28.lovable.app-1779711177785.png",
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  );
}
