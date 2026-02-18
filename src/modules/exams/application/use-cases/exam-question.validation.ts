import { BadRequestException } from '@nestjs/common';
import { ManageExamQuestionDto } from '../dto/manage-exam.dto';

export function validateExamQuestions(
  questions: ManageExamQuestionDto[],
): void {
  if (questions.length === 0) {
    throw new BadRequestException('Exam must contain at least one question');
  }

  for (const question of questions) {
    const optionIds = new Set(question.options.map((option) => option.id));
    if (!optionIds.has(question.correctOption)) {
      throw new BadRequestException(
        `Question "${question.questionText}" has invalid correctOption`,
      );
    }
  }
}
