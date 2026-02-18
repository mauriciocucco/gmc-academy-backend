export const FILE_STORAGE = Symbol('FILE_STORAGE');

export interface FileStoragePort {
  uploadBuffer(payload: {
    buffer: Buffer;
    fileName: string;
    mimeType: string;
  }): Promise<string>;
}
