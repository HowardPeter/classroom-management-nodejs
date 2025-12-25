FROM node:22-alpine

WORKDIR /app

# Cài curl do alpine không có sẵn
RUN apk add --no-cache curl

# Cần chạy build từ /root
COPY src/student-service/package*.json .

RUN npm install

COPY src/student-service/ .
COPY src/shared-libs ./shared-libs

# Generate Prisma client cho môi trường Alpine (linux-musl)
RUN npx prisma generate

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3002/students/health || exit 1

EXPOSE 3002

CMD ["npm", "run", "dev"]