declare namespace Express {
  interface Request {
    query: any;
    body: any;
    validatedData: IValidatedSchema;
    user: User;
    pagination: IPagination;
  }
}
