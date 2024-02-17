import type { Request } from "express";
import type { User } from "@prisma/client";

export interface AuthenticatedRequest extends Request {
	user: {
		email: string;
		iat: number;
		exp: number;
	} & User;
}
