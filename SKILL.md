# Waiona — SKILL: Generación de Código

Este archivo define cómo debe generarse código para el proyecto Waiona. Seguí estas reglas antes de escribir cualquier archivo.

---

## 1. Crear un nuevo módulo

Estructura mínima para un módulo nuevo:

```
src/modules/<nombre>/
  ├── <nombre>.module.ts
  ├── entities/<nombre>.entity.ts
  ├── dto/
  │   ├── create-<nombre>.dto.ts
  │   ├── update-<nombre>.dto.ts       → PartialType(CreateDto)
  │   └── <nombre>-response.dto.ts     → constructor(entity)
  ├── services/
  │   ├── <nombre>.service.ts
  │   └── <nombre>.service.spec.ts
  └── controllers/
      ├── <nombre>.controller.ts
      └── <nombre>.controller.spec.ts
```

---

## 2. Entidad

```typescript
import { Entity, Column } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base.entity';

@Entity('<nombre_tabla_plural>')
export class NombreEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 150, nullable: false })
  name: string;
}
```

**Reglas:**
- Siempre extender `BaseEntity`
- Nombre de tabla en snake_case plural
- FK explícita con `@Column({ name: 'foreign_key_id' })` + `@ManyToOne` + `@JoinColumn`
- Soft delete: nunca `@DeleteDateColumn`, usar `isDeleted` de `BaseEntity`

---

## 3. Service

```typescript
@Injectable()
export class NombreService {
  constructor(
    @InjectRepository(NombreEntity)
    private readonly repo: Repository<NombreEntity>,
  ) {}

  async findAll(): Promise<NombreResponseDto[]> {
    const items = await this.repo.find({ where: { isDeleted: false } });
    return items.map(i => new NombreResponseDto(i));
  }

  async findById(id: number): Promise<NombreResponseDto> {
    return new NombreResponseDto(await this.findEntity(id));
  }

  async create(dto: CreateNombreDto): Promise<NombreResponseDto> {
    const entity = this.repo.create({ ...dto });
    const saved = await this.repo.save(entity);
    return new NombreResponseDto(saved);
  }

  async update(id: number, dto: UpdateNombreDto): Promise<NombreResponseDto> {
    const entity = await this.findEntity(id);
    const merged = this.repo.merge(entity, dto);
    await this.repo.save(merged);
    return new NombreResponseDto(merged);
  }

  async delete(id: number): Promise<void> {
    const entity = await this.findEntity(id);
    entity.isDeleted = true;
    await this.repo.save(entity);
  }

  private async findEntity(id: number): Promise<NombreEntity> {
    const entity = await this.repo.findOne({ where: { id, isDeleted: false } });
    if (!entity) throw new NotFoundException(`Nombre with id ${id} not found`);
    return entity;
  }
}
```

**Reglas:**
- Siempre devolver DTOs, nunca entidades
- `findEntity` privado para reutilizar
- Soft delete: `isDeleted = true` + save
- Transacciones con `dataSource.transaction()` si se tocan múltiples tablas

---

## 4. Controller

```typescript
@Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN)
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('nombres')
export class NombreController {
  constructor(private readonly service: NombreService) {}

  @Post()
  create(@Body() dto: CreateNombreDto) { return this.service.create(dto); }

  @Get()
  findAll() { return this.service.findAll(); }

  // ⚠️ rutas específicas SIEMPRE antes de rutas con parámetros
  @Get('by-something/:value')
  findBySomething(@Param('value') value: string) { ... }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) { return this.service.findById(id); }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateNombreDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseIntPipe) id: number) { return this.service.delete(id); }
}
```

**Reglas:**
- Guards a nivel de clase cuando todos los endpoints tienen el mismo acceso
- Rutas específicas ANTES de `/:id`
- `ParseIntPipe` en todos los params numéricos
- `@HttpCode(204)` en DELETE

---

## 5. Response DTO

```typescript
export class NombreResponseDto {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(entity: NombreEntity) {
    this.id        = entity.id;
    this.name      = entity.name;
    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
  }
}
```

---

## 6. Module

```typescript
@Module({
  imports: [TypeOrmModule.forFeature([NombreEntity])],
  controllers: [NombreController],
  providers: [NombreService],
  exports: [NombreService], // solo si otros módulos lo necesitan
})
export class NombreModule {}
```

**Reglas:**
- No importar `GuardsModule` — el `RolesGuard` ya no necesita `UserEntity`
- Exportar services solo si otros módulos los consumen
- Importar módulos externos en vez de re-registrar entities

---

## 7. Unit Test — Service Spec

```typescript
describe('NombreService', () => {
  let service: NombreService;
  let repo: jest.Mocked<Repository<NombreEntity>>;

  const mockRepo = () => ({
    find: jest.fn(), findOne: jest.fn(),
    create: jest.fn(), save: jest.fn(), merge: jest.fn(),
  });

  const mockEntity = (overrides = {}): NombreEntity =>
    ({ id: 1, name: 'Test', isDeleted: false,
       createdAt: new Date(), updatedAt: new Date(), ...overrides }) as NombreEntity;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        NombreService,
        { provide: getRepositoryToken(NombreEntity), useFactory: mockRepo },
      ],
    }).compile();

    service = module.get<NombreService>(NombreService);
    repo    = module.get(getRepositoryToken(NombreEntity));
  });

  afterEach(() => jest.clearAllMocks());

  // happy path + error por cada método
});
```

---

## 8. Unit Test — Controller Spec

```typescript
describe('NombreController', () => {
  let controller: NombreController;
  let service: jest.Mocked<NombreService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [NombreController],
      providers: [
        { provide: NombreService, useFactory: () => ({ findAll: jest.fn(), ... }) },
        { provide: Reflector, useValue: { get: jest.fn() } },
      ],
    })
      .overrideGuard(AuthGuard('jwt')).useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard).useValue({ canActivate: () => true })
      .compile();

    controller = module.get<NombreController>(NombreController);
    service    = module.get(NombreService);
  });

  afterEach(() => jest.clearAllMocks());
});
```

---

## 9. Guards y Auth

```typescript
// Endpoint público (shop)
@Get('items')
findAll() { ... }

// Endpoint autenticado (cualquier rol)
@UseGuards(AuthGuard('jwt'))
@Get('profile')
getProfile(@Req() req: Request) {
  const payload = req.user as { sub: number; role: RoleType };
}

// Endpoint solo admin
@Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN)
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Post()
create() { ... }
```

---

## 10. Transacciones

Usar cuando se tocan múltiples tablas:

```typescript
constructor(private readonly dataSource: DataSource) {}

async create(dto: CreateDto) {
  return this.dataSource.transaction(async manager => {
    const entity = manager.create(EntityA, { ... });
    await manager.save(EntityA, entity);

    const related = manager.create(EntityB, { entityId: entity.id, ... });
    await manager.save(EntityB, related);

    return entity;
  });
}
```

---

## 11. Checklist antes de crear un módulo

- [ ] ¿La entidad extiende `BaseEntity`?
- [ ] ¿El service devuelve DTOs, no entidades?
- [ ] ¿Las rutas específicas van antes de `/:id`?
- [ ] ¿Se necesita transacción (múltiples tablas)?
- [ ] ¿El módulo está registrado en `AppModule`?
- [ ] ¿Los guards están aplicados correctamente?
- [ ] ¿Hay spec de service y controller?