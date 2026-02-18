export const PROFILE_PHOTO_STORAGE = Symbol('PROFILE_PHOTO_STORAGE');

export interface ProfilePhotoStoragePort {
  uploadBuffer(payload: {
    buffer: Buffer;
    fileName: string;
    mimeType: string;
  }): Promise<string>;
}
