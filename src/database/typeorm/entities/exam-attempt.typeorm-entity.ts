import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ExamTypeOrmEntity } from './exam.typeorm-entity';
import { UserTypeOrmEntity } from './user.typeorm-entity';
import { CertificateTypeOrmEntity } from './certificate.typeorm-entity';

export type ExamAnswerPayload = {
  questionId: string;
  optionId: string;
};

@Entity('exam_attempts')
@Index('exam_attempts_exam_id_idx', ['examId'])
@Index('exam_attempts_student_id_idx', ['studentId'])
@Index('exam_attempts_student_created_at_idx', ['studentId', 'createdAt'])
export class ExamAttemptTypeOrmEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    primaryKeyConstraintName: 'exam_attempts_pkey',
  })
  id!: string;

  @Column({ name: 'exam_id', type: 'bigint' })
  examId!: string;

  @Column({ name: 'student_id', type: 'bigint' })
  studentId!: string;

  @ManyToOne(() => ExamTypeOrmEntity, (exam) => exam.attempts, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'exam_id',
    foreignKeyConstraintName: 'exam_attempts_exam_id_fkey',
  })
  exam!: ExamTypeOrmEntity;

  @ManyToOne(() => UserTypeOrmEntity, (user) => user.attempts, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'student_id',
    foreignKeyConstraintName: 'exam_attempts_student_id_fkey',
  })
  student!: UserTypeOrmEntity;

  @Column({
    type: 'numeric',
    precision: 5,
    scale: 2,
  })
  score!: string;

  @Column({ type: 'boolean' })
  passed!: boolean;

  @Column({
    name: 'answers_json',
    type: 'jsonb',
  })
  answersJson!: ExamAnswerPayload[];

  @Column({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'now()',
  })
  createdAt!: Date;

  @OneToOne(
    () => CertificateTypeOrmEntity,
    (certificate) => certificate.examAttempt,
  )
  certificate?: CertificateTypeOrmEntity;
}
