import type { Request, Response } from "express";
import { AppError } from "../../shared/errors/AppError.js";
import { contactService } from "./contact.service.js";
import { createContactSchema } from "./contact.validators.js";

export const contactController = {
  async create(req: Request, res: Response) {
    const parsed = createContactSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(
        parsed.error.issues[0]?.message ?? "Invalid contact data",
        400,
      );
    }

    const contact = await contactService.sendMessage(parsed.data);
    res.status(201).json({
      success: true,
      message: "Message sent! Our team will get back to you soon.",
      data: { messageId: contact.id },
    });
  },
};
