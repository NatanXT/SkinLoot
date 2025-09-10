#!/bin/sh
set -e
# ^ "set -e" faz o script abortar se algum comando falhar (sair com código != 0)

# Lê as variáveis de ambiente (com valores padrão se não vierem do compose)
HOST="${APP_HOST:-localhost}"
PORT="${APP_PORT:-5173}"

# Só um banner bonitinho para facilitar clicar no link no terminal
echo ""
echo "──────────────────────────────────────────────"
echo "  SkinLoot frontend →  http://$HOST:$PORT"
echo "──────────────────────────────────────────────"
echo ""

# IMPORTANTE: executa o Nginx em foreground/primeiro plano, ON ele vai para segundo plano
# Em imagem oficial do Nginx, o ENTRYPOINT padrão chama os scripts de
# preparação e depois dá "exec" no comando passado via CMD (que é este).
exec nginx -g 'daemon off;'
