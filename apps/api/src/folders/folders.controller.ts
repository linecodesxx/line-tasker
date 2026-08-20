import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";

import { FoldersService } from "./folders.service";
import { CreateFolderDto } from "./dto/createFolderDTO";
import { RenameFolderDto } from "./dto/renameFolderDTO";
import { JwtAuthGuard } from "src/auth/jwt.guard";
import { MoveFolderDto } from "./dto/moveFolderDTO";

@UseGuards(JwtAuthGuard)
@Controller("folders")
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  @Get("tree")
  getTree(@Req() req: any, @Query("workspaceId") workspaceId: string) {
    return this.foldersService.getTree(req.user.id, workspaceId);
  }

  @Post()
  create(
    @Req() req: any,
    @Query("workspaceId") workspaceId: string,
    @Body() dto: CreateFolderDto,
  ) {
    return this.foldersService.create(req.user.id, workspaceId, dto);
  }

  @Patch(":id/rename")
  rename(
    @Req() req: any,
    @Param("id") id: string,
    @Query("workspaceId") workspaceId: string,
    @Body() dto: RenameFolderDto,
  ) {
    return this.foldersService.rename(req.user.id, id, workspaceId, dto);
  }

  @Patch(":id/move")
  move(
    @Req() req: any,
    @Param("id") id: string,
    @Query("workspaceId") workspaceId: string,
    @Body() dto: MoveFolderDto,
  ) {
    return this.foldersService.move(req.user.id, id, workspaceId, dto);
  }

  @Delete(":id")
  remove(
    @Req() req: any,
    @Param("id") id: string,
    @Query("workspaceId") workspaceId: string,
  ) {
    return this.foldersService.remove(req.user.id, id, workspaceId);
  }
}
