# Polynésie — app Next.js

Sert les pages HTML statiques de la racine du projet (copiées dans `public/` par `npm run sync`,
relancé automatiquement à chaque `dev`/`build`) et expose `/api/reservations` pour sauvegarder
les liens de réservation des hôtels dans Vercel Postgres.

## Lancer en local

```bash
npm --prefix web run dev
```

## Brancher la base (Vercel Postgres)

1. Sur vercel.com : créer le projet (root directory : `web/`), puis Storage → Create Database → Postgres (Neon).
2. Lier la base au projet — Vercel injecte `POSTGRES_URL` automatiquement en production.
3. En local : copier la variable dans `web/.env.local` :

   ```
   POSTGRES_URL="postgres://..."
   ```

   (ou `vercel env pull web/.env.local` si la CLI Vercel est installée)

La table `reservations` est créée automatiquement au premier appel de l'API.
Sans `POSTGRES_URL`, l'API répond 503 et les pages retombent sur la sauvegarde locale (localStorage).
