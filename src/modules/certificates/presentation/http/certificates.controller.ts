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
} from '../../application/use-cases/get-latest-certificate.use-case';
import {
  GenerateCertificatePdfUseCase,
  GeneratedCertificatePdfResponseDto,
} from '../../application/use-cases/generate-certificate-pdf.use-case';
import { LatestCertificateResponseDto } from '../../application/dto/latest-certificate-response.dto';

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
  @ApiResponse({ status: 200, type: LatestCertificateResponseDto })
  @ApiResponse({ status: 404, description: 'No certificate found' })
  @Get('me/latest')
  async latest(
    @CurrentUser() user: JwtPayload,
  ): Promise<LatestCertificateResponseDto> {
    return this.getLatestCertificateUseCase.execute(user.sub);
  }

  @ApiOperation({
    summary:
      "Generate or retrieve a temporary signed PDF URL for student's latest certificate",
  })
  @ApiResponse({
    status: 201,
    description: 'Certificate ID and temporary signed PDF URL',
    schema: {
      type: 'object',
      properties: {
        certificateId: { type: 'string' },
        pdfUrl: {
          type: 'string',
          description: 'Temporary signed download URL for the certificate PDF',
        },
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
