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

  @Get(":workspaceId/fs")
  getFileSystem(@Req() req: any, @Param("workspaceId") workspaceId: string) {
    return this.workspacesService.getFileSystem(req.user.id, workspaceId);
  }
}
