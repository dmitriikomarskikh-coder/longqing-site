import type {Metadata} from "next";
import {notFound, redirect} from "next/navigation";
import {OutreachDashboard} from "@/components/private/OutreachDashboard";
import {privateEnabled} from "@/lib/private/config";
import {hasPrivateSession} from "@/lib/private/session";

export const metadata: Metadata = {
  title: "Private outreach | LONGQING",
  robots: {index: false, follow: false, nocache: true, googleBot: {index: false, follow: false, noimageindex: true}}
};

export default async function PrivateOutreachPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  if (locale !== "en") {
    notFound();
  }
  if (!privateEnabled() || !(await hasPrivateSession())) {
    redirect("/en/private/auth");
  }
  return (
    <main className="min-h-screen bg-slate-50 px-5 pb-20 pt-32 text-slate-950">
      <OutreachDashboard />
    </main>
  );
}
