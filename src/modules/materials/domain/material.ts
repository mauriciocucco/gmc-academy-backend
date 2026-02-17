import { MaterialCategory } from '../../../common/domain/enums/material-category.enum';

export interface Material {
  id: string;
  title: string;
  description: string;
  driveUrl: string;
  category: MaterialCategory;
  published: boolean;
  createdById: string;
  createdAt: Date;
}
