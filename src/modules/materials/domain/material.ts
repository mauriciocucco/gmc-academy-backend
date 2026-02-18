import { MaterialLinkSource } from '../../../common/domain/enums/material-link-source.enum';

export interface MaterialCategory {
  id: string;
  key: string;
  name: string;
}

export interface MaterialLink {
  id: string;
  sourceType: MaterialLinkSource;
  url: string;
  position: number;
}

export interface Material {
  id: string;
  title: string;
  description: string;
  published: boolean;
  /** null when the caller is an admin (no student context) */
  viewed: boolean | null;
  category: MaterialCategory;
  links: MaterialLink[];
  createdById: string;
  createdAt: Date;
}
