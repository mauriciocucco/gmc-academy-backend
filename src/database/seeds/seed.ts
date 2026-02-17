import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { AppDataSource } from '../typeorm.datasource';
import { UserTypeOrmEntity } from '../typeorm/entities/user.typeorm-entity';
import { UserRole } from '../../common/domain/enums/user-role.enum';
import { MaterialTypeOrmEntity } from '../typeorm/entities/material.typeorm-entity';
import { MaterialCategory } from '../../common/domain/enums/material-category.enum';
import { ExamTypeOrmEntity } from '../typeorm/entities/exam.typeorm-entity';
import { ExamQuestionTypeOrmEntity } from '../typeorm/entities/exam-question.typeorm-entity';
import { ExamAttemptTypeOrmEntity } from '../typeorm/entities/exam-attempt.typeorm-entity';
import { CertificateTypeOrmEntity } from '../typeorm/entities/certificate.typeorm-entity';

async function runSeed(): Promise<void> {
  await AppDataSource.initialize();

  try {
    const userRepository = AppDataSource.getRepository(UserTypeOrmEntity);
    const materialRepository = AppDataSource.getRepository(
      MaterialTypeOrmEntity,
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
          role: UserRole.STUDENT,
          passwordHash,
        }),
      );
    }

    const materialCount = await materialRepository.count();
    if (materialCount === 0) {
      await materialRepository.save([
        materialRepository.create({
          title: 'Manual de senales viales',
          description:
            'Material base para reconocer senales reglamentarias y preventivas.',
          driveUrl: 'https://drive.google.com/file/d/1manual-senales-gmc/view',
          category: MaterialCategory.SIGNS,
          createdById: admin.id,
          published: true,
        }),
        materialRepository.create({
          title: 'Resumen de prioridad de paso',
          description:
            'Guia rapida de normas para cruces, rotondas y avenidas.',
          driveUrl: 'https://drive.google.com/file/d/1prioridad-paso-gmc/view',
          category: MaterialCategory.THEORY,
          createdById: admin.id,
          published: true,
        }),
        materialRepository.create({
          title: 'Simulacro de examen 1',
          description: 'Banco de preguntas tipo examen municipal.',
          driveUrl: 'https://drive.google.com/file/d/1simulacro-gmc-01/view',
          category: MaterialCategory.MOCK,
          createdById: admin.id,
          published: true,
        }),
      ]);
    }

    let exam = await examRepository.findOne({ where: { isActive: true } });
    if (!exam) {
      exam = await examRepository.save(
        examRepository.create({
          title: 'Simulacro teorico GMC',
          description: 'Examen de practica para licencia de conducir',
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
          questionText: 'Que documentacion debe llevar un conductor?',
          optionsJson: [
            { id: 'a', label: 'Solo licencia de conducir' },
            { id: 'b', label: 'Licencia, cedula, seguro y VTV vigente' },
            { id: 'c', label: 'Licencia y comprobante de combustible' },
          ],
          correctOption: 'b',
          position: 1,
        }),
        questionRepository.create({
          examId: exam.id,
          questionText:
            'En una interseccion sin semaforo, quien tiene prioridad?',
          optionsJson: [
            { id: 'a', label: 'El vehiculo que viene por la derecha' },
            { id: 'b', label: 'El vehiculo mas grande' },
            { id: 'c', label: 'El que acelera primero' },
          ],
          correctOption: 'a',
          position: 2,
        }),
        questionRepository.create({
          examId: exam.id,
          questionText: 'Por donde debe realizarse el adelantamiento?',
          optionsJson: [
            { id: 'a', label: 'Por la derecha siempre' },
            { id: 'b', label: 'Por la izquierda, en condiciones seguras' },
            { id: 'c', label: 'Por banquina si hay lugar' },
          ],
          correctOption: 'b',
          position: 3,
        }),
        questionRepository.create({
          examId: exam.id,
          questionText: 'En una rotonda, la prioridad corresponde a:',
          optionsJson: [
            { id: 'a', label: 'Quien quiere ingresar' },
            { id: 'b', label: 'Quien circula dentro de la rotonda' },
            { id: 'c', label: 'Quien toca bocina' },
          ],
          correctOption: 'b',
          position: 4,
        }),
        questionRepository.create({
          examId: exam.id,
          questionText: 'La distancia de seguridad recomendada depende de:',
          optionsJson: [
            { id: 'a', label: 'La velocidad y condicion del transito' },
            { id: 'b', label: 'El tamano de tu vehiculo unicamente' },
            { id: 'c', label: 'La marca de los neumaticos' },
          ],
          correctOption: 'a',
          position: 5,
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
          pdfPath: null,
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
