declare namespace Express {
    interface Request {
      validatedData: IValidatedSchema;
      user: User;
      pagination: IPagination;
    }
  }
  