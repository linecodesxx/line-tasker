import { Test, TestingModule } from "@nestjs/testing";
import { WorkspacesService } from "./workspaces.service";
import { WorkspacesController } from "./workspaces.controller";

describe("WorkspacesController", () => {
  let controller: WorkspacesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkspacesController],
      providers: [
        {
          provide: WorkspacesService,
          useValue: {
            getMine: jest.fn(),
            getOne: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<WorkspacesController>(WorkspacesController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
