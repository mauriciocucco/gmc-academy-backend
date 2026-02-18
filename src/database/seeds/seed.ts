import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { AppDataSource } from '../typeorm.datasource';
import { UserTypeOrmEntity } from '../typeorm/entities/user.typeorm-entity';
import { UserRole } from '../../common/domain/enums/user-role.enum';
import { MaterialTypeOrmEntity } from '../typeorm/entities/material.typeorm-entity';
import { MaterialCategoryTypeOrmEntity } from '../typeorm/entities/material-category.typeorm-entity';
import { MaterialLinkTypeOrmEntity } from '../typeorm/entities/material-link.typeorm-entity';
import { MaterialLinkSource } from '../../common/domain/enums/material-link-source.enum';
import { StudentMaterialAccessTypeOrmEntity } from '../typeorm/entities/student-material-access.typeorm-entity';
import { ExamTypeOrmEntity } from '../typeorm/entities/exam.typeorm-entity';
import { ExamQuestionTypeOrmEntity } from '../typeorm/entities/exam-question.typeorm-entity';
import { ExamAttemptTypeOrmEntity } from '../typeorm/entities/exam-attempt.typeorm-entity';
import { CertificateTypeOrmEntity } from '../typeorm/entities/certificate.typeorm-entity';

async function runSeed(): Promise<void> {
  await AppDataSource.initialize();

  try {
    const userRepository = AppDataSource.getRepository(UserTypeOrmEntity);
    const categoryRepository = AppDataSource.getRepository(
      MaterialCategoryTypeOrmEntity,
    );
    const materialRepository = AppDataSource.getRepository(
      MaterialTypeOrmEntity,
    );
    const linkRepository = AppDataSource.getRepository(
      MaterialLinkTypeOrmEntity,
    );
    const accessRepository = AppDataSource.getRepository(
      StudentMaterialAccessTypeOrmEntity,
    );
    const examRepository = AppDataSource.getRepository(ExamTypeOrmEntity);
    const questionRepository = AppDataSource.getRepository(
      ExamQuestionTypeOrmEntity,
    );
    const attemptRepository = AppDataSource.getRepository(
      ExamAttemptTypeOrmEntity,
    );
    const certificateRepository = AppDataSource.getRepository(
      CertificateTypeOrmEntity,
    );

    const rounds = Number(process.env.BCRYPT_ROUNDS ?? 12);
    const basePassword = process.env.SEED_DEFAULT_PASSWORD ?? 'ChangeMe123!';
    const passwordHash = await bcrypt.hash(basePassword, rounds);

    let admin = await userRepository.findOne({
      where: { email: 'admin@gmc.com' },
    });
    if (!admin) {
      admin = await userRepository.save(
        userRepository.create({
          email: 'admin@gmc.com',
          fullName: 'Administrador GMC',
          phone: '+5491111111111',
          role: UserRole.ADMIN,
          passwordHash,
        }),
      );
    }

    let student = await userRepository.findOne({
      where: { email: 'student@gmc.com' },
    });
    if (!student) {
      student = await userRepository.save(
        userRepository.create({
          email: 'student@gmc.com',
          fullName: 'Alumno Demo GMC',
          phone: '+5491122222222',
          role: UserRole.STUDENT,
          passwordHash,
        }),
      );
    }

    const ensureCategory = async (
      key: string,
      name: string,
    ): Promise<MaterialCategoryTypeOrmEntity> => {
      const existing = await categoryRepository.findOne({ where: { key } });
      if (existing) {
        return existing;
      }

      return categoryRepository.save(
        categoryRepository.create({
          key,
          name,
        }),
      );
    };

    const theoryCategory = await ensureCategory('theory', 'Theory');
    const signsCategory = await ensureCategory('signs', 'Signs');
    const mockCategory = await ensureCategory('mock', 'Mock');

    const ensureMaterial = async (payload: {
      title: string;
      description: string;
      categoryId: string;
      links: Array<{ sourceType: MaterialLinkSource; url: string }>;
    }): Promise<MaterialTypeOrmEntity> => {
      let material = await materialRepository.findOne({
        where: { title: payload.title },
      });
      if (!material) {
        material = await materialRepository.save(
          materialRepository.create({
            title: payload.title,
            description: payload.description,
            categoryId: payload.categoryId,
            createdById: admin.id,
            published: true,
          }),
        );
      }

      const linksCount = await linkRepository.count({
        where: { materialId: material.id },
      });
      if (linksCount === 0) {
        await linkRepository.save(
          payload.links.map((link, index) =>
            linkRepository.create({
              materialId: material.id,
              sourceType: link.sourceType,
              url: link.url,
              position: index,
            }),
          ),
        );
      }

      await accessRepository.upsert(
        {
          materialId: material.id,
          studentId: student.id,
          enabled: true,
          enabledById: admin.id,
          enabledAt: new Date(),
        },
        ['materialId', 'studentId'],
      );

      return material;
    };

    await ensureMaterial({
      title: 'Road signs handbook',
      description: 'Core material for regulatory and preventive road signs.',
      categoryId: signsCategory.id,
      links: [
        {
          sourceType: MaterialLinkSource.DRIVE,
          url: 'https://drive.google.com/file/d/1manual-senales-gmc/view',
        },
        {
          sourceType: MaterialLinkSource.YOUTUBE,
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        },
      ],
    });

    await ensureMaterial({
      title: 'Right-of-way summary',
      description: 'Quick guide for intersections, roundabouts and avenues.',
      categoryId: theoryCategory.id,
      links: [
        {
          sourceType: MaterialLinkSource.DRIVE,
          url: 'https://drive.google.com/file/d/1prioridad-paso-gmc/view',
        },
      ],
    });

    await ensureMaterial({
      title: 'Mock exam pack 1',
      description: 'Question bank similar to municipal exam formats.',
      categoryId: mockCategory.id,
      links: [
        {
          sourceType: MaterialLinkSource.DRIVE,
          url: 'https://drive.google.com/file/d/1simulacro-gmc-01/view',
        },
      ],
    });

    let exam = await examRepository.findOne({ where: { isActive: true } });
    if (!exam) {
      exam = await examRepository.save(
        examRepository.create({
          title: 'GMC Theory Mock Exam',
          description: 'Practice exam for driving license preparation',
          passScore: '70',
          isActive: true,
        }),
      );
    }

    const questionCount = await questionRepository.count({
      where: { examId: exam.id },
    });
    if (questionCount === 0) {
      await questionRepository.save([
        questionRepository.create({
          examId: exam.id,
          questionText: 'What documents must a driver carry?',
          optionsJson: [
            { id: 'a', label: 'Only driving license' },
            {
              id: 'b',
              label:
                'License, registration, insurance, and valid vehicle inspection',
            },
            { id: 'c', label: 'License and fuel receipt' },
          ],
          correctOption: 'b',
          position: 1,
        }),
        questionRepository.create({
          examId: exam.id,
          questionText: 'At an uncontrolled intersection, who has priority?',
          optionsJson: [
            { id: 'a', label: 'Vehicle coming from the right' },
            { id: 'b', label: 'Largest vehicle' },
            { id: 'c', label: 'Who accelerates first' },
          ],
          correctOption: 'a',
          position: 2,
        }),
      ]);
    }

    const studentAttemptCount = await attemptRepository.count({
      where: {
        studentId: student.id,
        examId: exam.id,
      },
    });

    if (studentAttemptCount === 0) {
      const attempt = await attemptRepository.save(
        attemptRepository.create({
          examId: exam.id,
          studentId: student.id,
          score: '80',
          passed: true,
          answersJson: [
            { questionId: '1', optionId: 'b' },
            { questionId: '2', optionId: 'a' },
          ],
        }),
      );

      await certificateRepository.save(
        certificateRepository.create({
          studentId: student.id,
          examAttemptId: attempt.id,
          certificateCode: `GMC-${new Date().getUTCFullYear()}-SEED0001`,
          pdfUrl: null,
        }),
      );
    }

    console.log('Seed completed successfully.');
    console.log('Admin: admin@gmc.com');
    console.log('Student: student@gmc.com');
    console.log(`Password: ${basePassword}`);
  } finally {
    await AppDataSource.destroy();
  }
}

runSeed().catch(async (error) => {
  console.error('Seed failed:', error);
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
  process.exit(1);
});
