#!/bin/bash
# PROJECT ELYSIUM — publica as alterações no GitHub e confirma que o site voltou ao ar.
#
#   ./publicar.sh "mensagem do commit"
#
# Faz commit de tudo, envia para o GitHub e espera o GitHub Pages republicar,
# verificando de verdade que a página e os scripts do jogo respondem.

set -u
cd "$(dirname "$0")" || exit 1

SITE="https://wc4mp0s.github.io/elysium"
MSG="${1:-Atualização do jogo}"

# ---------- 1. há algo para publicar? ----------
if [ -z "$(git status --porcelain)" ] && git diff --quiet origin/main..HEAD 2>/dev/null; then
  echo "Nada mudou — nada a publicar."
  exit 0
fi

echo "→ Alterações encontradas:"
git status --short
echo ""

# ---------- 2. conferência rápida de integridade ----------
# Todo arquivo .js citado no index.html precisa existir de fato.
faltando=0
while IFS= read -r f; do
  [ -f "$f" ] || { echo "ERRO: index.html carrega '$f', que não existe."; faltando=1; }
done < <(grep -oE 'src="[^"]+\.js"' index.html | sed 's/src="//;s/"//')
[ -f index.html ] || { echo "ERRO: index.html não existe."; faltando=1; }
if [ "$faltando" -ne 0 ]; then
  echo ""
  echo "Publicação cancelada: o jogo está incompleto e quebraria no ar."
  exit 1
fi

# ---------- 3. marcador de versão, commit e envio ----------
# Conferir só o HTTP 200 não basta: o site antigo também responde 200 enquanto o
# Pages reconstrói. Gravamos um marcador ANTES do commit e esperamos ele aparecer.
# (nome sem ponto na frente: o GitHub Pages não serve arquivos ocultos)
MARCA="$(date +%s)"
echo "$MARCA" > versao.txt

git add -A
git commit -q -m "$MSG" || echo "Nada para commitar."
echo "→ Enviando para o GitHub..."
if ! git push -q 2>&1 | sed -E 's/gh[ps]_[A-Za-z0-9]+/[TOKEN OCULTO]/g'; then
  echo "ERRO no push. O site continua na versão anterior."
  exit 1
fi

# ---------- 4. esperar o Pages publicar ESTA versão ----------
echo "→ Aguardando o GitHub Pages publicar esta versão..."
ok=0
for i in 1 2 3 4 5 6 7 8 9 10; do
  viva=$(curl -s "$SITE/versao.txt?v=$RANDOM" | tr -d '[:space:]')
  if [ "$viva" = "$MARCA" ]; then ok=1; break; fi
  printf '   tentativa %s (no ar: %s · esperando: %s)\n' "$i" "${viva:0:12}" "$MARCA"
  perl -e 'select(undef,undef,undef,20)'
done

if [ "$ok" -ne 1 ]; then
  echo "AVISO: a versão nova ainda não apareceu no ar. O push foi feito; o Pages pode demorar mais."
  exit 1
fi

# confere também alguns scripts, não só a página
for f in js/main.js js/engine/sim.js js/ui/ui.js; do
  c=$(curl -s -o /dev/null -w "%{http_code}" "$SITE/$f")
  [ "$c" != "200" ] && { echo "AVISO: $f respondeu $c."; ok=0; }
done

echo ""
if [ "$ok" -eq 1 ]; then
  echo "✔ No ar: $SITE/"
  git log --oneline -1
else
  echo "Publicado, mas com avisos acima."
fi
