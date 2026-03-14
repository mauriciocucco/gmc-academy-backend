import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserTypeOrmEntity } from './user.typeorm-entity';

@Entity('student_admin_notes')
@Index('student_admin_notes_updated_by_idx', ['updatedById'])
export class StudentAdminNoteTypeOrmEntity {
  @PrimaryColumn({
    name: 'student_id',
    type: 'bigint',
    primaryKeyConstraintName: 'student_admin_notes_pkey',
  })
  studentId!: string;

  @OneToOne(() => UserTypeOrmEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'student_id',
    foreignKeyConstraintName: 'student_admin_notes_student_id_fkey',
  })
  student!: UserTypeOrmEntity;

  @Column({ type: 'text' })
  content!: string;

  @Column({ name: 'updated_by', type: 'bigint' })
  updatedById!: string;

  @ManyToOne(() => UserTypeOrmEntity, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'updated_by',
    foreignKeyConstraintName: 'student_admin_notes_updated_by_fkey',
  })
  updatedBy!: UserTypeOrmEntity;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
  })
  updatedAt!: Date;
}
