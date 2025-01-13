export class AppError extends Error {
  public readonly message: string;
  public readonly status: number;
  public readonly isOperational: boolean;

  constructor(message: string, status: number) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message;
    this.status = status;
    this.isOperational = true;
  }
}
