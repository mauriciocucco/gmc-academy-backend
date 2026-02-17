import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MaterialCategory } from '../../../common/domain/enums/material-category.enum';
import { UserTypeOrmEntity } from './user.typeorm-entity';

@Entity('materials')
@Index('materials_created_by_idx', ['createdById'])
@Index('materials_published_idx', ['published'])
export class MaterialTypeOrmEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    primaryKeyConstraintName: 'materials_pkey',
  })
  id!: string;

  @Column({ type: 'text' })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({
    name: 'drive_url',
    type: 'text',
  })
  driveUrl!: string;

  @Column({
    type: 'text',
    enum: MaterialCategory,
    default: MaterialCategory.THEORY,
  })
  category!: MaterialCategory;

  @Column({ type: 'boolean', default: true })
  published!: boolean;

  @Column({ name: 'created_by', type: 'bigint' })
  createdById!: string;

  @ManyToOne(() => UserTypeOrmEntity, (user) => user.materials, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'created_by',
    foreignKeyConstraintName: 'materials_created_by_fkey',
  })
  createdBy!: UserTypeOrmEntity;

  @Column({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'now()',
  })
  createdAt!: Date;
}
