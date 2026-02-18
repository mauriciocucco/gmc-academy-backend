export class ExamSummaryResponseDto {
  id!: string;
  title!: string;
  description!: string;
  passScore!: number;
  isActive!: boolean;
  questionCount!: number;
  createdAt!: string;
}

export class ExamDetailResponseDto {
  id!: string;
  title!: string;
  description!: string;
  passScore!: number;
  isActive!: boolean;
  createdAt!: string;
  questions!: Array<{
    id: string;
    questionText: string;
    options: Array<{ id: string; label: string }>;
    correctOption: string;
    position: number;
  }>;
}
