import { Controller, Post, Get, Body, UseGuards, Request, HttpCode, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('auth')
@Controller({ path: 'auth', version: VERSION_NEUTRAL })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: "Inscription d'un nouvel utilisateur",
    description:
      "Crée un compte utilisateur à partir d'un email et d'un mot de passe, puis retourne un jeton JWT.",
  })
  @ApiResponse({ status: 201, description: 'Utilisateur créé avec succès. Retourne un JWT.' })
  @ApiResponse({ status: 400, description: 'Payload invalide (email/mot de passe manquant ou invalide).' })
  @ApiResponse({ status: 409, description: 'Email déjà utilisé.' })
  @ApiResponse({ status: 429, description: "Trop de requêtes sur l'endpoint d'inscription." })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(200)
  @Throttle({ short: { ttl: 1000, limit: 3 } })
  @ApiOperation({
    summary: "Connexion d'un utilisateur",
    description:
      "Authentifie un utilisateur avec email/mot de passe et retourne un jeton JWT à utiliser dans l'en-tête Authorization.",
  })
  @ApiResponse({ status: 200, description: 'Connexion réussie. Retourne un JWT.' })
  @ApiResponse({ status: 400, description: 'Payload invalide (email ou mot de passe invalide).' })
  @ApiResponse({ status: 401, description: 'Email ou mot de passe incorrect.' })
  @ApiResponse({ status: 429, description: 'Trop de tentatives. Réessayez plus tard.' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Récupérer le profil de l'utilisateur connecté",
    description:
      "Retourne les informations du compte associé au JWT fourni dans l'en-tête Authorization.",
  })
  @ApiResponse({ status: 200, description: 'Profil utilisateur.' })
  @ApiResponse({ status: 401, description: 'Non authentifié.' })
  @ApiResponse({ status: 429, description: 'Limite de requêtes dépassée.' })
  async getProfile(@Request() req: any) {
    return req.user;
  }
}
