# LEST Dashboard — Étalonnage d'Étuves Thermiques

Application de suivi en temps réel pour l'étalonnage des étuves thermiques, conçue pour le laboratoire LEST (Laboratoire d'Étalonnage et de Surveillance Thermique). Cette application fournit une interface web permettant de visualiser les données de température et d'humidité provenant de capteurs connectés via Supabase.

## 🚀 Démarrage rapide

### Installation

```bash
pnpm install
```

> **Note**: Sur la première installation, pnpm peut afficher des avertissements concernant les scripts de build ignorés. Exécutez `pnpm approve-builds` pour approuver la compilation des bindings natifs.

### Développement

```bash
npm run dev
```

L'application est disponible sur http://localhost:3000

### Vérification

```bash
npm run typecheck && npm run build
```

### Preview de la build

```bash
npm run preview
```

## 🏗️ Architecture

Cette application utilise **TanStack Start** sur **Vite**, avec un rendu SSR (Server-Side Rendering) activé par défaut.

### Structure des dossiers

```
src/
├── components/
│   ├── chart/
│   │   ├── ChartPanel.tsx      # Conteneur à onglets (chart/table/uncert)
│   │   ├── RealtimeChart.tsx   # Graphique temps réel avec Chart.js
│   │   ├── DataTable.tsx       # Tableau des dernières mesures
│   │   └── UncertaintyView.tsx # Affichage des incertitudes
│   ├── Header.tsx              # En-tête avec boutons d'export/déconnexion
│   ├── SensorCard.tsx          # Carte des valeurs de capteur
│   ├── InfoPanel.tsx           # Panel d'informations système
│   ├── SettingsModal.tsx       # Modal de configuration
│   ├── StatusBar.tsx           # Barre d'état en bas
│   ├── LoginScreen.tsx         # Écran de connexion
│   └── ErrorBoundary.tsx       # Gestion des erreurs React
├── hooks/
│   ├── useSupabaseAuth.ts      # Authentification Supabase
│   ├── useLiveData.ts          # Polling des données en temps réel
│   └── useToast.ts             # Système de notifications
├── lib/
│   ├── config.ts               # Constantes de configuration
│   ├── types.ts                # Types TypeScript partagés
│   ├── stats.ts                # Calcul des indicateurs (KPIs)
│   ├── csv.ts                  # Export CSV
│   ├── pt100.ts                # Calcul du filtre PT100
│   └── supabase/
│       ├── client.ts           # Client Supabase initialisé
│       ├── data.ts             # Requêtes Supabase
│       └── format.ts           # Formatage des timestamps
├── routes/
│   ├── __root.tsx              # Shell document (HTML/head/body)
│   ├── index.tsx               # Route dashboard (protégée)
│   └── login.tsx               # Route de connexion
├── App.tsx                     # Composant principal (orchestration)
├── router.tsx                  # Configuration du routeur
└── index.css                   # Styles globaux + CSS variables
```

## 🔐 Authentification

L'authentification utilise `signInWithPassword` de Supabase. Sans session valide, l'utilisateur est redirigé vers `/login`.

### Variables d'environnement

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | URL du projet Supabase |
| `VITE_SUPABASE_ANON_KEY` | Clé publique anonyme Supabase |

Créez un fichier `.env.local` (non versionné) pour surcharger les valeurs par défaut.

## 📊 Sources de données

### Table `public.data` (Supabase)

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | int | Clé de tri (ordre chronologique) |
| `temperature` | float | Température de référence (capteur Siemens) |
| `pt100_temp` | float | Température PT100 (nullable) |
| `humidity` | float | Humidité relative (%) |
| `created_at` | timestamptz | Horodatage de la mesure |

### Polling

- **Charge initiale**: `select(...).order('id', desc).limit(2000)`
- **Polling en temps réel**: `.limit(1)` toutes les 1000ms
- **Seuil en ligne**: L'ESP est considéré "en ligne" si `(now - created_at) < 10s`

## 📈 Indicateurs (KPIs)

Calculés dans `src/lib/stats.ts` à partir des 30 dernières secondes de température:

| Indicateur | Formule | Description |
|------------|---------|-------------|
| `σ` | Écart-type glissant | Stabilité de la mesure |
| `uc` | `√(u_R² + u_E² + u_rép²)` | Incertitude combinée standard |
| `U` | `k × uc` (k=2) | Incertitude élargie à 95% |
| `hom` | `T_max - T_min` | Homogénéité de la température |
| `slope` | Variation sur 30s | Pente (°C/min) extrapolée |

### Composantes d'incertitude

```typescript
UNCERTAINTY = {
  dhtResolution: 0.1,        // Résolution du capteur DHT
  reference: 0.025,          // Étalon de référence COFRAC
  window: 30,                // Fenêtre glissante (secondes)
  k: 2,                      // Facteur d'agrandissement
}
```

## 📁 Export CSV

Le bouton "Export CSV" génère un fichier avec les colonnes:

```
Timestamp,ID,Temperature,PT100,PT100_Filtered,Ecart_T,Humidite
```

- **Timestamp**: Format complet français (jj/mm/aaaa hh:mm:ss)
- **PT100_Filtered**: Moyenne cumulée glissante des valeurs PT100 valides (calculée dans `lib/pt100.ts`)
- **Ecart_T**: Écart par rapport à la cible de température (`temperature - tempTarget`)
- **Nom fichier**: `LEST_2026-06-05T01-06.csv` (granularité minute)

## 🎨 Conventions UI

- **Langue**: L'interface utilise le français avec accents
- **Iconographie**: Emoji (📊, ✅, ⚠️, 🚨) plutôt que lucide icons
- **Polices**: `DM Mono` (monospace) et `Syne` (titres) via Google Fonts
- **Théme**: Variables CSS (`--bg`, `--red`, `--cyan`, etc.)

## 🛠️ Scripts disponibles

| Script | Description |
|--------|-------------|
| `dev` | Démarrage du serveur de développement Vite |
| `build` | Build de production avec Vite + Netlify SSR |
| `preview` | Preview du build de production |
| `typecheck` | Vérification TypeScript (strict mode) |

## 📝 Licence

Projet privé — LEST (Laboratoire d'Étalonnage et de Surveillance Thermique)