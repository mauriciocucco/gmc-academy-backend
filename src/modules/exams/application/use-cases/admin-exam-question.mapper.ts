import { ExamQuestion } from '../../domain/exam';
import { AdminExamConfigResponseQuestionDto } from '../dto/admin-exam-config.dto';

export function toAdminExamQuestionResponseDto(
  question: ExamQuestion,
): AdminExamConfigResponseQuestionDto {
  return {
    id: question.id,
    text: question.questionText,
    position: question.position,
    options: question.options.map((option) => ({
      id: option.id,
      label: option.label,
      isCorrect: option.id === question.correctOption,
    })),
  };
}
