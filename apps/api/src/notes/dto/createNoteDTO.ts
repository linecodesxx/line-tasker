import { IsOptional, IsString, Length } from "class-validator";

export class CreateNoteDto {
  @IsString()
  @Length(1, 160)
  title: string;

  @IsOptional()
  @IsString()
  folderId?: string;

  @IsOptional()
  @IsString()
  contentMd?: string;
}