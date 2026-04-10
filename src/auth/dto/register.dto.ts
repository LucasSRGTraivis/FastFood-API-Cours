import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: "Adresse email unique de l'utilisateur",
    example: 'marco@nexus.dev',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Mot de passe du compte (minimum 8 caractères)',
    example: 'NexusSecure123!',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password: string;
}
