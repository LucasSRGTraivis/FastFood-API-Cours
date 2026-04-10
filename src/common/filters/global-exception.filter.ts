import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Une erreur interne est survenue';
    let error = 'Internal Server Error';

    // 1. HttpException (NestJS)
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || exception.message;
        error = (exceptionResponse as any).error || exception.name;
      }
    }
    // 2. Erreurs Prisma
    else if (exception?.code) {
      switch (exception.code) {
        case 'P2002':
          // Contrainte unique violée
          status = HttpStatus.CONFLICT;
          error = 'Conflict';
          const target = exception.meta?.target;
          const field = Array.isArray(target) ? target[0] : target;
          message = `Un enregistrement avec cette valeur de ${field || 'champ'} existe déjà`;
          break;

        case 'P2025':
          // Record not found
          status = HttpStatus.NOT_FOUND;
          error = 'Not Found';
          message = 'Enregistrement non trouvé';
          break;

        case 'P2003':
          // Foreign key constraint failed
          status = HttpStatus.BAD_REQUEST;
          error = 'Bad Request';
          message = 'Référence invalide';
          break;

        default:
          // Autres erreurs Prisma
          status = HttpStatus.INTERNAL_SERVER_ERROR;
          error = 'Internal Server Error';
          message = 'Erreur de base de données';
      }
    }
    // 3. Autres erreurs
    else {
      message = exception?.message || 'Une erreur interne est survenue';
      error = exception?.name || 'Internal Server Error';
    }

    // Log l'erreur (avec stack trace en dev uniquement)
    const isProduction = process.env.NODE_ENV === 'production';
    if (!isProduction && exception?.stack) {
      this.logger.error(
        `${request.method} ${request.url} - ${status} - ${message}`,
        exception.stack,
      );
    } else {
      this.logger.error(
        `${request.method} ${request.url} - ${status} - ${message}`,
      );
    }

    // Réponse structurée
    const errorResponse = {
      success: false,
      error: {
        statusCode: status,
        message: Array.isArray(message) ? message : [message],
        error,
        timestamp: new Date().toISOString(),
        path: request.url,
      },
    };

    // En dev, on peut ajouter la stack trace
    if (!isProduction && exception?.stack) {
      (errorResponse.error as any).stack = exception.stack;
    }

    response.status(status).json(errorResponse);
  }
}
