import type {Metadata} from "next";
import {notFound, redirect} from "next/navigation";

export const metadata: Metadata = {
  title: "Панель рассылки | LONGQING",
  robots: {index: false, follow: false, nocache: true, googleBot: {index: false, follow: false, noimageindex: true}}
};

export default async function PrivateOutreachPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  if (locale !== "en") {
    notFound();
  }
  redirect("https://mail.dk7world.pro/private/outreach/longqingtrade");
}
