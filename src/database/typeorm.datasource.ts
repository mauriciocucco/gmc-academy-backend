import 'dotenv/config';
import { DataSource } from 'typeorm';
import { TYPEORM_ENTITIES } from './typeorm.entities';

const useSsl = (process.env.DB_SSL ?? 'false').toLowerCase() === 'true';
const rejectUnauthorized =
  (process.env.DB_SSL_REJECT_UNAUTHORIZED ?? 'true').toLowerCase() === 'true';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: useSsl ? { rejectUnauthorized } : false,
  entities: TYPEORM_ENTITIES,
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
});

export default AppDataSource;
