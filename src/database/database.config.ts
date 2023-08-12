import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { config } from 'dotenv';
config();

export function createTypeOrmDatabaseConfig(
  config: PostgresConnectionOptions,
): PostgresConnectionOptions {
  return {
    type: 'postgres',
    host: process.env.POSTGRES_HOST,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE || '',
    synchronize: true,
    logger: 'advanced-console',
    migrations: ['dist/migrations/*{.ts,.js}'],
    migrationsTableName: 'migrations_typeorm',
    migrationsRun: false,
    logging: false,
    ...config,
  };
}