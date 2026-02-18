import { MaterialLinkSource } from '../../../../common/domain/enums/material-link-source.enum';

export class MaterialResponseDto {
  id!: string;
  title!: string;
  description!: string;
  published!: boolean;
  publishedAt!: string;
  createdById!: string;
  category!: {
    id: string;
    key: string;
    name: string;
  };
  links!: Array<{
    id: string;
    sourceType: MaterialLinkSource;
    url: string;
    position: number;
  }>;
}

export class MaterialCategoryResponseDto {
  id!: string;
  key!: string;
  name!: string;
}
