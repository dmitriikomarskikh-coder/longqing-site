import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-dark px-5 text-center text-text">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">
          404
        </p>
        <h1 className="mt-4 text-5xl font-semibold">Page not found</h1>
        <Link
          href="/en"
          className="btn-primary mt-8 h-12 px-6 text-sm"
        >
          Home
        </Link>
      </section>
    </main>
  );
}
