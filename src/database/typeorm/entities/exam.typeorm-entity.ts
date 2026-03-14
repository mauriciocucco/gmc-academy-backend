import {
  Check,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ExamQuestionTypeOrmEntity } from './exam-question.typeorm-entity';
import { ExamAttemptTypeOrmEntity } from './exam-attempt.typeorm-entity';
import { UserTypeOrmEntity } from './user.typeorm-entity';

@Entity('exams')
@Index('exams_is_active_idx', ['isActive'])
@Check('exams_pass_score_check', `"pass_score" >= 1 AND "pass_score" <= 100`)
export class ExamTypeOrmEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    primaryKeyConstraintName: 'exams_pkey',
  })
  id!: string;

  @Column({ type: 'text' })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({
    name: 'pass_score',
    type: 'numeric',
    precision: 5,
    scale: 2,
    default: 70,
  })
  passScore!: string;

  @Column({
    name: 'is_active',
    type: 'boolean',
    default: false,
  })
  isActive!: boolean;

  @Column({ name: 'updated_by', type: 'bigint', nullable: true })
  updatedById!: string | null;

  @ManyToOne(() => UserTypeOrmEntity, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({
    name: 'updated_by',
    foreignKeyConstraintName: 'exams_updated_by_fkey',
  })
  updatedBy!: UserTypeOrmEntity | null;

  @Column({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'now()',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
  })
  updatedAt!: Date;

  @OneToMany(() => ExamQuestionTypeOrmEntity, (question) => question.exam, {
    cascade: false,
  })
  questions!: ExamQuestionTypeOrmEntity[];

  @OneToMany(() => ExamAttemptTypeOrmEntity, (attempt) => attempt.exam)
  attempts!: ExamAttemptTypeOrmEntity[];
}
