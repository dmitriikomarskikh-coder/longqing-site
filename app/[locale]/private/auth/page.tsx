import type {Metadata} from "next";
import {notFound} from "next/navigation";
import {Suspense} from "react";
import {AuthPanel} from "@/components/private/AuthPanel";

export const metadata: Metadata = {
  title: "Закрытый вход | LONGQING",
  robots: {index: false, follow: false, nocache: true, googleBot: {index: false, follow: false, noimageindex: true}}
};

export default async function PrivateAuthPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  if (locale !== "en") {
    notFound();
  }
  return (
    <main className="min-h-screen bg-slate-50 px-5 pb-20 pt-32 text-slate-950">
      <section className="mx-auto max-w-xl">
        <Suspense fallback={<p>Загрузка...</p>}>
          <AuthPanel />
        </Suspense>
      </section>
    </main>
  );
}
