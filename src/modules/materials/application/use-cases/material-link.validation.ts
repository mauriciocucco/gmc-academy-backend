import { BadRequestException } from '@nestjs/common';
import { MaterialLinkInputDto } from '../dto/create-material.dto';
import { MaterialLinkSource } from '../../../../common/domain/enums/material-link-source.enum';

const DRIVE_REGEX = /drive\.google\.com/i;
const YOUTUBE_REGEX = /(youtube\.com|youtu\.be)/i;

export function validateMaterialLinks(links: MaterialLinkInputDto[]): void {
  for (const link of links) {
    if (
      link.sourceType === MaterialLinkSource.DRIVE &&
      !DRIVE_REGEX.test(link.url)
    ) {
      throw new BadRequestException(
        'Drive links must come from drive.google.com',
      );
    }

    if (
      link.sourceType === MaterialLinkSource.YOUTUBE &&
      !YOUTUBE_REGEX.test(link.url)
    ) {
      throw new BadRequestException(
        'YouTube links must come from youtube.com or youtu.be',
      );
    }
  }
}
