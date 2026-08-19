# Stremosaic

Stremosaic est un addon de catalogues Stremio multi-sources, basé sur l'architecture de TMDB Discover+. Il permet de créer des catalogues personnalisés et de réunir plusieurs sources dans une seule configuration.

## Sources

- **TMDB** : filtres avancés, genres, dates, notes, langues, pays, providers, personnes, studios, mots-clés…
- **AniList / MAL / Kitsu** : catalogues anime.
- **Simkl** : catalogues et tendances.
- **Bingebase** : connexion de compte par device-code et import de listes publiques Bingebase.
- Les IDs IMDb restent utilisés pour l'interopérabilité Stremio et l'enrichissement, mais IMDb n'est pas utilisé comme source de catalogues.

## WebUI

Interface en français, branding Stremosaic, logo/favicon dédiés et footer Aerya (GitHub, Blog, Ko-fi). Le panneau ElfHosted et les anciens liens Discord/Donate ont été retirés.

La WebUI est protégée par l'authentification déjà présente dans la base TMDB Discover+ : une clé API TMDB valide ouvre une session JWT et les configurations associées restent privées. Les secrets sont chiffrés côté serveur.

## Docker

Images multi-architecture : `linux/amd64` et `linux/arm64`.

```yaml
services:
  stremosaic:
    image: ghcr.io/aerya/stremosaic:latest
```

Le `docker-compose.yml` complet du dépôt utilise PostgreSQL + Redis et l'image GHCR `:latest`.

## Marketplace

Le Marketplace est amorcé localement avec des catalogues prêts à l’emploi TMDB, AniList, MAL, Kitsu et Simkl, puis enrichi par les catalogues publics des utilisateurs. Les presets rapides TMDB sont disponibles sans dépendre de Trakt ou d’IMDb.

## Bingebase

La connexion utilise le flux device-code Bingebase (`/activate`). Une liste publique peut ensuite être ajoutée comme catalogue depuis son URL. La récupération automatique des listes publiques d'un profil est prévue dans l'API Stremosaic ; les listes privées dépendent des endpoints exposés par Bingebase.

## Origine

Stremosaic dérive de **TMDB Discover+** (`semi-column/tmdb-discover-plus`), distribué sous licence MIT. Les mentions de licence et copyrights d'origine sont conservées.
