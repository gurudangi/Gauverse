import type { Response } from "express";
import type { AuthenticatedRequest } from "../auth/auth.types.js";
import { adminService } from "./admin.service.js";

export const adminController = {
  async stats(_req: AuthenticatedRequest, res: Response) {
    const data = await adminService.getStats();
    res.json({ success: true, data });
  },

  async orders(_req: AuthenticatedRequest, res: Response) {
    const data = await adminService.listOrders();
    res.json({ success: true, data });
  },

  async donations(_req: AuthenticatedRequest, res: Response) {
    const data = await adminService.listDonations();
    res.json({ success: true, data });
  },

  async users(_req: AuthenticatedRequest, res: Response) {
    const data = await adminService.listUsers();
    res.json({ success: true, data });
  },
};
