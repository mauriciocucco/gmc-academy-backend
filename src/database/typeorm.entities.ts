import { CertificateTypeOrmEntity } from './typeorm/entities/certificate.typeorm-entity';
import { ExamAttemptTypeOrmEntity } from './typeorm/entities/exam-attempt.typeorm-entity';
import { ExamQuestionTypeOrmEntity } from './typeorm/entities/exam-question.typeorm-entity';
import { ExamTypeOrmEntity } from './typeorm/entities/exam.typeorm-entity';
import { MaterialCategoryTypeOrmEntity } from './typeorm/entities/material-category.typeorm-entity';
import { MaterialLinkTypeOrmEntity } from './typeorm/entities/material-link.typeorm-entity';
import { StudentAdminNoteTypeOrmEntity } from './typeorm/entities/student-admin-note.typeorm-entity';
import { StudentMaterialAssignmentTypeOrmEntity } from './typeorm/entities/student-material-assignment.typeorm-entity';
import { MaterialTypeOrmEntity } from './typeorm/entities/material.typeorm-entity';
import { StudentMaterialAccessTypeOrmEntity } from './typeorm/entities/student-material-access.typeorm-entity';
import { UserTypeOrmEntity } from './typeorm/entities/user.typeorm-entity';

export const TYPEORM_ENTITIES = [
  UserTypeOrmEntity,
  MaterialCategoryTypeOrmEntity,
  MaterialTypeOrmEntity,
  MaterialLinkTypeOrmEntity,
  StudentAdminNoteTypeOrmEntity,
  StudentMaterialAssignmentTypeOrmEntity,
  StudentMaterialAccessTypeOrmEntity,
  ExamTypeOrmEntity,
  ExamQuestionTypeOrmEntity,
  ExamAttemptTypeOrmEntity,
  CertificateTypeOrmEntity,
];
