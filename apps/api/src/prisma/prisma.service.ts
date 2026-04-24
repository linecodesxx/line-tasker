import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaClient } from "../../generated/prisma/client.cjs";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(configService: ConfigService) {
    const databaseUrl = configService.get<string>("DATABASE_URL");

    if (!databaseUrl) {
      throw new Error("DATABASE_URL is not defined");
    }

    const pool = new Pool({
      connectionString: databaseUrl,
    });

    const adapter = new PrismaPg(pool);

    super({
      adapter,
    });
  }

  async onModuleInit() {
    await this.$connect();
  }
}
