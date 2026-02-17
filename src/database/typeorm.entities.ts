import { CertificateTypeOrmEntity } from './typeorm/entities/certificate.typeorm-entity';
import { ExamAttemptTypeOrmEntity } from './typeorm/entities/exam-attempt.typeorm-entity';
import { ExamQuestionTypeOrmEntity } from './typeorm/entities/exam-question.typeorm-entity';
import { ExamTypeOrmEntity } from './typeorm/entities/exam.typeorm-entity';
import { MaterialTypeOrmEntity } from './typeorm/entities/material.typeorm-entity';
import { UserTypeOrmEntity } from './typeorm/entities/user.typeorm-entity';

export const TYPEORM_ENTITIES = [
  UserTypeOrmEntity,
  MaterialTypeOrmEntity,
  ExamTypeOrmEntity,
  ExamQuestionTypeOrmEntity,
  ExamAttemptTypeOrmEntity,
  CertificateTypeOrmEntity,
];
