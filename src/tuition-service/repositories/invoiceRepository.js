import BaseRepository from "./baseRepository.js";
import prisma from "../db/prismaClient.js";
import { getMonthRange } from "../utils/index.js";
import { RedisCache } from '#shared/utils/index.js';

class InvoiceRepository extends BaseRepository {
  constructor() {
    super(prisma.invoice, "invoice");
  }

  // Xóa các key "payment" phụ thuộc invoiceId
  relatedPatterns(invoiceId) {
    return [
      `payment:list:${invoiceId}`,
      `payment:sum:${invoiceId}`,
    ];
  }

  async findById(invoiceId) {
    const key = this.buildKey(`one:${invoiceId}`);
    return await RedisCache.cacheRead(key, () =>
      this.model.findUnique({
        where: { invoice_id: invoiceId },
        include: {
          payments: true
        },
      })
    )
  }

  async findByMonth(classId, year, month) {
    const key = this.buildKey(`list:${classId}/${year}-${month}`);
    return await RedisCache.cacheRead(key, () =>
      this.model.findMany({
        where: {
          class_id: classId,
          due_date: getMonthRange(year, month),
          NOT: {
            status: "CANCELLED"
          }
        },
        include: { payments: true }
      })
    )
  }

  async updateById(invoiceId, data) {
    const key = this.buildKey(`one:${invoiceId}`);
    return await RedisCache.cacheWrite(key, (payload) =>
      this.model.update({
        where: { invoice_id: invoiceId },
        data: payload,
      }),
      data, [...this.patterns(), ...this.relatedPatterns(invoiceId)]
    )
  }

  async deleteById(invoiceId) {
    const key = this.buildKey(`one:${invoiceId}`);
    return await RedisCache.cacheWrite(key, () =>
      this.model.delete({
        where: { invoice_id: invoiceId },
      }),
      {}, [...this.patterns(), ...this.relatedPatterns(invoiceId)]
    )
  }
}

export default new InvoiceRepository();
