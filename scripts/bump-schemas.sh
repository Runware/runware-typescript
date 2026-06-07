#!/usr/bin/env bash
# Pin SCHEMAS_VERSION to the current latest schemas release and regenerate
# task-map.ts. No argument needed — fetches `/releases/latest/schema-map.json`,
# reads its embedded `version` field, and pins that.
#
# Usage:
#   ./scripts/bump-schemas.sh             # bumps + commits
#   ./scripts/bump-schemas.sh --no-commit # bumps + stages, you commit yourself

set -euo pipefail

COMMIT=1
for arg in "$@"; do
  case "$arg" in
    --no-commit) COMMIT=0 ;;
    *) echo "error: unknown flag '$arg'" >&2; exit 2 ;;
  esac
done

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VERSION_FILE="$ROOT/src/_schemas-version.ts"
SCHEMAS_URL="https://schemas.runware.ai/releases/latest/schema-map.json"

if [ ! -f "$VERSION_FILE" ]; then
  echo "error: $VERSION_FILE not found" >&2
  exit 1
fi

echo "Resolving latest from $SCHEMAS_URL …"
VERSION=$(curl -fsSL "$SCHEMAS_URL" | bun -e \
  "const d = await Bun.stdin.json(); if (!d.version || d.version === 'dev') { process.exit(1) } console.log(d.version)" \
  || true)

if [ -z "$VERSION" ]; then
  echo "error: could not read .version from the latest bundle." >&2
  echo "       the schemas service may not yet embed a version field." >&2
  exit 1
fi

CURRENT=$(grep -oE "SCHEMAS_VERSION = '[^']*'" "$VERSION_FILE" | sed "s/SCHEMAS_VERSION = '\(.*\)'/\1/")
if [ "$CURRENT" = "$VERSION" ]; then
  echo "Already pinned to $VERSION — nothing to bump."
  exit 0
fi

echo "Bumping $CURRENT → $VERSION"

# Cross-platform sed -i (BSD/macOS vs GNU): write to a tmp file and move.
TMP="$(mktemp)"
sed "s|export const SCHEMAS_VERSION = .*|export const SCHEMAS_VERSION = '$VERSION'|" \
  "$VERSION_FILE" > "$TMP"
mv "$TMP" "$VERSION_FILE"

cd "$ROOT"
bun run scripts/generate-types.ts

git add src/_schemas-version.ts src/types/task-map.ts

if [ "$COMMIT" -eq 1 ]; then
  git commit -m "chore: bump schemas to $VERSION"
  echo
  echo "Committed: chore: bump schemas to $VERSION"
else
  echo
  echo "Staged (not committed):"
  echo "  src/_schemas-version.ts"
  echo "  src/types/task-map.ts"
  echo
  echo "Next: \`git commit -m 'chore: bump schemas to $VERSION'\`"
fi
