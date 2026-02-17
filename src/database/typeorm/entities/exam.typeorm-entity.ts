import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ExamQuestionTypeOrmEntity } from './exam-question.typeorm-entity';
import { ExamAttemptTypeOrmEntity } from './exam-attempt.typeorm-entity';

@Entity('exams')
@Index('exams_is_active_idx', ['isActive'])
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

  @Column({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'now()',
  })
  createdAt!: Date;

  @OneToMany(() => ExamQuestionTypeOrmEntity, (question) => question.exam, {
    cascade: false,
  })
  questions!: ExamQuestionTypeOrmEntity[];

  @OneToMany(() => ExamAttemptTypeOrmEntity, (attempt) => attempt.exam)
  attempts!: ExamAttemptTypeOrmEntity[];
}
