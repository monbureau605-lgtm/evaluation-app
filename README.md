# AI Studio applet

Application Next.js pour recueillir des évaluations de produits, gérer des campagnes et consulter des statistiques.

## Hébergement : GitHub, Netlify et Supabase

### 1. Préparer Supabase

1. Créez un projet Supabase.
2. Dans l'éditeur SQL, exécutez [`supabase/schema.sql`](supabase/schema.sql).
3. Dans **Project Settings → API Keys**, récupérez l'URL du projet et la clé secrète (`sb_secret_...`).
4. Ne mettez jamais cette clé dans une variable `NEXT_PUBLIC_*` ni dans le dépôt Git.

L'application initialise le document avec les campagnes et produits d'exemple à la première requête. Les données sont stockées dans une ligne JSONB privée de `app_state`.

### 2. Publier le code sur GitHub

Poussez ce dépôt vers GitHub. Vérifiez que `.env.local`, les fichiers `.env` et `data/store.json` ne sont pas suivis par Git. Les données locales existantes ne sont pas importées automatiquement dans Supabase.

### 3. Déployer sur Netlify

1. Importez le dépôt GitHub dans Netlify.
2. Gardez la commande de build `npm run build` et le paramètre de publication par défaut détecté pour Next.js.
3. Dans **Site configuration → Environment variables**, ajoutez :
   - `SUPABASE_URL`
   - `SUPABASE_SECRET_KEY`
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
   - `ADMIN_SESSION_SECRET` (une valeur aléatoire d'au moins 32 octets)
   - `GEMINI_API_KEY` (facultative ; la traduction de secours reste disponible)
4. Redéployez après avoir défini les variables.

Pour générer un secret de session localement : `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`.

## Développement local

Copiez `.env.example` vers `.env.local`, renseignez les variables, puis exécutez :

```sh
npm ci
npm run dev
```

La table Supabase doit être créée avant le premier lancement. N'utilisez pas de vraies données personnelles pour les premiers essais.

## Limites à connaître

- La connexion administrateur est vérifiée côté serveur et ses routes privées exigent un cookie signé `HttpOnly`.
- Les offres gratuites de Netlify et Supabase ont des quotas susceptibles d'évoluer ; un projet Supabase gratuit peut être mis en pause après une période d'inactivité.
- Le stockage actuel regroupe l'état applicatif dans un seul document JSONB. Cela convient à un premier déploiement à faible trafic, mais un usage soutenu ou concurrent devrait migrer vers des tables relationnelles et des opérations transactionnelles.
- Les invitations sont enregistrées et exportables ; cette application ne configure pas de fournisseur d'envoi d'e-mails.
- Les données de `data/store.json` sur un poste local ne sont pas envoyées au déploiement. Vérifiez et importez explicitement uniquement les données que vous souhaitez conserver.
