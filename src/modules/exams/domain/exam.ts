export type ExamQuestionOption = {
  id: string;
  label: string;
};

export interface ExamQuestion {
  id: string;
  questionText: string;
  options: ExamQuestionOption[];
  correctOption: string;
  position: number;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  passScore: number;
  isActive: boolean;
  createdAt: Date;
  questions: ExamQuestion[];
}
