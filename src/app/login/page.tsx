"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Feather, LockKeyhole, Mail } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Connexion impossible.");
        return;
      }
      router.replace("/");
    } catch {
      setError("Le serveur ne répond pas. Vérifiez qu’il est démarré.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12">
      <section className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl shadow-amber-950/10">
        <div className="mb-7 flex items-center gap-3">
          <span className="rounded-xl bg-amber-700 p-3 text-white">
            <Feather className="h-6 w-6" />
          </span>
          <div>
            <p className="font-serif text-xl font-bold text-slate-100">Plume & Premier Jet</p>
            <p className="text-sm text-slate-500">Votre atelier d’écriture, à l’abri.</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-200">
              Adresse e-mail
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                required
                autoFocus
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-white py-3 pl-10 pr-3 text-[#342c23] outline-none transition placeholder:text-[#81735e] focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20"
              />
            </div>
          </div>
          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-200">
              Mot de passe
            </label>
            <div className="relative">
              <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-white py-3 pl-10 pr-3 text-[#342c23] outline-none transition placeholder:text-[#81735e] focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20"
              />
            </div>
          </div>
          {error && (
            <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-amber-800 px-4 py-3 font-semibold text-white transition hover:bg-amber-900 disabled:cursor-wait disabled:opacity-60"
          >
            {isSubmitting ? "Ouverture de l’atelier…" : "Entrer dans l’atelier"}
          </button>
        </form>
        <p className="mt-6 text-center text-xs leading-5 text-slate-500">
          Accès privé à cette installation. Configurez <code>APP_EMAIL</code>, <code>APP_PASSWORD</code> et{" "}
          <code>AUTH_SECRET</code> dans <code>.env</code>.
        </p>
      </section>
    </main>
  );
}
