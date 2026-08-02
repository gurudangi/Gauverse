import type { Request, Response } from "express";
import { AppError } from "../../shared/errors/AppError.js";
import { farmVisitService } from "./farmVisit.service.js";
import { createFarmVisitSchema } from "./farmVisit.validators.js";

export const farmVisitController = {
  async create(req: Request, res: Response) {
    const parsed = createFarmVisitSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(
        parsed.error.issues[0]?.message ?? "Invalid farm visit data",
        400,
      );
    }

    const visit = await farmVisitService.bookVisit(parsed.data);
    res.status(201).json({
      success: true,
      message: "Farm visit booked! We will confirm your appointment via phone.",
      data: { visitId: visit.id, date: visit.date, timeSlot: visit.timeSlot },
    });
  },
};
