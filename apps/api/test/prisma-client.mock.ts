export class PrismaClient {
  constructor(..._args: unknown[]) {}

  async $connect() {}
}

export namespace Prisma {
  export class PrismaClientKnownRequestError extends Error {
    constructor(
      message: string,
      public readonly options: { code: string; clientVersion: string },
    ) {
      super(message);
    }

    get code() {
      return this.options.code;
    }

    get clientVersion() {
      return this.options.clientVersion;
    }
  }
}
