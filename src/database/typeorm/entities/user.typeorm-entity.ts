import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MaterialTypeOrmEntity } from './material.typeorm-entity';
import { ExamAttemptTypeOrmEntity } from './exam-attempt.typeorm-entity';
import { CertificateTypeOrmEntity } from './certificate.typeorm-entity';
import { UserRole } from '../../../common/domain/enums/user-role.enum';
import { StudentMaterialAccessTypeOrmEntity } from './student-material-access.typeorm-entity';

@Entity('users')
@Index('users_email_unique_idx', ['email'], { unique: true })
export class UserTypeOrmEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    primaryKeyConstraintName: 'users_pkey',
  })
  id!: string;

  @Column({ type: 'text' })
  email!: string;

  @Column({ name: 'password_hash', type: 'text' })
  passwordHash!: string;

  @Column({ name: 'full_name', type: 'text' })
  fullName!: string;

  @Column({ type: 'text', nullable: true })
  phone!: string | null;

  @Column({
    type: 'text',
    enum: UserRole,
  })
  role!: UserRole;

  @Column({
    name: 'refresh_token_hash',
    type: 'text',
    nullable: true,
  })
  refreshTokenHash!: string | null;

  @Column({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'now()',
  })
  createdAt!: Date;

  @OneToMany(() => MaterialTypeOrmEntity, (material) => material.createdBy)
  materials!: MaterialTypeOrmEntity[];

  @OneToMany(() => ExamAttemptTypeOrmEntity, (attempt) => attempt.student)
  attempts!: ExamAttemptTypeOrmEntity[];

  @OneToMany(
    () => CertificateTypeOrmEntity,
    (certificate) => certificate.student,
  )
  certificates!: CertificateTypeOrmEntity[];

  @OneToMany(
    () => StudentMaterialAccessTypeOrmEntity,
    (materialAccess) => materialAccess.student,
  )
  materialAccesses!: StudentMaterialAccessTypeOrmEntity[];

  @OneToMany(
    () => StudentMaterialAccessTypeOrmEntity,
    (materialAccess) => materialAccess.enabledBy,
  )
  materialAccessManaged!: StudentMaterialAccessTypeOrmEntity[];
}
