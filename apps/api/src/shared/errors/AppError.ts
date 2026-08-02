export class AppError extends Error {
  readonly statusCode: number;
  readonly isOperational = true;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
  }
}
