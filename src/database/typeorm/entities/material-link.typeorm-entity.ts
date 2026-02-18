import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MaterialTypeOrmEntity } from './material.typeorm-entity';
import { MaterialLinkSource } from '../../../common/domain/enums/material-link-source.enum';

@Entity('material_links')
@Index('material_links_material_id_idx', ['materialId'])
@Index('material_links_material_position_idx', ['materialId', 'position'])
export class MaterialLinkTypeOrmEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    primaryKeyConstraintName: 'material_links_pkey',
  })
  id!: string;

  @Column({ name: 'material_id', type: 'bigint' })
  materialId!: string;

  @ManyToOne(() => MaterialTypeOrmEntity, (material) => material.links, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'material_id',
    foreignKeyConstraintName: 'material_links_material_id_fkey',
  })
  material!: MaterialTypeOrmEntity;

  @Column({
    name: 'source_type',
    type: 'text',
    enum: MaterialLinkSource,
  })
  sourceType!: MaterialLinkSource;

  @Column({ type: 'text' })
  url!: string;

  @Column({ type: 'integer', default: 0 })
  position!: number;

  @Column({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'now()',
  })
  createdAt!: Date;
}
