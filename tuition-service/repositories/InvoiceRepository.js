import BaseRepository from "./BaseRepository.js";
import prisma from "../prismaClient.js";
import { getMonthRange } from "../utils/index.js";

class InvoiceRepository extends BaseRepository {
  constructor() {
    super(prisma.invoice);
  }

  async findById(id) {
    return await this.model.findUnique({
      where: { invoice_id: id },
      include: {
        payments: true
      },
    });
  }

  async findByMonth(classId, year, month) {
    return await this.model.findMany({
      where: {
        class_id: classId,
        due_date: getMonthRange(year, month),
        NOT: {
          status: "CANCELLED"
        }
      },
      include: {
        payments: true
      }
    })
  }

  async updateById(id, data) {
    return await super.updateById("invoice_id", id, data);
  }

  async deleteById(id) {
    return await super.deleteById("invoice_id", id);
  }
}

export default new InvoiceRepository();
