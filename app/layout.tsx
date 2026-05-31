import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/nav";
import { AuthProvider } from "@/components/auth-provider";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "CommercialSigma — Ontario Commercial Real Estate Data",
  description: "The most transparent commercial real estate platform in Ontario. Search sold prices, cap rates, NOI, and market analytics for office, retail, industrial, and multifamily properties.",
  keywords: "commercial real estate, cap rate, NOI, Ontario, Toronto, industrial, office, retail, multifamily",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-slate-50">
        <AuthProvider>
          <Nav />
          <main className="flex-1">{children}</main>
          <footer className="bg-slate-900 text-slate-400 py-10 mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                <div>
                  <div className="text-white font-bold text-lg mb-3">CommercialSigma</div>
                  <p className="text-sm leading-relaxed">Ontario&apos;s most transparent commercial real estate data platform. No brokers needed.</p>
                </div>
                <div>
                  <div className="text-white font-semibold mb-3">Property Types</div>
                  <ul className="space-y-1 text-sm">
                    <li>Industrial</li><li>Office</li><li>Retail</li><li>Multifamily</li><li>Mixed-Use</li>
                  </ul>
                </div>
                <div>
                  <div className="text-white font-semibold mb-3">Markets</div>
                  <ul className="space-y-1 text-sm">
                    <li>Toronto</li><li>Mississauga</li><li>Hamilton</li><li>Ottawa</li><li>Vaughan / Markham</li>
                  </ul>
                </div>
                <div>
                  <div className="text-white font-semibold mb-3">Platform</div>
                  <ul className="space-y-1 text-sm">
                    <li>Market Analytics</li><li>Saved Searches</li><li>Price Alerts</li><li>Investment Calculator</li>
                  </ul>
                </div>
              </div>
              <div className="border-t border-slate-700 pt-6 text-sm text-center">
                © 2026 CommercialSigma. Data sourced from public records, land registry, and market participants.
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
