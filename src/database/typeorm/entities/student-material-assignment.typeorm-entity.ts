import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MaterialTypeOrmEntity } from './material.typeorm-entity';
import { UserTypeOrmEntity } from './user.typeorm-entity';

@Entity('student_material_assignments')
@Index(
  'student_material_assignments_student_material_unique_idx',
  ['studentId', 'materialId'],
  {
    unique: true,
  },
)
@Index(
  'student_material_assignments_student_position_unique_idx',
  ['studentId', 'position'],
  {
    unique: true,
  },
)
@Index('student_material_assignments_student_idx', ['studentId'])
export class StudentMaterialAssignmentTypeOrmEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    primaryKeyConstraintName: 'student_material_assignments_pkey',
  })
  id!: string;

  @Column({ name: 'student_id', type: 'bigint' })
  studentId!: string;

  @Column({ name: 'material_id', type: 'bigint' })
  materialId!: string;

  @Column({ type: 'integer' })
  position!: number;

  @ManyToOne(() => UserTypeOrmEntity, (user) => user.materialAssignments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'student_id',
    foreignKeyConstraintName: 'student_material_assignments_student_id_fkey',
  })
  student!: UserTypeOrmEntity;

  @ManyToOne(
    () => MaterialTypeOrmEntity,
    (material) => material.studentAssignments,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'material_id',
    foreignKeyConstraintName: 'student_material_assignments_material_id_fkey',
  })
  material!: MaterialTypeOrmEntity;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
  })
  updatedAt!: Date;
}
