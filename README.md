# Sports Streaming Dashboard

Tableau de bord React + Vite pour consulter les matchs live et les chaines TV francaises directement depuis le site.

## Fonctionnalites

- Filtrage des matchs par sport
- Recherche en temps reel
- Lecture des chaines TV FR dans une modale embarquee
- Fallback local si une API externe devient indisponible
- Interface responsive desktop et mobile

## Demarrage Windows

Prerequis : Node.js pour Windows doit etre installe et accessible dans le `PATH`.

```powershell
npm install
npm run dev
```

Le navigateur s'ouvre automatiquement quand le serveur Vite est pret.

Lancement rapide :

```powershell
npm start
```

ou en double-cliquant sur `DEMARRER.bat`.

Build de production :

```powershell
npm run build
```

Diagnostic API :

```powershell
npm run test:api
```

Le rapport est ecrit dans `diagnostics/api_diagnostic.json`.

## Mise En Ligne

Le projet peut etre publie sur GitHub Pages depuis le depot `Madrador60/Sport`.

URL du site :

```text
https://madrador60.github.io/Sport/
```

Le deploiement est automatique a chaque `push` sur la branche `main` via le workflow GitHub Actions.

## Structure du dossier

```text
src/
  components/   UI decoupee par zone et modales
  data/         jeux de donnees de secours
  hooks/        logique React pour charger les donnees
  services/     appels API et transformation des reponses
  utils/        helpers de formatage et URLs
config/
  tsconfig.json configuration TypeScript
  vite.config.ts configuration Vite
index.html      entree du projet
DEMARRER.bat    lance le projet sur Windows
test_api.mjs    verifie les endpoints API et ecrit un rapport local
```

## Sources utilisees

- Matchs : `https://myembed.xyz/api.php?format=json`
- TV FR source 1 : `https://api.cdn-live.tv/api/v1/channels/?user=cdnlivetv&plan=free`
- TV FR source 2 : `https://myembed.xyz/247CHANNELS/canais247SOURCE2.php`
- Player TV embarque : `https://myembed.xyz/247CHANNELS/247embed.php`

Les appels navigateur passent par des proxys CORS integres au front quand c'est necessaire, donc aucune extension navigateur ne devrait etre utile en local.
