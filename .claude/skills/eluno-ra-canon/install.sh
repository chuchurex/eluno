#!/usr/bin/env bash
#
# install.sh — Instalación user-level del skill eluno-ra-canon
#
# Asume que este script está dentro del skill en su ubicación de proyecto:
#   <repo-eluno>/.claude/skills/eluno-ra-canon/install.sh
#
# Acciones:
#   1. Crea el symlink interno corpus/ → ../../../writing/sources/ra (relativo al skill)
#   2. Crea el symlink user-level ~/.claude/skills/eluno-ra-canon/ → este skill
#   3. Verifica que todo resuelve correctamente
#
# Uso:
#   bash <skill-dir>/install.sh
#
# Idempotente: se puede correr múltiples veces sin efectos adversos.
#
set -euo pipefail

# Detectar la ubicación absoluta del skill (donde está este script)
SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_NAME="eluno-ra-canon"
USER_SKILLS_DIR="$HOME/.claude/skills"
USER_SKILL_LINK="$USER_SKILLS_DIR/$SKILL_NAME"

echo "──────────────────────────────────────────────────────"
echo " eluno-ra-canon — instalación user-level"
echo "──────────────────────────────────────────────────────"
echo ""
echo "Skill detectado en: $SKILL_DIR"
echo ""

# ── Paso 1: validar que el skill está en un repo eluno ─────
REPO_ROOT="$(cd "$SKILL_DIR/../../.." && pwd)"
if [[ ! -d "$REPO_ROOT/writing/sources/ra/sessions" ]]; then
  echo "✗ ERROR: el corpus Ra no existe en $REPO_ROOT/writing/sources/ra/sessions"
  echo "  Este skill espera estar dentro del repo eluno con el corpus ya generado."
  echo "  Genera el corpus primero (chunk_ra_epub.py) y reintenta."
  exit 1
fi
SESSIONS_COUNT=$(find "$REPO_ROOT/writing/sources/ra/sessions" -name "session-*.md" | wc -l | tr -d ' ')
echo "✓ Corpus Ra encontrado en repo: $SESSIONS_COUNT sesiones."

# ── Paso 2: symlink interno corpus/ (Ra) ───────────────────
CORPUS_LINK="$SKILL_DIR/corpus"
if [[ -e "$CORPUS_LINK" || -L "$CORPUS_LINK" ]]; then
  if [[ -L "$CORPUS_LINK" ]]; then
    rm "$CORPUS_LINK"
    echo "  (limpiado symlink corpus/ previo)"
  else
    echo "✗ ERROR: $CORPUS_LINK existe y NO es un symlink. Mové ese archivo/directorio antes de continuar."
    exit 1
  fi
fi
ln -s "../../../writing/sources/ra" "$CORPUS_LINK"
echo "✓ Symlink interno creado: corpus/ → ../../../writing/sources/ra"

# ── Paso 2.5: symlink interno corpus-quo/ (Q'uo capa 1) ────
CORPUS_QUO_LINK="$SKILL_DIR/corpus-quo"
if [[ -d "$REPO_ROOT/writing/sources/quo/sessions" ]]; then
  if [[ -e "$CORPUS_QUO_LINK" || -L "$CORPUS_QUO_LINK" ]]; then
    if [[ -L "$CORPUS_QUO_LINK" ]]; then
      rm "$CORPUS_QUO_LINK"
    else
      echo "✗ ERROR: $CORPUS_QUO_LINK existe y NO es un symlink."
      exit 1
    fi
  fi
  ln -s "../../../writing/sources/quo" "$CORPUS_QUO_LINK"
  QUO_COUNT=$(find "$REPO_ROOT/writing/sources/quo/sessions" -name "quo-*.md" | wc -l | tr -d ' ')
  echo "✓ Symlink corpus-quo/ creado (capa 1: $QUO_COUNT sesiones Q'uo)"
else
  echo "  (corpus Q'uo no presente — saltando symlink corpus-quo/)"
fi

# ── Paso 3: symlink user-level ─────────────────────────────
mkdir -p "$USER_SKILLS_DIR"

if [[ -e "$USER_SKILL_LINK" || -L "$USER_SKILL_LINK" ]]; then
  if [[ -L "$USER_SKILL_LINK" ]]; then
    rm "$USER_SKILL_LINK"
    echo "  (limpiado symlink user-level previo)"
  else
    echo "✗ ERROR: $USER_SKILL_LINK existe y NO es un symlink."
    echo "  Eso significa que ya tienes una copia separada del skill ahí."
    echo "  Mové o borrá esa copia primero, luego reintenta este script."
    exit 1
  fi
fi
ln -s "$SKILL_DIR" "$USER_SKILL_LINK"
echo "✓ Symlink user-level creado: $USER_SKILL_LINK → $SKILL_DIR"

# ── Paso 4: hacer ejecutables los scripts ──────────────────
chmod +x "$SKILL_DIR"/scripts/*.mjs 2>/dev/null || true
echo "✓ Scripts del skill marcados como ejecutables."

# ── Paso 5: verificación ───────────────────────────────────
echo ""
echo "──────────────────────────────────────────────────────"
echo " Verificación"
echo "──────────────────────────────────────────────────────"

# El corpus debe ser accesible desde el skill
SAMPLE_SESSION="$SKILL_DIR/corpus/sessions/session-027.md"
if [[ -f "$SAMPLE_SESSION" ]]; then
  echo "✓ corpus accesible desde el skill (session 27 encontrada)."
else
  echo "✗ ERROR: corpus NO accesible (session 27 no se encuentra)."
  exit 1
fi

# El skill debe ser accesible desde user-level
if [[ -f "$USER_SKILL_LINK/SKILL.md" ]]; then
  echo "✓ skill accesible vía $USER_SKILL_LINK/SKILL.md"
else
  echo "✗ ERROR: skill NO accesible vía user-level."
  exit 1
fi

# El validador debe ejecutar
if command -v node >/dev/null 2>&1; then
  echo ""
  echo "Probando el validador con un capítulo del repo..."
  TEST_CHAPTER="$REPO_ROOT/i18n/en/chapters/13.json"
  if [[ -f "$TEST_CHAPTER" ]]; then
    if node "$SKILL_DIR/scripts/validate-chapter.mjs" "$TEST_CHAPTER" --json > /dev/null 2>&1; then
      echo "✓ validador ejecuta correctamente."
    else
      echo "⚠️  validador retornó error (puede ser normal si el capítulo tiene warnings)."
    fi
  fi
else
  echo "⚠️  node no detectado en PATH. El validador no se podrá ejecutar."
fi

echo ""
echo "──────────────────────────────────────────────────────"
echo " ✅ Instalación completada"
echo "──────────────────────────────────────────────────────"
echo ""
echo "El skill está disponible:"
echo "  • Por proyecto:  $SKILL_DIR"
echo "  • User-level:    $USER_SKILL_LINK"
echo ""
echo "Para usarlo:"
echo "  • Claude Code:   abrí una sesión y pedile que use 'eluno-ra-canon'."
echo "  • Cowork:        debería detectarlo automáticamente al arrancar una sesión."
echo ""
echo "Para desinstalar: bash $SKILL_DIR/uninstall.sh"
echo ""
