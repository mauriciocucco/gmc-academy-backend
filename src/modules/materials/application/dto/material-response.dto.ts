import { MaterialCategory } from '../../../../common/domain/enums/material-category.enum';

export class MaterialResponseDto {
  id!: string;
  title!: string;
  description!: string;
  driveUrl!: string;
  category!: MaterialCategory;
  published!: boolean;
  publishedAt!: string;
  createdById!: string;
}
