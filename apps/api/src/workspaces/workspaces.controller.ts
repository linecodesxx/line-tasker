import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/jwt.guard";
import { WorkspacesService } from "./workspaces.service";
import { CreateWorkspaceDto } from "./dto/createWorkspacesDTO";

@UseGuards(JwtAuthGuard)
@Controller("workspaces")
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Get()
  getMine(@Req() req: any) {
    return this.workspacesService.getMine(req.user.id);
  }

  @Get("me")
  getMineLegacy(@Req() req: any) {
    return this.workspacesService.getMine(req.user.id);
  }

  @Get(":id")
  getOne(@Req() req: any, @Param("id") id: string) {
    return this.workspacesService.getOne(req.user.id, id);
  }

  @Post()
  create(@Req() req: any, @Body() dto: CreateWorkspaceDto) {
    return this.workspacesService.create(req.user.id, dto);
  }

  @Post("bootstrap")
  bootstrap(@Req() req: any) {
    return this.workspacesService.bootstrap(req.user.id);
  }

  @Get(":workspaceId/fs")
  getFileSystem(@Param("workspaceId") workspaceId: string) {
    return this.workspacesService.getFileSystem(workspaceId);
  }
}
