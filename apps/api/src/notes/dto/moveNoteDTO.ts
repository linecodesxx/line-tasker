import { IsOptional, IsString } from "class-validator";

export class MoveNoteDto {
  @IsOptional()
  @IsString()
  folderId?: string | null;
}