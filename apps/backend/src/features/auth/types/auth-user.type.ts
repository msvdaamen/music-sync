import { auth } from "../../../lib/auth";

export type AuthUser = typeof auth.$Infer.Session.user;
