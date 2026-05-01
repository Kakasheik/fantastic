import { IsDateString, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CompleteProfileDto {
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  fullName!: string;

  @IsString()
  @Matches(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/, { message: 'CPF inválido' })
  cpf!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(20)
  phone!: string;

  @IsDateString({}, { message: 'Data de nascimento inválida' })
  dateOfBirth!: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  nickname?: string;
}
