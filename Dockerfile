# ==========================================
# NutriFit - Multi-stage Production Dockerfile
# Compatible con: Railway, Render, Fly.io, Google Cloud Run, AWS, VPS
# ==========================================

# 1. Base Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm ci

# Copiar codigo fuente
COPY . .

# Compilar frontend (Vite) y backend (esbuild)
RUN npm run build

# ==========================================
# 2. Production Runner
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000
ENV NODE_TLS_REJECT_UNAUTHORIZED=0

# Crear usuario sin privilegios root por seguridad
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nutrifit

# Instalar solo dependencias minimas de produccion
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copiar distribucion compilada
COPY --from=builder /app/dist ./dist

# Crear directorio de datos persistente
RUN mkdir -p /app/server/data && chown -R nutrifit:nodejs /app

USER nutrifit

EXPOSE 5000

# Healthcheck para monitorizacion automatica en la nube
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:5000/api/health || exit 1

CMD ["node", "dist/server.js"]
