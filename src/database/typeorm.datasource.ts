import 'dotenv/config';
import { DataSource } from 'typeorm';
import { TYPEORM_ENTITIES } from './typeorm.entities';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: TYPEORM_ENTITIES,
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
});

export default AppDataSource;
