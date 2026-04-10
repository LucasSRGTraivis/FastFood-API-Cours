import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: "Adresse email utilisée à l'authentification",
    example: 'marco@nexus.dev',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Mot de passe associé au compte utilisateur',
    example: 'NexusSecure123!',
  })
  @IsString()
  password: string;
}
