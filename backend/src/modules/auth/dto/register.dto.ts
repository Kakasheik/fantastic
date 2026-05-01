import { IsEmail, IsEnum, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { UserRole } from '../../../types/enums';

export class RegisterDto {
  @IsEmail({}, { message: 'E-mail inválido' })
  email!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @Matches(/^[a-zA-Z0-9_.]+$/)
  username!: string;

  @IsString()
  @MinLength(8, { message: 'Senha deve ter no mínimo 8 caracteres' })
  @MaxLength(128)
  password!: string;

  @IsEnum([UserRole.SUBSCRIBER, UserRole.CREATOR, UserRole.ADVERTISER])
  @IsOptional()
  role?: UserRole;
}
