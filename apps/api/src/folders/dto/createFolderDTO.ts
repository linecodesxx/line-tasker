import { IsEnum, IsOptional, IsString, Length } from "class-validator";

export enum FolderKindDto {
  ROOT = "ROOT",
  NOTES = "NOTES",
  TASKS = "TASKS",
  MIXED = "MIXED",
}

export class CreateFolderDto {
  @IsString()
  @Length(1, 80)
  name: string;

  @IsOptional()
  @IsString()
  parentId?: string;

  @IsOptional()
  @IsEnum(FolderKindDto)
  kind?: FolderKindDto;
}