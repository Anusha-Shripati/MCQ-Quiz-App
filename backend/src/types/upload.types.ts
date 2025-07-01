export interface UploadedFile {
  originalName: string;
  mimeType: string;
  fileName: string;
  size: number;
  path: string;
}

export type MergeChunk={ UploadId:string, key:string, parts:[{ETag:string, PartNumber:number}]}
