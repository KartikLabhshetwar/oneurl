import { Request } from "express";

export interface AuthenticatedRequest extends Request {
  session?: {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string;
    };
  };
}

