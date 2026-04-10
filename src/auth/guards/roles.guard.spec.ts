import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { ROLES_KEY } from '../decorators/roles.decorator';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  const createMockExecutionContext = (user?: any): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as any;
  };

  it("devrait retourner true si aucun rôle n'est requis (route publique)", () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

    const context = createMockExecutionContext();
    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  it("devrait retourner true si l'utilisateur a le rôle requis", () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue(['owner', 'admin']);

    const context = createMockExecutionContext({
      id: 1,
      email: 'owner@test.com',
      role: 'owner',
    });
    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  it("devrait lever ForbiddenException si l'utilisateur n'a pas le rôle requis", () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);

    const context = createMockExecutionContext({
      id: 1,
      email: 'owner@test.com',
      role: 'owner',
    });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    expect(() => guard.canActivate(context)).toThrow(
      'Accès refusé. Rôles requis : admin',
    );
  });

  it("devrait lever ForbiddenException si l'utilisateur n'est pas authentifié", () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['owner']);

    const context = createMockExecutionContext(undefined);

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    expect(() => guard.canActivate(context)).toThrow(
      'Utilisateur non authentifié',
    );
  });

  it("devrait retourner true si l'utilisateur a l'un des rôles requis", () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue(['owner', 'admin']);

    const context = createMockExecutionContext({
      id: 1,
      email: 'admin@test.com',
      role: 'admin',
    });
    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });
});
