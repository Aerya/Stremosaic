# STREMOSAIC — PASSE FINALE DE TRADUCTION FRANÇAISE

Modèle recommandé : Claude Sonnet 4.6

## Objectif

Faire une passe exhaustive de traduction de la WebUI Stremosaic afin qu'un utilisateur francophone ne voie pratiquement plus de texte anglais.

La mission est principalement LA TRADUCTION. Ne pas réécrire l'application.

## Règle absolue

NE JAMAIS traduire les identifiants techniques :

- variables
- fonctions
- hooks
- composants React
- imports / exports
- noms de fichiers
- propriétés JSON
- clés API
- enums techniques
- valeurs attendues par les APIs

Exemple correct :
`label: "Popular"` → `label: "Populaires"`

Exemples interdits :
`getWatchProviders` → `getFournisseursDeStreaming`
`SettingsModal` → `ParamètresModal`
`sortBy` → `trierPar`

Aucun search/replace global dangereux.

## Audit exhaustif

Scanner récursivement :

- client/src/**/*.js
- client/src/**/*.jsx
- client/src/**/*.ts
- client/src/**/*.tsx

Inspecter aussi les chaînes générées hors JSX :

- client/src/sources/
- client/src/hooks/
- client/src/utils/
- définitions de filtres
- options
- labels dynamiques
- tooltips
- placeholders
- erreurs
- toasts
- badges / chips
- résumés de filtres

Fichiers particulièrement importants :

- client/src/sources/anilist.source.js
- client/src/sources/imdb.source.js
- client/src/sources/kitsu.source.js
- client/src/sources/mal.source.js
- client/src/sources/simkl.source.js
- client/src/sources/trakt.source.js
- client/src/sources/traktCapabilities.js
- client/src/sources/bingebase.source.js
- client/src/hooks/useActiveFilters.js

Cette liste n'est pas exhaustive.

## Chaînes encore à rechercher/traduire

Exemples :

- Sort:
- Genres:
- Exclude:
- Status:
- Season:
- Country:
- Source:
- Studios:
- Adult content
- Randomized
- Discover only
- Rating:
- Runtime:
- Min votes:
- First air year:
- Release year:
- Timezone:
- streaming service(s)
- In Theatres
- Awards won
- Awards nominated
- IMDb People
- IMDb Studios
- Ranked Lists
- Explicit
- Filmed in
- Must have
- Trending
- List:
- Period:
- Best:
- Categories:
- Something went wrong
- Loading...
- No results
- No catalogs found
- Clear selection
- Disabled
- Drag to reorder
- Released Only
- Today
- Recalculates daily

Traduire uniquement si ces chaînes sont visibles par l'utilisateur.

## Ajouts rapides Films / Séries

Films :
- Trending Today → Tendances du jour
- Trending This Week → Tendances de la semaine
- Now Playing → Actuellement au cinéma
- Upcoming → Prochainement
- Top Rated → Les mieux notés
- Popular → Populaires

Séries :
- Trending Today → Tendances du jour
- Trending This Week → Tendances de la semaine
- Airing Today → Diffusées aujourd'hui
- On The Air → En cours de diffusion
- Top Rated → Les mieux notées
- Popular → Populaires

Le nom du catalogue créé doit lui aussi être en français.

## Éditeur de catalogue

Tout traduire :
- titres
- boutons
- filtres
- accordéons
- labels
- placeholders
- sélecteurs
- messages
- tooltips
- résumés de filtres
- états vides

Exemples :
- Sort By → Trier par
- Original Language → Langue originale
- Country → Pays
- Year Range → Période
- Rating → Note
- Runtime → Durée
- Minimum Votes → Nombre minimum de votes
- Where To Watch → Où regarder
- Preview → Aperçu
- Preview Posters → Aperçu des affiches
- Released Only → Sortis uniquement
- Today → Aujourd'hui
- Recalculates daily → Recalculé quotidiennement
- Clear selection → Effacer la sélection
- Disabled → Désactivé
- Drag to reorder → Glisser pour réorganiser

## Sources

Faire la même passe pour :
- TMDB
- AniList
- MyAnimeList
- Kitsu
- Simkl
- Trakt
- Bingebase
- IMDb si encore visible

Ne pas traduire les noms officiels :
TMDB, IMDb, AniList, MyAnimeList, Kitsu, Simkl, Trakt, Bingebase,
Netflix, Canal+, Disney+, Prime Video, Apple TV+, Paramount+, Crunchyroll, MUBI.

## Ne pas casser les corrections existantes

Le dépôt fourni contient déjà des corrections pour :
- Streaming FR
- Netflix / Canal+ / Disney+ etc.
- Anime ID map
- Marketplace
- branding Stremosaic
- Docker / GHCR

Ne pas les supprimer ou les réécrire sans raison réelle.

## Contrôle final obligatoire

Après traduction :

1. Rechercher récursivement toutes les chaînes anglaises restantes.
2. Inspecter manuellement chaque résultat potentiellement visible.
3. Les faux positifs techniques peuvent rester.
4. Aucune chaîne UI anglaise ne doit rester sans justification.

## Build obligatoire

Dans `client/` :

```bash
npm ci
npm run build
```

Le build doit réussir avant livraison.

Lancer aussi les tests frontend pertinents si disponibles.

## Livraison

Ne rien pousser sur GitHub.

Retourner :
1. le dépôt complet corrigé en ZIP nommé `Stremosaic-FR-FINAL.zip`
2. un fichier `TRANSLATION-REPORT.md`

Le rapport doit contenir :
- nombre de fichiers modifiés
- principales zones traduites
- chaînes anglaises volontairement conservées et pourquoi
- résultat exact de `npm run build`
- résultat des tests
- limites restantes éventuelles
