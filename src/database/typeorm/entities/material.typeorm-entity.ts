import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserTypeOrmEntity } from './user.typeorm-entity';
import { MaterialCategoryTypeOrmEntity } from './material-category.typeorm-entity';
import { MaterialLinkTypeOrmEntity } from './material-link.typeorm-entity';
import { StudentMaterialAccessTypeOrmEntity } from './student-material-access.typeorm-entity';

@Entity('materials')
@Index('materials_created_by_idx', ['createdById'])
@Index('materials_published_idx', ['published'])
@Index('materials_category_id_idx', ['categoryId'])
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

  @Column({ type: 'boolean', default: true })
  published!: boolean;

  @Column({
    name: 'category_id',
    type: 'bigint',
  })
  categoryId!: string;

  @ManyToOne(
    () => MaterialCategoryTypeOrmEntity,
    (category) => category.materials,
    {
      onDelete: 'RESTRICT',
    },
  )
  @JoinColumn({
    name: 'category_id',
    foreignKeyConstraintName: 'materials_category_id_fkey',
  })
  category!: MaterialCategoryTypeOrmEntity;

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

  @OneToMany(() => MaterialLinkTypeOrmEntity, (link) => link.material)
  links!: MaterialLinkTypeOrmEntity[];

  @OneToMany(
    () => StudentMaterialAccessTypeOrmEntity,
    (studentAccess) => studentAccess.material,
  )
  studentAccesses!: StudentMaterialAccessTypeOrmEntity[];
}
