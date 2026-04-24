import { Prisma } from "generated/prisma/client.cjs";

export type JwtUser = Prisma.UserGetPayload<{
  select: {
    id: true;
    email: true;
    avatar: true;
    name: true;
    createdAt: true;
  };
}>;

export type AuthResponse = {
  access_token: string;
  user: JwtUser;
};
