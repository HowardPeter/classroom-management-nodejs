FROM node:22-alpine AS base

WORKDIR /app

COPY student-service/package*.json ./

FROM base AS development

RUN npm install

COPY student-service/ .
COPY shared-libs ./shared-libs

# Generate Prisma client cho môi trường Alpine (linux-musl)
RUN npx prisma generate

EXPOSE 3002

CMD ["npm", "run", "dev"]

FROM base AS production

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nodeusr

RUN npm ci --omit=dev && npm cache clean --force

COPY student-service/ .
COPY shared-libs ./shared-libs

RUN npx prisma generate --schema=prisma/schema.prisma

USER nodeusr

ENV NODE_ENV=production

EXPOSE 3002

CMD ["npm", "start"]