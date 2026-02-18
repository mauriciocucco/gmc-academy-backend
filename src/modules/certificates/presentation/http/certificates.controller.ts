import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../common/infrastructure/http/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/infrastructure/http/guards/roles.guard';
import { Roles } from '../../../../common/infrastructure/http/decorators/roles.decorator';
import { UserRole } from '../../../../common/domain/enums/user-role.enum';
import { CurrentUser } from '../../../../common/infrastructure/http/decorators/current-user.decorator';
import { JwtPayload } from '../../../../common/infrastructure/http/interfaces/jwt-payload.interface';
import {
  GetLatestCertificateUseCase,
  LatestCertificateResponseDto,
} from '../../application/use-cases/get-latest-certificate.use-case';
import {
  GenerateCertificatePdfUseCase,
  GeneratedCertificatePdfResponseDto,
} from '../../application/use-cases/generate-certificate-pdf.use-case';

@Controller({ path: 'certificates', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.STUDENT)
export class CertificatesController {
  constructor(
    private readonly getLatestCertificateUseCase: GetLatestCertificateUseCase,
    private readonly generateCertificatePdfUseCase: GenerateCertificatePdfUseCase,
  ) {}

  @Get('me/latest')
  async latest(
    @CurrentUser() user: JwtPayload,
  ): Promise<LatestCertificateResponseDto> {
    return this.getLatestCertificateUseCase.execute(user.sub);
  }

  @Post('me/latest/generate-pdf')
  async generateLatestPdf(
    @CurrentUser() user: JwtPayload,
  ): Promise<GeneratedCertificatePdfResponseDto> {
    return this.generateCertificatePdfUseCase.execute(user.sub);
  }
}
