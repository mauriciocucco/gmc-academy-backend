import {
  Check,
  Column,
  Entity,
  Index,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MaterialTypeOrmEntity } from './material.typeorm-entity';
import { ExamAttemptTypeOrmEntity } from './exam-attempt.typeorm-entity';
import { CertificateTypeOrmEntity } from './certificate.typeorm-entity';
import { UserRole } from '../../../common/domain/enums/user-role.enum';
import { StudentMaterialAccessTypeOrmEntity } from './student-material-access.typeorm-entity';
import { StudentMaterialAssignmentTypeOrmEntity } from './student-material-assignment.typeorm-entity';

@Entity('users')
@Index('users_email_unique_idx', ['email'], { unique: true })
@Index('users_phone_unique_idx', ['phone'], {
  unique: true,
  where: '"phone" IS NOT NULL',
})
@Index('users_blocked_at_idx', ['blockedAt'])
@Check('users_role_check', `"role" IN ('admin', 'student')`)
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
    name: 'profile_photo_url',
    type: 'text',
    nullable: true,
  })
  profilePhotoUrl!: string | null;

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
    name: 'must_change_password',
    type: 'boolean',
    default: false,
  })
  mustChangePassword!: boolean;

  @Column({
    name: 'blocked_at',
    type: 'timestamptz',
    nullable: true,
  })
  blockedAt!: Date | null;

  @Column({
    name: 'blocked_by_user_id',
    type: 'bigint',
    nullable: true,
  })
  blockedByUserId!: string | null;

  @Column({
    name: 'block_reason',
    type: 'text',
    nullable: true,
  })
  blockReason!: string | null;

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

  @OneToOne(
    () => CertificateTypeOrmEntity,
    (certificate) => certificate.student,
  )
  certificate?: CertificateTypeOrmEntity;

  @OneToMany(
    () => StudentMaterialAccessTypeOrmEntity,
    (materialAccess) => materialAccess.student,
  )
  materialAccesses!: StudentMaterialAccessTypeOrmEntity[];

  @OneToMany(
    () => StudentMaterialAssignmentTypeOrmEntity,
    (materialAssignment) => materialAssignment.student,
  )
  materialAssignments!: StudentMaterialAssignmentTypeOrmEntity[];
}
