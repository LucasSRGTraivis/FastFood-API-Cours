import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import type { PrismaClientOptions } from '@prisma/client/runtime/library';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private pool: Pool;

  constructor() {
    const pool = new Pool({
      connectionString:
        process.env.DATABASE_URL ||
        'postgresql://nexuseats:nexuseats_dev@localhost:5432/nexuseats',
    });
    const adapter = new PrismaPg(pool);
    const options: PrismaClientOptions = {
      adapter,
      log: ['query', 'info', 'warn', 'error'],
    };
    super(options);
    this.pool = pool;
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool.end();
  }
}
