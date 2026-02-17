export class ActiveExamResponseDto {
  id!: string;
  title!: string;
  description!: string;
  passScore!: number;
  questions!: Array<{
    id: string;
    text: string;
    options: Array<{ id: string; label: string }>;
    position: number;
  }>;
}
