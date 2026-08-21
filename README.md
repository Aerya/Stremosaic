<h1 align="center">
  Stremosaic
</h1>

<h1 align="center">
  /!\ WiP /!\
</h1>

<p align="center">
  <strong>Stremosaic est un addon de catalogues Stremio multi-sources, basé sur l'architecture de TMDB Discover+. Il permet de créer des catalogues personnalisés et de réunir plusieurs sources dans une seule configuration.</strong>
</p>


<p align="center">
  <img src="https://github.com/Aerya/Stremosaic/actions/workflows/docker-publish.yml/badge.svg?branch=main" alt="Build Docker">
  <img src="https://img.shields.io/badge/Docker-ready-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker">
  <img src="https://img.shields.io/badge/multi--arch-amd64%20%7C%20arm64-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Multi-arch">
  <img src="https://img.shields.io/badge/interface-fran%C3%A7aise-blue?style=flat-square" alt="Interface française">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Stremio-addon-purple?style=flat-square" alt="Stremio">
  <img src="https://img.shields.io/badge/TMDB-source-01B4E4?style=flat-square" alt="TMDB">
  <img src="https://img.shields.io/badge/AniList-source-02A9FF?style=flat-square" alt="AniList">
  <img src="https://img.shields.io/badge/MyAnimeList-source-2E51A2?style=flat-square" alt="MyAnimeList">
  <img src="https://img.shields.io/badge/Kitsu%20%7C%20Simkl-sources-orange?style=flat-square" alt="Kitsu et Simkl">
  <img src="https://img.shields.io/badge/Bingebase%20%7C%20MDBList-listes-green?style=flat-square" alt="Bingebase et MDBList">
</p>


## Sources

- **TMDB** : filtres avancés, genres, dates, notes, langues, pays, providers, personnes, studios, mots-clés…
- **AniList / MAL / Kitsu** : catalogues anime.
- **Simkl** : catalogues et tendances.
- **Bingebase** : connexion de compte par device-code et import de listes publiques Bingebase.
- **MDBList** : import de listes publiques MDBList par URL, sans stocker de clé API MDBList.
- Les IDs IMDb restent utilisés pour l'interopérabilité Stremio et l'enrichissement, mais IMDb n'est pas utilisé comme source de catalogues.

## WebUI

Interface en français.

La WebUI est protégée par l'authentification déjà présente dans la base TMDB Discover+ : une clé API TMDB valide ouvre une session JWT et les configurations associées restent privées. Les secrets sont chiffrés côté serveur.

## Marketplace

Le Marketplace est amorcé localement avec des catalogues prêts à l’emploi TMDB, MDBList, AniList, MAL, Kitsu et Simkl, puis enrichi par les catalogues publics des utilisateurs. Bingebase est également pris en charge : ses catalogues apparaissent lorsqu’un utilisateur publie une liste publique.

Il inclut notamment les classements streaming JustWatch publiés par MDBList et des catalogues TMDB par diffuseur et par région. Pour la France, des catalogues Films et Séries sont fournis pour Netflix, Canal+, Disney+, Prime Video et Apple TV+. L’éditeur permet aussi de choisir une autre région et les diffuseurs réellement disponibles dans cette région d’après TMDB.

## MDBList

Une URL publique de la forme `https://mdblist.com/lists/utilisateur/liste` peut être utilisée comme source de catalogue Films ou Séries. Deux classements officiels MDBList/JustWatch sont fournis dans le Marketplace. Les requêtes sortantes sont limitées à `https://mdblist.com` et les titres sont résolus vers TMDB afin de produire des métadonnées compatibles Stremio.

## Bingebase

La connexion utilise le flux device-code Bingebase (`/activate`). Une liste publique peut ensuite être ajoutée comme catalogue depuis son URL. La récupération automatique des listes publiques d'un profil est prévue dans l'API Stremosaic ; les listes privées dépendent des endpoints exposés par Bingebase.

## Sécurité

- La WebUI et les opérations de modification exigent un JWT obtenu après validation d’une clé API TMDB. Chaque lecture ou modification de configuration vérifie que la session possède bien cette configuration.
- Les clés et jetons persistés sont chiffrés en AES-256-GCM avec `ENCRYPTION_KEY`. `JWT_SECRET` et `ENCRYPTION_KEY` sont obligatoires et validés au démarrage ; ils doivent être uniques, aléatoires et ne jamais être committés.
- Le Marketplace ne publie qu’une projection explicitement filtrée des catalogues. Les champs secrets et les valeurs chiffrées sont exclus et contrôlés avant écriture.
- Les URLs Bingebase et MDBList sont validées sur une origine HTTPS précise avant toute requête sortante. Une URL arbitraire, une IP locale ou un autre domaine n’est pas accepté.
- Le serveur limite la taille des corps JSON, applique des limites de requêtes globales et renforcées sur l’authentification et les mutations, et envoie des en-têtes CSP, HSTS sous HTTPS, anti-framing et anti-MIME-sniffing.
- `CORS_ORIGIN=*` est le réglage Docker par défaut pour faciliter l’installation, sans cookies inter-origines par défaut. Pour une instance publique, définissez `CORS_ORIGIN` sur l’origine exacte de la WebUI et placez Stremosaic derrière HTTPS.
- Les routes Stremio de manifeste, métadonnées et catalogues ainsi que la lecture du Marketplace sont publiques par conception : Stremio doit pouvoir les consulter. Utilisez des identifiants de configuration non devinables et ne publiez dans le Marketplace que les catalogues destinés à être partagés.
- PostgreSQL et Redis ne publient aucun port hôte dans le Compose fourni. Ne les exposez pas directement à Internet et maintenez régulièrement les images et dépendances à jour.

Les détails de déploiement et de signalement sont disponibles dans [`docs/SECURITY.md`](docs/SECURITY.md) et [`docs/environment.md`](docs/environment.md).

## Origine

Stremosaic dérive de **TMDB Discover+** (`semi-column/tmdb-discover-plus`), distribué sous licence MIT. Les mentions de licence et copyrights d'origine sont conservées.
