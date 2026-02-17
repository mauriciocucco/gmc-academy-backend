import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CertificateTypeOrmEntity } from '../../database/typeorm/entities/certificate.typeorm-entity';
import { CertificatesController } from './presentation/http/certificates.controller';
import { GetLatestCertificateUseCase } from './application/use-cases/get-latest-certificate.use-case';
import { CERTIFICATE_READ_REPOSITORY } from './domain/ports/certificate-read-repository.port';
import { TypeOrmCertificateReadRepository } from './infrastructure/persistence/typeorm-certificate-read.repository';

@Module({
  imports: [TypeOrmModule.forFeature([CertificateTypeOrmEntity])],
  controllers: [CertificatesController],
  providers: [
    GetLatestCertificateUseCase,
    {
      provide: CERTIFICATE_READ_REPOSITORY,
      useClass: TypeOrmCertificateReadRepository,
    },
  ],
})
export class CertificatesModule {}
