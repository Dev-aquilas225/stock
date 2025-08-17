// services/documentService.ts - Version corrigée pour s'aligner avec le backend
import { DocumentUploadResponse } from '../types/document.type';
import axios from 'axios';

export class DocumentService {
  private baseUrl: string;
  private authToken: string | null;
  

  constructor(baseUrl: string = 'http://localhost:8000') {
    this.baseUrl = baseUrl;
    this.authToken = localStorage.getItem('token');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {};
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }
    return headers;
  }

  /**
   * NOUVEAU: Upload de tous les documents requis d'un coup (comme attendu par le backend)
   */
  async uploadAllDocuments(files: {
    cniFront?: File;
    cniBack?: File;
    rccm?: File;
    dfe?: File;
  }, expiryDates: {
    cniExpiry?: string;
    rccmExpiry?: string;
    dfeExpiry?: string;
  }): Promise<DocumentUploadResponse> {
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      // Validation: tous les documents sont requis selon le backend
      if (!files.cniFront || !files.cniBack || !files.rccm || !files.dfe) {
        throw new Error('Tous les documents (CNI recto/verso, RCCM, DFE) sont requis');
      }

      // Ajout des fichiers
      formData.append('cniFront', files.cniFront);
      formData.append('cniBack', files.cniBack);
      formData.append('rccm', files.rccm);
      formData.append('dfe', files.dfe);

      // Ajout des dates d'expiration
      if (expiryDates.cniExpiry) formData.append('cniExpiry', expiryDates.cniExpiry);
      if (expiryDates.rccmExpiry) formData.append('rccmExpiry', expiryDates.rccmExpiry);
      if (expiryDates.dfeExpiry) formData.append('dfeExpiry', expiryDates.dfeExpiry);

      const response = await axios.post(
        `${this.baseUrl}/documents-user`,
        formData,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          }
        }
      );

      return {
        success: true,
        message: response.data.message || "Documents uploadés avec succès",
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Erreur d'upload",
        data: undefined,
      };
    }
  }

  /**
   * NOUVEAU: Mise à jour des documents (pour les documents rejetés)
   */
  async updateAllDocuments(files: {
    cniFront?: File;
    cniBack?: File;
    rccm?: File;
    dfe?: File;
  }, expiryDates: {
    cniExpiry?: string;
    rccmExpiry?: string;
    dfeExpiry?: string;
  }): Promise<DocumentUploadResponse> {
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      // Ajout des fichiers (optionnels pour la mise à jour)
      if (files.cniFront) formData.append('cniFront', files.cniFront);
      if (files.cniBack) formData.append('cniBack', files.cniBack);
      if (files.rccm) formData.append('rccm', files.rccm);
      if (files.dfe) formData.append('dfe', files.dfe);

      // Ajout des dates d'expiration
      if (expiryDates.cniExpiry) formData.append('cniExpiry', expiryDates.cniExpiry);
      if (expiryDates.rccmExpiry) formData.append('rccmExpiry', expiryDates.rccmExpiry);
      if (expiryDates.dfeExpiry) formData.append('dfeExpiry', expiryDates.dfeExpiry);

      const response = await axios.put(
        `${this.baseUrl}/documents-user`,
        formData,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          }
        }
      );

      return {
        success: true,
        message: response.data.message || "Documents mis à jour avec succès",
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Erreur de mise à jour",
        data: undefined,
      };
    }
  }

  /**
   * ANCIEN: Upload d'un document individuel - NE SAUVEGARDE PAS EN BASE
   * Utilisé uniquement pour la prévisualisation locale
   */
  async uploadDocument(
    file: File, 
    documentId: string,
    onProgress?: (progress: number) => void
  ): Promise<DocumentUploadResponse> {
    // Cette méthode simule un upload pour la prévisualisation
    // Elle ne fait PAS appel au backend car l'endpoint /upload ne sauvegarde pas
    
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        if (onProgress) {
          onProgress(progress);
        }
        
        if (progress >= 100) {
          clearInterval(interval);
          resolve({
            success: true,
            message: "Fichier prêt pour l'envoi final",
            data: { 
              documentId,
              filePath: `uploads/${file.name}`, // Simule un chemin de fichier
              originalName: file.name,
              uploadedAt: new Date().toISOString(),
              // size: file.size,
              // type: file.type,
              preview: true // Indique que c'est juste une prévisualisation
            },
          });
        }
      }, 100);
    });
  }

  /**
   * Récupération des documents de l'utilisateur
   */
  async getUserDocuments(): Promise<any> {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${this.baseUrl}/documents-user`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        }
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Erreur lors de la récupération des documents');
    }
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
   * Vérifier si tous les documents requis sont présents
   */
  validateAllRequiredDocuments(files: {
    cniFront?: File;
    cniBack?: File;
    rccm?: File;
    dfe?: File;
  }): { isValid: boolean; missingDocuments: string[] } {
    const missing: string[] = [];
    
    if (!files.cniFront) missing.push('CNI Recto');
    if (!files.cniBack) missing.push('CNI Verso');
    if (!files.rccm) missing.push('RCCM');
    if (!files.dfe) missing.push('DFE');
    
    return {
      isValid: missing.length === 0,
      missingDocuments: missing
    };
  }

  /**
   * Mettre à jour le token d'authentification
   */
  setAuthToken(token: string): void {
    this.authToken = token;
    localStorage.setItem('token', token);
  }

  /**
   * Supprimer le token d'authentification
   */
  clearAuthToken(): void {
    this.authToken = null;
    localStorage.removeItem('token');
  }
}

// Instance singleton du service
export const documentService = new DocumentService();