FROM node:22-alpine AS base

WORKDIR /app

COPY package*.json ./

FROM base AS development

RUN npm install

COPY . .

EXPOSE 3002

CMD ["npm", "run", "dev"]

FROM base AS production

RUN npm ci --omit=dev && npm cache clean --force

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodeusr

USER nodeusr

COPY . .

ENV NODE_ENV=production

EXPOSE 3001

CMD ["npm", "start"]