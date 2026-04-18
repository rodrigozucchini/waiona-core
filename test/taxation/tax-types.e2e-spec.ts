import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TaxTypesController } from '../../src/modules/taxation/tax-types/controllers/tax-types.controller';
import { TaxTypesService } from '../../src/modules/taxation/tax-types/services/tax-types.service';
import { TaxTypeEntity } from '../../src/modules/taxation/tax-types/entities/tax-types.entity';

import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/roles.guard';

describe('TaxTypes (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          dropSchema: true,
          entities: [TaxTypeEntity],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([TaxTypeEntity]),
      ],
      controllers: [TaxTypesController],
      providers: [TaxTypesService],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue({
        canActivate: () => true,
      })
      .overrideGuard(RolesGuard)
      .useValue({
        canActivate: () => true,
      })
      .compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    dataSource = moduleFixture.get(DataSource);
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  // -------------------------
  // CREATE
  // -------------------------
  it('POST /tax-types -> should create', async () => {
    const dto = { code: 'IVA', name: 'Impuesto' };

    const res = await request(app.getHttpServer())
      .post('/tax-types')
      .send(dto)
      .expect(201);

    expect(res.body).toMatchObject(dto);
    expect(res.body.id).toBeDefined();
  });

  it('POST /tax-types -> should fail validation', async () => {
    const dto = { code: 'I', name: '' };

    await request(app.getHttpServer())
      .post('/tax-types')
      .send(dto)
      .expect(400);
  });

  it('POST /tax-types -> should fail duplicate code', async () => {
    const dto = { code: 'DUP', name: 'Test' };

    await request(app.getHttpServer())
      .post('/tax-types')
      .send(dto)
      .expect(201);

    await request(app.getHttpServer())
      .post('/tax-types')
      .send(dto)
      .expect(400);
  });

  // -------------------------
  // FIND ALL
  // -------------------------
  it('GET /tax-types -> should return all', async () => {
    const res = await request(app.getHttpServer())
      .get('/tax-types')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  // -------------------------
  // FIND ONE
  // -------------------------
  it('GET /tax-types/:id -> should return one', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/tax-types')
      .send({ code: 'IIBB', name: 'Ingresos Brutos' });

    const res = await request(app.getHttpServer())
      .get(`/tax-types/${createRes.body.id}`)
      .expect(200);

    expect(res.body.code).toBe('IIBB');
  });

  it('GET /tax-types/:id -> should return 404', async () => {
    await request(app.getHttpServer())
      .get('/tax-types/999')
      .expect(404);
  });

  // -------------------------
  // UPDATE (PATCH)
  // -------------------------
  it('PATCH /tax-types/:id -> should update partially', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/tax-types')
      .send({ code: 'ECO', name: 'Eco Tax' });

    const res = await request(app.getHttpServer())
      .patch(`/tax-types/${createRes.body.id}`)
      .send({ name: 'Eco Updated' })
      .expect(200);

    expect(res.body.name).toBe('Eco Updated');
  });

  // -------------------------
  // DELETE
  // -------------------------
  it('DELETE /tax-types/:id -> should soft delete', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/tax-types')
      .send({ code: 'DEL', name: 'Delete Me' });

    await request(app.getHttpServer())
      .delete(`/tax-types/${createRes.body.id}`)
      .expect(204);

    await request(app.getHttpServer())
      .get(`/tax-types/${createRes.body.id}`)
      .expect(404);
  });
});