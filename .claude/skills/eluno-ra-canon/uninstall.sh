#!/usr/bin/env bash
#
# uninstall.sh — Desinstala el skill eluno-ra-canon a nivel user.
# El skill por-proyecto en el repo NO se toca; este script solo
# remueve los symlinks que install.sh creó.
#
set -euo pipefail

SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
USER_SKILL_LINK="$HOME/.claude/skills/eluno-ra-canon"

echo "Desinstalando eluno-ra-canon a nivel user..."

if [[ -L "$USER_SKILL_LINK" ]]; then
  rm "$USER_SKILL_LINK"
  echo "✓ Symlink user-level removido: $USER_SKILL_LINK"
else
  echo "  (no había symlink user-level que remover)"
fi

# El symlink interno corpus/ se deja en su lugar — no estorba si el skill
# sigue en el repo. Si quieres también removerlo:
#   rm "$SKILL_DIR/corpus"

echo ""
echo "Desinstalación completa. El skill por-proyecto en"
echo "  $SKILL_DIR"
echo "sigue intacto. Si querés removerlo también, usa git rm."
