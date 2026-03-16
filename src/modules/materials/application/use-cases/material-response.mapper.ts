import { Material } from '../../domain/material';
import { MaterialResponseDto } from '../dto/material-response.dto';

export function toMaterialResponseDto(material: Material): MaterialResponseDto {
  return {
    id: material.id,
    title: material.title,
    description: material.description,
    published: material.published,
    publishedAt: material.createdAt.toISOString().slice(0, 10),
    viewed: material.viewed,
    createdById: material.createdById,
    category: {
      id: material.category.id,
      key: material.category.key,
      name: material.category.name,
    },
    links: material.links
      .sort((a, b) => a.position - b.position)
      .map((link) => ({
        id: link.id,
        sourceType: link.sourceType,
        url: link.url,
        label: link.label,
        position: link.position,
      })),
  };
}
