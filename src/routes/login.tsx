import { useEffect } from "react";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { supabase } from "../lib/supabase/client";
import LoginScreen from "../components/LoginScreen";
import { useSupabaseAuth } from "../hooks/useSupabaseAuth";

/**
 * Route de connexion (chemin: /login).
 *
 * Par opposition à la route index, cette route redirige les utilisateurs
 * authentifiés vers le tableau de bord.
 *
 * `pendingComponent` affiche un écran de chargement pendant la vérification de session.
 */
export const Route = createFileRoute("/login")({
  beforeLoad: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) throw redirect({ to: "/" });
  },
  pendingComponent: () => (
    <main className="loading-screen">Vérification de la session...</main>
  ),
  component: LoginPage,
});

/**
 * Composant de page de connexion.
 *
 * Utilise le hook useSupabaseAuth pour gérer l'authentification.
 * Redirige automatiquement vers le tableau de bord une fois la session établie.
 */
function LoginPage() {
  const { session, login, authBusy, authError } = useSupabaseAuth();
  const navigate = useNavigate();

  // Redirect to dashboard once the session is established (post-login).
  useEffect(() => {
    if (session) void navigate({ to: "/" });
  }, [session, navigate]);

  return <LoginScreen onLogin={login} busy={authBusy} error={authError} />;
}
