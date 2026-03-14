import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MaterialTypeOrmEntity } from './material.typeorm-entity';
import { UserTypeOrmEntity } from './user.typeorm-entity';

@Entity('student_material_access')
@Index(
  'student_material_access_material_student_unique_idx',
  ['materialId', 'studentId'],
  {
    unique: true,
  },
)
@Index(
  'student_material_access_student_viewed_idx',
  ['studentId', 'viewedAt'],
  {
    where: '"viewed_at" IS NOT NULL',
  },
)
export class StudentMaterialAccessTypeOrmEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    primaryKeyConstraintName: 'student_material_access_pkey',
  })
  id!: string;

  @Column({ name: 'material_id', type: 'bigint' })
  materialId!: string;

  @Column({ name: 'student_id', type: 'bigint' })
  studentId!: string;

  @ManyToOne(
    () => MaterialTypeOrmEntity,
    (material) => material.studentAccesses,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'material_id',
    foreignKeyConstraintName: 'student_material_access_material_id_fkey',
  })
  material!: MaterialTypeOrmEntity;

  @ManyToOne(() => UserTypeOrmEntity, (user) => user.materialAccesses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'student_id',
    foreignKeyConstraintName: 'student_material_access_student_id_fkey',
  })
  student!: UserTypeOrmEntity;

  @Column({
    name: 'viewed_at',
    type: 'timestamptz',
    nullable: true,
  })
  viewedAt!: Date | null;
}
