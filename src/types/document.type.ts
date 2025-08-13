// types/document.types.ts
export interface Document {
  id: string;
  name: string;
  description: string;
  status: DocumentStatus;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  file?: File;
  uploadedAt?: Date;
  previewUrl?: string;
  isRequired: boolean;
  maxSize?: number; // en MB
  acceptedFormats?: string[];
}

export type DocumentStatus = 
  | 'missing' 
  | 'uploading' 
  | 'uploaded' 
  | 'pending' 
  | 'validated' 
  | 'rejected' 
  | 'expired'
  | 'not_required';

export interface UploadProgress {
  documentId: string;
  progress: number;
  isUploading: boolean;
  error?: string;
}

export interface DocumentUploadResponse {
  success: boolean;
  message: string;
  data?: {
    documentId: string;
    filePath: string;
    originalName: string;
    uploadedAt: string;
  };
  error?: string;
}

export interface DocumentCardProps {
  document: Document;
  onUpload: (documentId: string, file: File) => void;
  onTakePhoto: (documentId: string) => void;
  onPreview: (document: Document) => void;
  uploadProgress?: UploadProgress;
  isUploading?: boolean;
}

export type UserType = 'individual' | 'entreprise';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}