import { BadRequestException } from '@nestjs/common';
import { AdminExamConfigQuestionDto } from '../dto/admin-exam-config.dto';

export function validateAdminExamConfigQuestions(
  questions: AdminExamConfigQuestionDto[],
): void {
  if (questions.length === 0) {
    throw new BadRequestException('Exam must contain at least one question');
  }

  const positions = new Set<number>();
  const questionIds = new Set<string>();

  for (const question of questions) {
    const questionId = question.id?.trim();
    if (questionId) {
      if (questionIds.has(questionId)) {
        throw new BadRequestException(
          `Question "${questionId}" is duplicated in the payload`,
        );
      }
      questionIds.add(questionId);
    }

    if (positions.has(question.position)) {
      throw new BadRequestException(
        `Question position "${question.position}" is duplicated`,
      );
    }
    positions.add(question.position);

    if (question.options.length < 2) {
      throw new BadRequestException(
        `Question "${question.text}" must contain at least 2 options`,
      );
    }

    const optionIds = new Set<string>();
    let correctOptions = 0;

    for (const option of question.options) {
      const optionId = option.id?.trim();
      if (optionId) {
        if (optionIds.has(optionId)) {
          throw new BadRequestException(
            `Question "${question.text}" has duplicated option "${optionId}"`,
          );
        }
        optionIds.add(optionId);
      }

      if (option.isCorrect) {
        correctOptions += 1;
      }
    }

    if (correctOptions !== 1) {
      throw new BadRequestException(
        `Question "${question.text}" must contain exactly 1 correct option`,
      );
    }
  }
}
