import { PrismaClient } from "@prisma/client";

let prisma;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
}
else {
  if (!global.prisma) {
    global.prisma = new PrismaClient(); // tránh tạo nhiều instance khi reload trong dev
  }
  prisma = global.prisma;
}

export default prisma;