import { IsOptional, IsString } from "class-validator";

export class MoveTaskDto {
  @IsOptional()
  @IsString()
  folderId?: string | null;
}