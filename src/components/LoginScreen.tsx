import { useState } from "react";

export interface LoginScreenProps {
  onLogin: (email: string, password: string) => void;
  busy: boolean;
  error: string;
}

export default function LoginScreen({ onLogin, busy, error }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onLogin(email, password);
  }

  return (
    <main className="login-screen">
      <section className="login-card">
        <div className="login-badge">Accès sécurisé</div>
        <h1 className="login-title">Connexion au tableau LEST</h1>
        <p className="login-subtitle">
          Connectez-vous avec votre compte Supabase pour accéder au suivi en temps réel.
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vous@entreprise.tn"
            required
            autoComplete="email"
          />

          <label htmlFor="password">Mot de passe</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Votre mot de passe"
            required
            autoComplete="current-password"
          />

          {error ? <p className="login-error">{error}</p> : null}

          <button type="submit" className="login-btn" disabled={busy}>
            {busy ? "Connexion en cours..." : "Se connecter"}
          </button>
        </form>
      </section>
    </main>
  );
}
