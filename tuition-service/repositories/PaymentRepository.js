import BaseRepository from "./BaseRepository.js";
import prisma from "../prismaClient.js";

class PaymentRepository extends BaseRepository {
  constructor() {
    super(prisma.payment);
  }

  async findManyByInvoice(invoiceId) {
    return await this.model.findMany({
      where: { invoice_id: invoiceId },
      orderBy: { paid_at: "asc" },
    });
  }

  async sumByInvoice(invoiceId) {
    const result = await this.model.aggregate({
      _sum: { amount: true },
      where: { invoice_id: invoiceId },
    });
    return result._sum.amount || 0; // nếu chưa có payment thì trả về 0
  }

  async updateById(id, data) {
    return await super.updateById("payment_id", id, data);
  }

  async deleteById(id) {
    return await super.deleteById("payment_id", id);
  }
}

export default new PaymentRepository();