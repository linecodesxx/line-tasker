import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "src/prisma/prisma.service";
import { NotesService } from "./notes.service";

describe("NotesService", () => {
  let service: NotesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotesService,
        {
          provide: PrismaService,
          useValue: {
            note: {
              findMany: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
            folder: {
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<NotesService>(NotesService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
