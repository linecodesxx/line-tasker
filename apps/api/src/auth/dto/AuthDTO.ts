import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";

export class LoginDto {
  @ApiProperty({
    example: "user@example.com",
    description: "User email",
  })
  @IsString({ message: "Введите email или username" })
  @MinLength(3, { message: "Введите email или username" })
  email: string;

  @ApiProperty({
    example: "Khachatur",
    description: "User name",
  })
  @IsString({ message: "Пароль обязателен" })
  @MinLength(6, { message: "Пароль должен быть не короче 6 символов" })
  @MaxLength(72, { message: "Пароль не должен превышать 72 символа" })
  password: string;
}

export class RegisterDto {
  @ApiProperty({
    example: "user@example.com",
    description: "User email",
  })
  @IsEmail({}, { message: "Введите корректный email" })
  email: string;

  @ApiProperty({
    example: "password",
    description: "password",
  })
  @IsString({ message: "Пароль обязателен" })
  @MinLength(6, { message: "Пароль должен быть не короче 6 символов" })
  @MaxLength(72, { message: "Пароль не должен превышать 72 символа" })
  password: string;

  @ApiProperty({
    example: "Khachatur",
    description: "User name",
  })
  @IsString({ message: "Имя пользователя обязательно" })
  @MinLength(3, {
    message: "Имя пользователя должно быть не короче 3 символов",
  })
  @MaxLength(20, {
    message: "Имя пользователя не должно превышать 20 символов",
  })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: "Имя пользователя может содержать только латиницу, цифры и _",
  })
  name: string;
}
