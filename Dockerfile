# syntax=docker/dockerfile:1

# ---- base ----
# Prisma на Alpine требует openssl и libc6-compat.
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# ---- deps ----
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# ---- builder ----
# Сборка идёт без подключения к БД (всё приложение force-dynamic).
FROM base AS builder
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# DATABASE_URL нужен только как валидная строка для prisma generate, к базе не подключаемся.
ENV DATABASE_URL="postgresql://user:password@localhost:5432/db"
RUN npx prisma generate && npm run build

# ---- runner ----
# Полный набор зависимостей в рантайме: next start + prisma migrate deploy + сид (tsx).
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src ./src
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

# Каталог под пользовательские загрузки (монтируется томом в compose).
RUN mkdir -p /app/public/uploads

EXPOSE 3000
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["npm", "run", "start"]
