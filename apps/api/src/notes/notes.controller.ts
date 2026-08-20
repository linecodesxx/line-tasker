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
import { JwtAuthGuard } from "src/auth/jwt.guard";
import { CreateNoteDto } from "./dto/createNoteDTO";
import { MoveNoteDto } from "./dto/moveNoteDTO";
import { UpdateNoteDto } from "./dto/updateNoteDTO";
import { NotesService } from "./notes.service";

@UseGuards(JwtAuthGuard)
@Controller("notes")
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  list(@Req() req: any, @Query("workspaceId") workspaceId: string) {
    return this.notesService.list(req.user.id, workspaceId);
  }

  @Get(":id")
  getById(
    @Req() req: any,
    @Param("id") id: string,
    @Query("workspaceId") workspaceId: string,
  ) {
    return this.notesService.getById(req.user.id, id, workspaceId);
  }

  @Post()
  create(
    @Req() req: any,
    @Query("workspaceId") workspaceId: string,
    @Body() dto: CreateNoteDto,
  ) {
    return this.notesService.create(req.user.id, workspaceId, dto);
  }

  @Patch(":id")
  update(
    @Req() req: any,
    @Param("id") id: string,
    @Query("workspaceId") workspaceId: string,
    @Body() dto: UpdateNoteDto,
  ) {
    return this.notesService.update(req.user.id, id, workspaceId, dto);
  }

  @Patch(":id/move")
  move(
    @Req() req: any,
    @Param("id") id: string,
    @Query("workspaceId") workspaceId: string,
    @Body() dto: MoveNoteDto,
  ) {
    return this.notesService.move(req.user.id, id, workspaceId, dto);
  }

  @Delete(":id")
  remove(
    @Req() req: any,
    @Param("id") id: string,
    @Query("workspaceId") workspaceId: string,
  ) {
    return this.notesService.remove(req.user.id, id, workspaceId);
  }
}
