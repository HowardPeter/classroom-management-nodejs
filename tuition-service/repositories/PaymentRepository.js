import BaseRepository from "./baseRepository.js";
import prisma from "../db/prismaClient.js";
import { RedisCache } from '#shared/utils/index.js';

class PaymentRepository extends BaseRepository {
  constructor() {
    super(prisma.payment, "payment");
  }

  // Xóa các key liên quan
  relatedPatterns(invoiceId) {
    return [
      `invoice:list:*`,
      `invoice:one:${invoiceId}`,
      `payment:sum:${invoiceId}`,
    ];
  }

  async findById(paymentId) {
    const key = this.buildKey(`one:${paymentId}`);
    return await RedisCache.cacheRead(key, () =>
      this.model.findUnique({
        where: { payment_id: paymentId },
      })
    )
  }

  async findManyByInvoice(invoiceId) {
    const key = this.buildKey(`list:${invoiceId}`);
    return await RedisCache.cacheRead(key, () =>
      this.model.findMany({
        where: { invoice_id: invoiceId },
        orderBy: { paid_at: "asc" },
      })
    )
  }

  async sumByInvoice(invoiceId) {
    const key = this.buildKey(`sum:${invoiceId}`);
    const result = await RedisCache.cacheRead(key, () =>
      this.model.aggregate({
        _sum: { amount: true },
        where: { invoice_id: invoiceId },
      })
    )
    return result._sum.amount || 0; // nếu chưa có payment thì trả về 0
  }

  async deleteById(paymentId) {
    // lookup invoiceId từ paymentId
    const payment = await this.model.findUnique({
      where: { payment_id: paymentId },
      select: { invoice_id: true },
    });

    const key = this.buildKey(`one:${paymentId}`);
    return await RedisCache.cacheWrite(key, () =>
      this.model.delete({
        where: { payment_id: paymentId },
      }),
      {}, [...this.patterns(), ...this.relatedPatterns(payment.invoice_id)]
    );
  }
}

export default new PaymentRepository();