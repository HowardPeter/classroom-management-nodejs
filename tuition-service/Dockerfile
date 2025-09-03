FROM node:22-alpine AS base

WORKDIR /app

# Cần chạy build từ /root
COPY tuition-service/package*.json ./

FROM base AS development

RUN npm install

COPY tuition-service/ .
COPY shared-libs ./shared-libs

# Generate Prisma client cho môi trường Alpine (linux-musl)
RUN npx prisma generate

EXPOSE 3004

CMD ["npm", "run", "dev"]

FROM base AS production

RUN npm ci --omit=dev && npm cache clean --force

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nodeusr
USER nodeusr

COPY tuition-service/ .
COPY shared-libs ./shared-libs

# Generate Prisma client lại cho môi trường production
RUN npx prisma generate

ENV NODE_ENV=production

EXPOSE 3004

CMD ["npm", "start"]