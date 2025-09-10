# --- Stage 1: Build (Vite) ---
FROM node:20-bookworm-slim AS build
WORKDIR /app

# Copia manifests primeiro para aproveitar cache do Docker
COPY package.json package-lock.json ./

# Instala usando o lock; se o npm travar por bug de optional deps, faz fallback p/ npm install
RUN npm ci || (rm -f package-lock.json && npm install --no-audit --no-fund)

# Copia o restante do código
COPY . .

# Args/ENV (usados pelo Vite no build)
ARG VITE_AUTH_MODE=mock
ARG VITE_API_BASE_URL=http://localhost:8080
ENV VITE_AUTH_MODE=$VITE_AUTH_MODE
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# (Workaround) Garante binários nativos corretos p/ Linux no build
RUN npm i -D @rollup/rollup-linux-x64-gnu @swc/core-linux-x64-gnu @swc/helpers

# Gera o build de produção (gera /app/dist)
RUN npm run build


# --- Stage 2: Nginx estático ---
FROM nginx:1.27-alpine

# Config Nginx própria (SPA fallback, cache estáticos)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia os arquivos estáticos gerados pelo Vite
COPY --from=build /app/dist /usr/share/nginx/html

# Entrypoint que imprime a URL e sobe o nginx em foreground
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80
CMD ["/entrypoint.sh"]
