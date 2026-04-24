import { IsOptional, IsString, Length, IsInt, Min } from "class-validator";
import { Type } from "class-transformer";

export class UpdateNoteDto {
  @IsOptional()
  @IsString()
  @Length(1, 160)
  title?: string;

  @IsOptional()
  @IsString()
  contentMd?: string;

  @IsOptional()
  @IsString()
  folderId?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  version?: number;
}