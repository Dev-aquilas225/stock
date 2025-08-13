// services/documentService.ts
import { DocumentUploadResponse } from '../types/document.type';

export class DocumentService {
  private baseUrl: string;
  private authToken: string | null;

  constructor(baseUrl: string = 'http://localhost:8000') {
    this.baseUrl = baseUrl;
    this.authToken = localStorage.getItem('auth-token');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {};
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }
    return headers;
  }

  /**
   * Upload d'un document avec suivi de progression
   */
  async uploadDocument(
    file: File, 
    documentId: string,
    onProgress?: (progress: number) => void
  ): Promise<DocumentUploadResponse> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentId', documentId);

      const xhr = new XMLHttpRequest();

      // Gestion de la progression
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      });

      // Gestion de la réponse
      xhr.addEventListener('load', () => {
        try {
          const response = JSON.parse(xhr.responseText);
          
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve({
              success: true,
              message: response.message || 'Upload réussi',
              data: response.data
            });
          } else {
            reject(new Error(response.message || `Erreur HTTP ${xhr.status}`));
          }
        } catch (error) {
          reject(new Error('Erreur de parsing de la réponse'));
          console.error('Erreur de parsing de la réponse:', error);
        }
      });

      // Gestion des erreurs
      xhr.addEventListener('error', () => {
        reject(new Error('Erreur réseau lors de l\'upload'));
      });

      xhr.addEventListener('timeout', () => {
        reject(new Error('Timeout lors de l\'upload'));
      });

      // Configuration de la requête
      xhr.open('POST', `${this.baseUrl}/documents-user/upload`);
      xhr.timeout = 300000; // 5 minutes

      // Ajout des headers
      Object.entries(this.getHeaders()).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value as string);
      });

      xhr.send(formData);
    });
  }

  /**
   * Upload multiple documents (pour CNI recto/verso + autres)
   */
  async uploadMultipleDocuments(files: {
    cniFront?: File;
    cniBack?: File;
    rccm?: File;
    dfe?: File;
  }, expiryDates: {
    cniExpiry?: string;
    rccmExpiry?: string;
    dfeExpiry?: string;
  }): Promise<DocumentUploadResponse> {
    const formData = new FormData();

    // Ajout des fichiers
    if (files.cniFront) formData.append('cniFront', files.cniFront);
    if (files.cniBack) formData.append('cniBack', files.cniBack);
    if (files.rccm) formData.append('rccm', files.rccm);
    if (files.dfe) formData.append('dfe', files.dfe);

    // Ajout des dates d'expiration
    if (expiryDates.cniExpiry) formData.append('cniExpiry', expiryDates.cniExpiry);
    if (expiryDates.rccmExpiry) formData.append('rccmExpiry', expiryDates.rccmExpiry);
    if (expiryDates.dfeExpiry) formData.append('dfeExpiry', expiryDates.dfeExpiry);

    const response = await fetch(`${this.baseUrl}/documents-user`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erreur lors de l\'upload');
    }

    return {
      success: true,
      message: data.message,
      data: data.paths
    };
  }

  /**
   * Validation d'un fichier avant upload
   */
  validateFile(file: File, maxSize: number = 10, acceptedTypes: string[] = []): {
    isValid: boolean;
    error?: string;
  } {
    // Vérification de la taille
    if (file.size > maxSize * 1024 * 1024) {
      return {
        isValid: false,
        error: `Le fichier est trop volumineux. Taille maximum : ${maxSize} MB`
      };
    }

    // Vérification du type MIME
    if (acceptedTypes.length > 0) {
      const fileType = file.type.toLowerCase();
      const fileName = file.name.toLowerCase();
      
      const isValidType = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return fileName.endsWith(type);
        }
        return fileType.includes(type);
      });

      if (!isValidType) {
        return {
          isValid: false,
          error: `Type de fichier non supporté. Types acceptés : ${acceptedTypes.join(', ')}`
        };
      }
    }

    // Vérification du nom de fichier
    if (file.name.length > 255) {
      return {
        isValid: false,
        error: 'Le nom du fichier est trop long (255 caractères maximum)'
      };
    }

    return { isValid: true };
  }

  /**
   * Génération d'une URL de prévisualisation pour un fichier
   */
  generatePreviewUrl(file: File): string | null {
    const fileType = file.type.toLowerCase();
    
    // Pour les images, créer un blob URL
    if (fileType.startsWith('image/')) {
      return URL.createObjectURL(file);
    }
    
    // Pour les PDF, on peut aussi créer un blob URL
    if (fileType === 'application/pdf') {
      return URL.createObjectURL(file);
    }
    
    return null;
  }

  /**
   * Nettoyage des URLs de prévisualisation
   */
  revokePreviewUrl(url: string): void {
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  }

  /**
   * Compression d'image avant upload (optionnel)
   */
  async compressImage(file: File, maxWidth: number = 1920, quality: number = 0.8): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculer les nouvelles dimensions
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        const width = img.width * ratio;
        const height = img.height * ratio;

        canvas.width = width;
        canvas.height = height;

        // Dessiner l'image redimensionnée
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Erreur lors de la compression'));
            }
          },
          file.type,
          quality
        );
      };

      img.onerror = () => reject(new Error('Erreur lors du chargement de l\'image'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Convertir un fichier en Base64 (utile pour certains cas)
   */
  async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  }

  /**
   * Récupérer les statistiques des documents
   */
  async getDocumentStats(): Promise<{
    total: number;
    uploaded: number;
    validated: number;
    rejected: number;
    pending: number;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/documents-user/stats`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la récupération des statistiques');
      }

      return data;
    } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
      // En cas d'erreur, retourner des statistiques par défaut
      return {
        total: 0,
        uploaded: 0,
        validated: 0,
        rejected: 0,
        pending: 0
      };
    }
  }

  /**
   * Vérifier le statut de validation des documents
   */
  async checkValidationStatus(): Promise<{
    isComplete: boolean;
    missingDocuments: string[];
    nextSteps: string[];
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/documents-user/validation-status`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la vérification du statut');
      }

      return data;
    } catch (error) {
      console.error('Erreur lors de la vérification du statut:', error);
      return {
        isComplete: false,
        missingDocuments: [],
        nextSteps: ['Contactez le support technique']
      };
    }
  }

  /**
   * Mettre à jour le token d'authentification
   */
  setAuthToken(token: string): void {
    this.authToken = token;
    localStorage.setItem('auth-token', token);
  }

  /**
   * Supprimer le token d'authentification
   */
  clearAuthToken(): void {
    this.authToken = null;
    localStorage.removeItem('auth-token');
  }
  /**
   * Mise à jour des documents refusés
   */
  async updateRejectedDocuments(
    files: {
      cniFront?: File;
      cniBack?: File;
      rccm?: File;
      dfe?: File;
    },
    expiryDates: {
      cniExpiry?: string;
      rccmExpiry?: string;
      dfeExpiry?: string;
    }
  ): Promise<DocumentUploadResponse> {
    const formData = new FormData();

    // Ajout des fichiers
    if (files.cniFront) formData.append('cniFront', files.cniFront);
    if (files.cniBack) formData.append('cniBack', files.cniBack);
    if (files.rccm) formData.append('rccm', files.rccm);
    if (files.dfe) formData.append('dfe', files.dfe);

    // Ajout des dates d'expiration
    if (expiryDates.cniExpiry) formData.append('cniExpiry', expiryDates.cniExpiry);
    if (expiryDates.rccmExpiry) formData.append('rccmExpiry', expiryDates.rccmExpiry);
    if (expiryDates.dfeExpiry) formData.append('dfeExpiry', expiryDates.dfeExpiry);

    const response = await fetch(`${this.baseUrl}/documents-user`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erreur lors de la mise à jour');
    }

    return {
      success: true,
      message: data.message,
      data: data.paths
    };
  }

  /**
   * Récupération des documents de l'utilisateur
   */
  async getUserDocuments(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/documents-user`, {
      method: 'GET',
      headers: this.getHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erreur lors de la récupération des documents');
    }

    return data;
  }
}

// Instance singleton du service
export const documentService = new DocumentService();

