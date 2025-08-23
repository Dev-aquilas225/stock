// services/documentService.ts - Version mise à jour avec retéléchargement sélectif
import axios from 'axios';

interface DocumentUploadResponse {
  success: boolean;
  message: string;
  data?: any;
}

export class DocumentService {
  private baseUrl: string;
  private useSimulation: boolean;

  constructor(baseUrl: string = 'http://localhost:8000', useSimulation: boolean = true) {
    this.baseUrl = baseUrl;
    this.useSimulation = useSimulation && process.env.NODE_ENV === 'development';
  }

  private getAuthToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Upload de tous les documents requis d'un coup (compatible avec le backend)
   * Maintenant inclut le RCCM comme document requis
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
  } = {}): Promise<DocumentUploadResponse> {
    
    // // Mode simulation pour le développement
    // if (this.useSimulation) {
    //   return this.simulateUpload(files, expiryDates);
    // }

    // Mode production
    try {
      const token = this.getAuthToken();
      
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const formData = new FormData();

      // Validation: tous les documents sont requis
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
          },
          timeout: 30000 // 30 secondes timeout
        }
      );

      return {
        success: true,
        message: response.data.message || "Documents uploadés avec succès",
        data: response.data,
      };
    } catch (error: any) {
      console.error('Erreur upload documents:', error);

      let errorMessage = "Erreur d'upload";
      
      if (error.code === 'ERR_NETWORK') {
        errorMessage = "Impossible de se connecter au serveur. Vérifiez votre connexion.";
      } else if (error.response?.status === 401) {
        errorMessage = "Session expirée. Veuillez vous reconnecter.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Erreur d'upload",
        data: undefined,
      };
    }
  }


  /**
   * Mise à jour sélective des documents rejetés uniquement
   * Cette méthode permet de retélécharger seulement les documents qui ont été rejetés par l'admin
   */
  async updateRejectedDocuments(
    files: Record<string, File>, 
    expiryDates: {
      cniExpiry?: string;
      rccmExpiry?: string;
      dfeExpiry?: string;
    } = {}
  ): Promise<DocumentUploadResponse> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const formData = new FormData();

      // Ajouter seulement les fichiers fournis (documents rejetés)
      Object.entries(files).forEach(([id, file]) => {
        // Mapping des IDs frontend vers les noms attendus par le backend
        const backendFieldMap: Record<string, string> = {
          'cniFront': 'cniFront',
          'cniBack': 'cniBack',
          'rccm': 'rccm',
          'dfe': 'dfe'
        };
        
        const backendFieldName = backendFieldMap[id] || id;
        formData.append(backendFieldName, file);
        
        console.log(`Ajout du fichier rejeté: ${backendFieldName} (${file.name})`);
      });

      // Ajouter les dates d'expiration si fournies
      if (expiryDates.cniExpiry) formData.append('cniExpiry', expiryDates.cniExpiry);
      if (expiryDates.rccmExpiry) formData.append('rccmExpiry', expiryDates.rccmExpiry);
      if (expiryDates.dfeExpiry) formData.append('dfeExpiry', expiryDates.dfeExpiry);

      // Ajouter un flag pour indiquer que c'est un retéléchargement sélectif
      formData.append('selective_update', 'true');

      console.log('Retéléchargement sélectif des documents rejetés vers:', `${this.baseUrl}/documents-user/rejected`);

      const response = await axios.put(
        `${this.baseUrl}/documents-user/rejected`,
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
        message: response.data.message || "Documents rejetés mis à jour avec succès",
        data: response.data,
      };
    } catch (error: any) {
      console.error('Erreur mise à jour documents rejetés:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Erreur de mise à jour des documents rejetés",
        data: undefined,
      };
    }
  }

  /**
   * Récupération des documents de l'utilisateur avec information sur les rejets
   */
  async getUserDocuments(): Promise<any> {
    try {
      const token = this.getAuthToken();
      
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

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
      console.error('Erreur récupération documents:', error);
      throw new Error(error.response?.data?.message || error.message || 'Erreur lors de la récupération des documents');
    }
  }

  /**
   * Récupération des documents rejetés seulement
   */
  async getRejectedDocuments(): Promise<any> {
    try {
      const token = this.getAuthToken();
      
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const response = await axios.get(`${this.baseUrl}/documents-user/rejected`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        }
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Erreur récupération documents rejetés:', error);
      throw new Error(error.response?.data?.message || error.message || 'Erreur lors de la récupération des documents rejetés');
    }
  }

  /**
   * Création d'un PDF vide pour le RCCM temporaire
   */
  createEmptyRccmPDF(): File {
    const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources 4 0 R /Contents 5 0 R >>
endobj
4 0 obj
<< /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >>
endobj
5 0 obj
<< /Length 88 >>
stream
BT
/F1 12 Tf
72 720 Td
(RCCM - Document temporaire) Tj
0 -20 Td
(A remplacer par le document officiel) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000246 00000 n 
0000000365 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
503
%%EOF`;

    const blob = new Blob([pdfContent], { type: 'application/pdf' });
    return new File([blob], 'rccm-temporaire.pdf', { 
      type: 'application/pdf',
      lastModified: Date.now()
    });
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
   * Vérifier si tous les documents requis sont présents (RCCM inclus)
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
    if (!files.rccm) missing.push('RCCM'); // Maintenant requis
    if (!files.dfe) missing.push('DFE');
    
    return {
      isValid: missing.length === 0,
      missingDocuments: missing
    };
  }

  /**
   * NOUVELLE MÉTHODE: Validation spécifique pour les documents rejetés
   */
  validateRejectedDocuments(
    files: Record<string, File>, 
    rejectedDocIds: string[]
  ): { isValid: boolean; missingDocuments: string[]; extraDocuments: string[] } {
    const missing: string[] = [];
    const extra: string[] = [];
    
    // Vérifier que tous les documents rejetés sont fournis
    rejectedDocIds.forEach(docId => {
      if (!files[docId]) {
        const docNames: Record<string, string> = {
          'cniFront': 'CNI Recto',
          'cniBack': 'CNI Verso',
          'rccm': 'RCCM',
          'dfe': 'DFE'
        };
        missing.push(docNames[docId] || docId);
      }
    });

    // Vérifier qu'on n'envoie pas de documents non rejetés
    Object.keys(files).forEach(fileId => {
      if (!rejectedDocIds.includes(fileId)) {
        const docNames: Record<string, string> = {
          'cniFront': 'CNI Recto',
          'cniBack': 'CNI Verso',
          'rccm': 'RCCM',
          'dfe': 'DFE'
        };
        extra.push(docNames[fileId] || fileId);
      }
    });
    
    return {
      isValid: missing.length === 0 && extra.length === 0,
      missingDocuments: missing,
      extraDocuments: extra
    };
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
   * Mettre à jour le token d'authentification
   */
  setAuthToken(token: string): void {
    localStorage.setItem('token', token);
  }

  /**
   * Supprimer le token d'authentification
   */
  clearAuthToken(): void {
    localStorage.removeItem('token');
  }
}

// Instance singleton du service
export const documentService = new DocumentService();