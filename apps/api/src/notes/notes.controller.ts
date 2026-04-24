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
  list(@Query("workspaceId") workspaceId: string) {
    return this.notesService.list(workspaceId);
  }

  @Get(":id")
  getById(@Param("id") id: string, @Query("workspaceId") workspaceId: string) {
    return this.notesService.getById(id, workspaceId);
  }

  @Post()
  create(
    @Query("workspaceId") workspaceId: string,
    @Req() req: any,
    @Body() dto: CreateNoteDto,
  ) {
    return this.notesService.create(workspaceId, req.user.id, dto);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Query("workspaceId") workspaceId: string,
    @Req() req: any,
    @Body() dto: UpdateNoteDto,
  ) {
    return this.notesService.update(id, workspaceId, req.user.id, dto);
  }

  @Patch(":id/move")
  move(
    @Param("id") id: string,
    @Query("workspaceId") workspaceId: string,
    @Body() dto: MoveNoteDto,
  ) {
    return this.notesService.move(id, workspaceId, dto);
  }

  @Delete(":id")
  remove(@Param("id") id: string, @Query("workspaceId") workspaceId: string) {
    return this.notesService.remove(id, workspaceId);
  }
}
