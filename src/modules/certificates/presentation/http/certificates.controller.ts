import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
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

@ApiTags('Certificates')
@ApiBearerAuth('access-token')
@Controller({ path: 'certificates', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.STUDENT)
export class CertificatesController {
  constructor(
    private readonly getLatestCertificateUseCase: GetLatestCertificateUseCase,
    private readonly generateCertificatePdfUseCase: GenerateCertificatePdfUseCase,
  ) {}

  @ApiOperation({ summary: "Get current student's latest certificate" })
  @ApiResponse({
    status: 200,
    description: 'Latest certificate or null',
    schema: {
      nullable: true,
      type: 'object',
      properties: {
        id: { type: 'string' },
        certificateCode: { type: 'string' },
        issuedAt: { type: 'string', format: 'date-time' },
        pdfUrl: { type: 'string', nullable: true },
        examTitle: { type: 'string' },
        attemptScore: { type: 'number' },
      },
    },
  })
  @Get('me/latest')
  async latest(
    @CurrentUser() user: JwtPayload,
  ): Promise<LatestCertificateResponseDto> {
    return this.getLatestCertificateUseCase.execute(user.sub);
  }

  @ApiOperation({
    summary: "Generate or retrieve PDF for student's latest certificate",
  })
  @ApiResponse({
    status: 201,
    description: 'Certificate ID and PDF URL',
    schema: {
      type: 'object',
      properties: {
        certificateId: { type: 'string' },
        pdfUrl: { type: 'string' },
      },
    },
  })
  @Post('me/latest/generate-pdf')
  async generateLatestPdf(
    @CurrentUser() user: JwtPayload,
  ): Promise<GeneratedCertificatePdfResponseDto> {
    return this.generateCertificatePdfUseCase.execute(user.sub);
  }
}
