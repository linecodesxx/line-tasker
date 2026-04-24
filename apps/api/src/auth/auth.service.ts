import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { LoginDto, RegisterDto } from "./dto/AuthDTO";
import { Prisma } from "../../generated/prisma/client.cjs";
import { normalizeUsernameHandle } from "src/users/username.util";
import { AuthResponse } from "./auth.types";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) { }

  async register(dto: RegisterDto) {
    try {
      const hash = await bcrypt.hash(dto.password, 10);
      const name = normalizeUsernameHandle(dto.name);

      const user = await this.prisma.user.create({
        data: {
          email: dto.email.trim().toLowerCase(),
          name,
          password: hash,
        },
      });

      return this.generateTokenResponse(user.id);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ConflictException(
          "Пользователь с таким email или username уже существует",
        );
      }
      console.error("REGISTER ERROR:", error);
      throw new InternalServerErrorException("Ошибка при регистрации");
    }
  }

  async login(dto: LoginDto) {
    const identifier = dto.email.trim();
    const asEmail = identifier.toLowerCase();
    const asHandle = normalizeUsernameHandle(identifier);

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: asEmail }, { name: asHandle }],
      },
    });

    if (!user) {
      throw new UnauthorizedException("Пользователь не найден");
    }

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) {
      throw new UnauthorizedException("Неверный пароль");
    }

    return this.generateTokenResponse(user.id);
  }

  private async generateTokenResponse(userId: string): Promise<AuthResponse> {
    const safe = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        avatar: true,
        name: true,
        createdAt: true,
      },
    });

    if (!safe) {
      throw new UnauthorizedException("Пользователь не найден");
    }

    const payload = { sub: safe.id, name: safe.name };

    return {
      access_token: this.jwt.sign(payload),
      user: safe,
    };
  }
}
