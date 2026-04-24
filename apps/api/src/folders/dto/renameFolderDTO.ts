import { IsString, Length } from "class-validator";

export class RenameFolderDto {
  @IsString()
  @Length(1, 80)
  name: string;
}