FROM node:22-alpine

WORKDIR /app

# Cài curl do alpine không có sẵn
RUN apk add --no-cache curl

# Cần chạy build từ /root
COPY class-service/package*.json ./

RUN npm install

COPY class-service/ .
COPY shared-libs ./shared-libs

# Generate Prisma client
RUN npx prisma generate

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3003/health || exit 1

EXPOSE 3003

CMD ["npm", "run", "dev"]