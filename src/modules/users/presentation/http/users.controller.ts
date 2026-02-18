import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ParseFilePipeBuilder,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { GetMeUseCase } from '../../application/use-cases/get-me.use-case';
import { GetMyProgressUseCase } from '../../application/use-cases/get-my-progress.use-case';
import { UpdateMyProfileUseCase } from '../../application/use-cases/update-my-profile.use-case';
import {
  ProfilePhotoUploadFile,
  UploadMyProfilePhotoUseCase,
} from '../../application/use-cases/upload-my-profile-photo.use-case';
import { JwtAuthGuard } from '../../../../common/infrastructure/http/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/infrastructure/http/guards/roles.guard';
import { Roles } from '../../../../common/infrastructure/http/decorators/roles.decorator';
import { CurrentUser } from '../../../../common/infrastructure/http/decorators/current-user.decorator';
import { JwtPayload } from '../../../../common/infrastructure/http/interfaces/jwt-payload.interface';
import { UserResponseDto } from '../../application/dto/user-response.dto';
import { StudentProgressResponseDto } from '../../application/dto/student-progress-response.dto';
import { UserRole } from '../../../../common/domain/enums/user-role.enum';
import { UpdateMyProfileDto } from '../../application/dto/update-my-profile.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@Controller({ path: '', version: '1' })
export class UsersController {
  constructor(
    private readonly getMeUseCase: GetMeUseCase,
    private readonly getMyProgressUseCase: GetMyProgressUseCase,
    private readonly updateMyProfileUseCase: UpdateMyProfileUseCase,
    private readonly uploadMyProfilePhotoUseCase: UploadMyProfilePhotoUseCase,
  ) {}

  @ApiOperation({ summary: 'Get current authenticated user profile' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: JwtPayload): Promise<UserResponseDto> {
    return this.getMeUseCase.execute(user.sub);
  }

  @ApiOperation({ summary: 'Update current student profile fields' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @Patch('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  async updateMyProfile(
    @CurrentUser() user: JwtPayload,
    @Body() body: UpdateMyProfileDto,
  ): Promise<UserResponseDto> {
    return this.updateMyProfileUseCase.execute(user.sub, body);
  }

  @ApiOperation({ summary: 'Upload current student profile photo' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @Post('me/profile-photo')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  async uploadMyProfilePhoto(
    @CurrentUser() user: JwtPayload,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: /^image\/(jpeg|png|webp)$/ })
        .addMaxSizeValidator({ maxSize: 5 * 1024 * 1024 })
        .build({
          fileIsRequired: true,
          errorHttpStatusCode: HttpStatus.BAD_REQUEST,
        }),
    )
    file: ProfilePhotoUploadFile,
  ): Promise<UserResponseDto> {
    return this.uploadMyProfilePhotoUseCase.execute(user.sub, file);
  }

  @ApiOperation({ summary: 'Get current student progress summary' })
  @ApiResponse({ status: 200, type: StudentProgressResponseDto })
  @Get('me/progress')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  async progress(
    @CurrentUser() user: JwtPayload,
  ): Promise<StudentProgressResponseDto> {
    return this.getMyProgressUseCase.execute(user.sub);
  }
}
