import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserTypeOrmEntity } from './user.typeorm-entity';
import { ExamAttemptTypeOrmEntity } from './exam-attempt.typeorm-entity';

@Entity('certificates')
@Index('certificates_student_id_idx', ['studentId'])
@Index('certificates_exam_attempt_id_idx', ['examAttemptId'])
@Index('certificates_certificate_code_unique_idx', ['certificateCode'], {
  unique: true,
})
export class CertificateTypeOrmEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    primaryKeyConstraintName: 'certificates_pkey',
  })
  id!: string;

  @Column({ name: 'student_id', type: 'bigint' })
  studentId!: string;

  @Column({ name: 'exam_attempt_id', type: 'bigint' })
  examAttemptId!: string;

  @ManyToOne(() => UserTypeOrmEntity, (user) => user.certificates, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'student_id',
    foreignKeyConstraintName: 'certificates_student_id_fkey',
  })
  student!: UserTypeOrmEntity;

  @OneToOne(() => ExamAttemptTypeOrmEntity, (attempt) => attempt.certificate, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'exam_attempt_id',
    foreignKeyConstraintName: 'certificates_exam_attempt_id_fkey',
  })
  examAttempt!: ExamAttemptTypeOrmEntity;

  @Column({
    name: 'certificate_code',
    type: 'text',
  })
  certificateCode!: string;

  @Column({
    name: 'pdf_path',
    type: 'text',
    nullable: true,
  })
  pdfPath!: string | null;

  @Column({
    name: 'issued_at',
    type: 'timestamptz',
    default: () => 'now()',
  })
  issuedAt!: Date;
}
