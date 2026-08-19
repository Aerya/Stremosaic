#!/usr/bin/env bash
set -euo pipefail

OWNER="Aerya"
REPO="Stremosaic"
FULL="$OWNER/$REPO"
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"

command -v gh >/dev/null 2>&1 || { echo "Erreur: gh est introuvable. Rien ne sera installé."; exit 1; }
gh auth status >/dev/null 2>&1 || { echo "Erreur: gh n'est pas authentifié."; exit 1; }

SRC=""
if [[ -f "$SCRIPT_DIR/Stremosaic/package.json" ]]; then
  SRC="$SCRIPT_DIR/Stremosaic"
elif [[ -f "$SCRIPT_DIR/package.json" && -f "$SCRIPT_DIR/Dockerfile.docker" ]]; then
  SRC="$SCRIPT_DIR"
elif [[ -f "$SCRIPT_DIR/Stremosaic.zip" ]]; then
  WORKDIR="$(mktemp -d)"
  trap 'rm -rf "$WORKDIR"' EXIT
  python3 - "$SCRIPT_DIR/Stremosaic.zip" "$WORKDIR" <<'PY'
import sys, zipfile
with zipfile.ZipFile(sys.argv[1]) as z:
    z.extractall(sys.argv[2])
PY
  SRC="$WORKDIR/Stremosaic"
else
  echo "Erreur: Stremosaic.zip ou dossier Stremosaic introuvable à côté du script."
  exit 1
fi

cd "$SRC"
rm -rf .git

git init -b main
git config user.name "Aerya"
git config user.email "blog@upandclear.org"
git add -A
git commit -m "Initial Stremosaic implementation"

if gh repo view "$FULL" >/dev/null 2>&1; then
  echo "Le dépôt $FULL existe déjà."
else
  echo "Création du dépôt privé $FULL"
  gh repo create "$FULL" --private --description "Multi-source Stremio catalog builder with TMDB, anime sources and Bingebase"
fi

git remote add origin "https://github.com/$FULL.git"
git push -u origin main --force

echo
echo "Repo privé : https://github.com/$FULL"
echo "GHCR       : ghcr.io/aerya/stremosaic:latest"
echo "Build      : linux/amd64 + linux/arm64"
echo
echo "GitHub Actions a été déclenché."

sleep 3
if gh run list --repo "$FULL" --workflow "Docker multi-arch" --limit 1 >/dev/null 2>&1; then
  gh run list --repo "$FULL" --workflow "Docker multi-arch" --limit 1
fi
