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
  getTree(@Query("workspaceId") workspaceId: string) {
    return this.foldersService.getTree(workspaceId);
  }

  @Post()
  create(
    @Query("workspaceId") workspaceId: string,
    @Body() dto: CreateFolderDto,
  ) {
    return this.foldersService.create(workspaceId, dto);
  }

  @Patch(":id/rename")
  rename(
    @Param("id") id: string,
    @Query("workspaceId") workspaceId: string,
    @Body() dto: RenameFolderDto,
  ) {
    return this.foldersService.rename(id, workspaceId, dto);
  }

  @Patch(":id/move")
  move(
    @Param("id") id: string,
    @Query("workspaceId") workspaceId: string,
    @Body() dto: MoveFolderDto,
  ) {
    return this.foldersService.move(id, workspaceId, dto);
  }

  @Delete(":id")
  remove(@Param("id") id: string, @Query("workspaceId") workspaceId: string) {
    return this.foldersService.remove(id, workspaceId);
  }
}
