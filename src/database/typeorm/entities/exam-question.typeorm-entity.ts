import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ExamTypeOrmEntity } from './exam.typeorm-entity';

export type ExamQuestionOption = {
  id: string;
  label: string;
};

@Entity('exam_questions')
@Index('exam_questions_exam_id_idx', ['examId'])
@Index('exam_questions_exam_position_unique_idx', ['examId', 'position'], {
  unique: true,
})
export class ExamQuestionTypeOrmEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    primaryKeyConstraintName: 'exam_questions_pkey',
  })
  id!: string;

  @Column({ name: 'exam_id', type: 'bigint' })
  examId!: string;

  @ManyToOne(() => ExamTypeOrmEntity, (exam) => exam.questions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'exam_id',
    foreignKeyConstraintName: 'exam_questions_exam_id_fkey',
  })
  exam!: ExamTypeOrmEntity;

  @Column({
    name: 'question_text',
    type: 'text',
  })
  questionText!: string;

  @Column({
    name: 'options_json',
    type: 'jsonb',
  })
  optionsJson!: ExamQuestionOption[];

  @Column({
    name: 'correct_option',
    type: 'text',
  })
  correctOption!: string;

  @Column({ type: 'integer' })
  position!: number;
}
