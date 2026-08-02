import type { NextFunction, Request, Response } from "express";
import { AppError } from "../shared/errors/AppError.js";

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ success: false, message: "Route not found" });
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof SyntaxError && "body" in err) {
    res.status(400).json({ success: false, message: "Invalid JSON body" });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }

  const message = err instanceof Error ? err.message : "Internal server error";
  console.error("[api]", err);
  res.status(500).json({ success: false, message });
}
