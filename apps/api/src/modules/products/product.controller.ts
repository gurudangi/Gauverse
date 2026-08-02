import type { Request, Response } from "express";
import { AppError } from "../../shared/errors/AppError.js";
import { productService } from "./product.service.js";
import { upsertProductSchema } from "./product.validators.js";

export const productController = {
  async list(_req: Request, res: Response) {
    const products = await productService.listProducts();
    res.json({ success: true, data: products });
  },

  async getById(req: Request, res: Response) {
    const product = await productService.getProduct(req.params.id as string);
    res.json({ success: true, data: product });
  },

  async create(req: Request, res: Response) {
    const parsed = upsertProductSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0]?.message ?? "Invalid product data", 400);
    }
    const product = await productService.createProduct(parsed.data);
    res.status(201).json({ success: true, message: "Product created", data: product });
  },

  async update(req: Request, res: Response) {
    const parsed = upsertProductSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0]?.message ?? "Invalid product data", 400);
    }
    const product = await productService.updateProduct(
      req.params.id as string,
      parsed.data,
    );
    res.json({ success: true, message: "Product updated", data: product });
  },
};
