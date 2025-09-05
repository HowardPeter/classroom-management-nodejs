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

  async updateById(id, data) {
    return await super.updateById("payment_id", id, data);
  }

  async deleteById(id) {
    return await super.deleteById("payment_id", id);
  }
}

export default new PaymentRepository();