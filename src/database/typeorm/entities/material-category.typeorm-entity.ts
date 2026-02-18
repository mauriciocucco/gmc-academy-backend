import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MaterialTypeOrmEntity } from './material.typeorm-entity';

@Entity('material_categories')
@Index('material_categories_key_unique_idx', ['key'], { unique: true })
export class MaterialCategoryTypeOrmEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    primaryKeyConstraintName: 'material_categories_pkey',
  })
  id!: string;

  @Column({ type: 'text' })
  key!: string;

  @Column({ type: 'text' })
  name!: string;

  @Column({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'now()',
  })
  createdAt!: Date;

  @OneToMany(() => MaterialTypeOrmEntity, (material) => material.category)
  materials!: MaterialTypeOrmEntity[];
}
