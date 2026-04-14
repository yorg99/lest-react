import React, { useState } from "react";
import { LockKeyhole, Mail } from "lucide-react";
import { supabase } from "../lib/supabase";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";

export default function AuthPanel() {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setNotice("");
    setBusy(true);

    try {
      if (mode === "signin") {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        setNotice("Connexion réussie.");
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;

        const waitingForEmail = !!data.user && !data.session;
        setNotice(
          waitingForEmail
            ? "Compte créé. Vérifiez votre e-mail pour confirmer l'inscription."
            : "Compte créé et session ouverte."
        );
      }
    } catch (err) {
      setError(err.message || "Erreur d'authentification.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 py-6">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3">
          <Badge variant="outline" className="w-fit">
            🔒 Accès sécurisé
          </Badge>
          <CardTitle className="text-xl">Connexion au tableau LEST</CardTitle>
          <CardDescription>
            Authentifiez-vous avec Supabase pour accéder au suivi en temps réel.
          </CardDescription>

          <Tabs value={mode} onValueChange={setMode}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Se connecter</TabsTrigger>
              <TabsTrigger value="signup">Créer un compte</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>

        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <Label htmlFor="auth-email">E-mail</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="vous@entreprise.tn"
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="auth-password">Mot de passe</Label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="auth-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Au moins 6 caractères"
                  className="pl-9"
                />
              </div>
            </div>

            {error ? <p className="text-xs text-destructive">{error}</p> : null}
            {notice ? <p className="text-xs text-muted-foreground">{notice}</p> : null}

            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Veuillez patienter..." : mode === "signin" ? "Se connecter" : "Créer le compte"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
