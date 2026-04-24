import { IsOptional, IsString, Length } from "class-validator";

export class CreateTaskDto {
  @IsString()
  @Length(1, 160)
  title: string;

  @IsOptional()
  @IsString()
  folderId?: string;

  @IsOptional()
  @IsString()
  descriptionMd?: string;
}