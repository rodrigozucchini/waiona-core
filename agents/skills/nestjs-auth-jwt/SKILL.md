---
name: nestjs-auth-jwt
description: >
  JWT authentication patterns for this repo using Passport, LocalStrategy, JwtStrategy, and AuthGuard.
  Load when implementing login, protecting routes, or working with the auth module.
metadata:
  author: @rodrigozucchini
  version: "2.0"
---

# NestJS Auth JWT Skill

---

## When to Use

Load when implementing login, protecting routes with JWT, or modifying `AuthModule`, `AuthService`, or strategies.
Skip for general module structure (nestjs-core) or user CRUD unrelated to auth.

---

## Repo Rules

1. Two strategies: `local` for login only, `jwt` for all protected routes.
2. JWT payload is `{ sub: user.id }` only — no roles, email, or extra data.
3. `JwtStrategy.validate()` returns `{ userId: payload.sub }` — downstream uses `req.user.userId`.
4. `JWT_SECRET` always via `ConfigService<Env>` — never `process.env`.
5. Password excluded via `@Exclude()` on entity + `ClassSerializerInterceptor` globally in `main.ts`.
6. Credential validation lives in `AuthService.validateUser()` — never in the strategy directly.

---

## Auth Flow

```
POST /auth/login { email, password }
  → AuthGuard('local') → LocalStrategy.validate(email, password)
  → AuthService.validateUser() → bcrypt.compare()
  → Controller receives req.user as UserEntity
  → AuthService.generateToken(user) → { sub: user.id }
  → Response: { user, access_token }

Protected route:
  Authorization: Bearer <token>
  → AuthGuard('jwt') → JwtStrategy.validate({ sub })
  → req.user = { userId: payload.sub }
```

---

## AuthModule

```typescript
@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env>) => ({
        secret: config.get('JWT_SECRET', { infer: true }),
        signOptions: { expiresIn: '6d' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

---

## Strategies

```typescript
// local.strategy.ts
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private readonly authService: AuthService) {
    super({ usernameField: 'email', passwordField: 'password' });
  }

  async validate(email: string, password: string) {
    return this.authService.validateUser(email, password);
  }
}

// jwt.strategy.ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService<Env>) {
    const secret = config.get('JWT_SECRET', { infer: true });
    if (!secret) throw new Error('JWT_SECRET is not set');
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  validate(payload: { sub: string }) {
    return { userId: payload.sub };
  }
}
```

---

## AuthService

```typescript
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.getUserByEmail(email);
    if (!user) throw new UnauthorizedException('Unauthorized');
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Unauthorized');
    return user;
  }

  generateToken(user: UserEntity) {
    return this.jwtService.sign({ sub: user.id });
  }
}
```

---

## Controller

```typescript
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  login(@Req() req: Request) {
    const user = req.user as UserEntity;
    return {
      user,
      access_token: this.authService.generateToken(user),
    };
  }
}
```

---

## Protecting routes

```typescript
// Whole controller
@UseGuards(AuthGuard('jwt'))
@Controller('products')
export class ProductsController { ... }

// Single route with role
@Roles(RoleType.ADMIN)
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Delete(':id')
remove(@Param('id', ParseIntPipe) id: number) { ... }
```

---

## Exclude password from responses

On the entity:
```typescript
@Exclude()
@Column({ length: 255 })
password: string;
```

In `main.ts` (already configured — do not remove):
```typescript
app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
```

---

## Common Mistakes

- Using `AuthGuard('local')` outside login — it expects `email` + `password` in body.
- Putting roles/email in JWT payload — payload is `{ sub: user.id }` only.
- Using `process.env.JWT_SECRET` directly — always use `ConfigService<Env>`.
- Forgetting `ClassSerializerInterceptor` in `main.ts` — `@Exclude()` won't work without it.
- Not casting `req.user` — always `req.user as UserEntity` in login, `req.user as { userId }` in protected routes.

---
