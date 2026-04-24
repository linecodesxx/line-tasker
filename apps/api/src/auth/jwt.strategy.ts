import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { PrismaService } from "src/prisma/prisma.service";
import { ConfigService } from "@nestjs/config";

import { JwtUser } from "./auth.types";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    const jwtSecret = configService.get<string>("JWT_SECRET");

    if (!jwtSecret) {
      throw new Error("JWT_SECRET is not defined");
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }



  async validate(payload: any): Promise<JwtUser | null> {
    return await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        avatar: true,
        name: true,
        createdAt: true,
      }
    });
  }
}
