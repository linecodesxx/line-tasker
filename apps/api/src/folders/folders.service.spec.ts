import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "src/prisma/prisma.service";
import { FoldersService } from "./folders.service";

describe("FoldersService", () => {
  let service: FoldersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FoldersService,
        {
          provide: PrismaService,
          useValue: {
            folder: {
              findMany: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            note: {
              findMany: jest.fn(),
              update: jest.fn(),
            },
            task: {
              findMany: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<FoldersService>(FoldersService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
