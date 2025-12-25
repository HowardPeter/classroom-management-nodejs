FROM node:22-alpine

WORKDIR /app

# Cài curl do alpine không có sẵn
RUN apk add --no-cache curl

# Cần chạy build từ /root
COPY src/auth-service/package*.json .

RUN npm install

COPY src/auth-service/ .
COPY src/shared-libs ./shared-libs

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/users/health || exit 1

EXPOSE 3001

CMD ["npm", "run", "dev"]