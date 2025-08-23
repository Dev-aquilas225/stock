import React, { useRef, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    FileText,
    Upload,
    AlertTriangle,
    CheckCircle,
    ArrowLeft,
    Shield,
    Loader,
    X,
    Eye,
} from "lucide-react";
import Card from "../components/UI/Card";
import Button from "../components/UI/Button";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import {
    uploadAllDocuments,
    updateRejectedDocuments,
    validateAllRequiredDocuments,
    generatePreviewUrl,
    revokePreviewUrl,
    getUserDocuments,
    UploadDocumentsResponseData,
    StatutDocument,
    DocumentUpdate,
} from "../api/documentApi";
import { validateFile } from "../api/documentApi";

type DocumentStatus = StatutDocument;

interface DocumentItem {
    id: string; // Identifiant local (ex. cniFront, cniBack)
    serverId?: string; // ID du document côté serveur (ex. UUID)
    name: string;
    description: string;
    status: DocumentStatus;
    icon: React.ComponentType<any>;
    isRequired?: boolean;
    file?: File;
    uploadedAt?: Date;
    previewUrl?: string | null | undefined;
    fichierRectoUrl?: string;
    fichierVersoUrl?: string;
    commentaire?: string | null;
    creeLe?: string;
    majLe?: string;
    type: "CNI" | "RCCM" | "DFE"; // Type pour correspondre à l'API
}

interface UploadProgress {
    [key: string]: {
        progress: number;
        isUploading: boolean;
        error?: string;
    };
}

const API_BASE_URL = "http://localhost:8000";

const DocumentsRequiredPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();

    // Documents par défaut
    const [documents, setDocuments] = useState<DocumentItem[]>([
        {
            id: "cniFront",
            name: "CNI Recto",
            description: "Recto de la carte nationale d'identité",
            status: StatutDocument.NONFOURNI,
            icon: FileText,
            isRequired: true,
            type: "CNI",
        },
        {
            id: "cniBack",
            name: "CNI Verso",
            description: "Verso de la carte nationale d'identité",
            status: StatutDocument.NONFOURNI,
            icon: FileText,
            isRequired: true,
            type: "CNI",
        },
        {
            id: "rccm",
            name: "Registre de commerce (RCCM)",
            description: "Document d'enregistrement de votre entreprise",
            status: StatutDocument.NONFOURNI,
            icon: Shield,
            isRequired: false,
            type: "RCCM",
        },
        {
            id: "dfe",
            name: "DFE",
            description: "Document fiscal d'entreprise",
            status: StatutDocument.NONFOURNI,
            icon: FileText,
            isRequired: true,
            type: "DFE",
        },
    ]);

    const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [previewModal, setPreviewModal] = useState<{
        url: string;
        name: string;
    } | null>(null);

    // Stockage temporaire des fichiers
    const [tempFiles, setTempFiles] = useState<{ [key: string]: File }>({});

    // Références pour les inputs fichiers
    const fileInputs = useRef<{ [key: string]: HTMLInputElement | null }>({});

    // Indicateur pour savoir si c'est une deuxième tentative
    const [isSecondAttempt, setIsSecondAttempt] = useState(false);

    // Récupérer les documents existants au chargement
    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                setIsLoading(true);
                const response = await getUserDocuments();
                if (response.success && response.data) {
                    const serverDocs = Array.isArray(response.data)
                        ? (response.data as UploadDocumentsResponseData[])
                        : [];
                    if (!Array.isArray(response.data)) {
                        console.warn(
                            "response.data is not an array:",
                            response.data,
                        );
                        showToast({
                            type: "warning",
                            title: "Données inattendues",
                            message:
                                "Les données des documents reçues ne sont pas au format attendu. Veuillez réessayer ou contacter le support.",
                        });
                    }
                    setDocuments((prev) =>
                        prev.map((doc) => {
                            const serverDoc = serverDocs.find((sd) => {
                                if (sd.type === "CNI") {
                                    return (
                                        (doc.id === "cniFront" &&
                                            sd.fichierRectoUrl) ||
                                        (doc.id === "cniBack" &&
                                            sd.fichierVersoUrl)
                                    );
                                }
                                return sd.type.toLowerCase() === doc.id;
                            });
                            if (serverDoc) {
                                return {
                                    ...doc,
                                    serverId: serverDoc.id.toString(), // Stocker l'ID du serveur
                                    status: serverDoc.statut as StatutDocument,
                                    fichierRectoUrl: serverDoc.fichierRectoUrl
                                        ? `${API_BASE_URL}${serverDoc.fichierRectoUrl}`
                                        : undefined,
                                    fichierVersoUrl: serverDoc.fichierVersoUrl
                                        ? `${API_BASE_URL}${serverDoc.fichierVersoUrl}`
                                        : undefined,
                                    commentaire: serverDoc.commentaire,
                                    creeLe: serverDoc.creeLe,
                                    majLe: serverDoc.majLe,
                                };
                            }
                            return doc;
                        }),
                    );

                    // Vérifier si c'est une deuxième tentative
                    const hasNonNonFourniStatus = serverDocs.some(
                        (doc) => doc.statut !== StatutDocument.NONFOURNI,
                    );
                    setIsSecondAttempt(hasNonNonFourniStatus);

                    // Afficher un toast pour les documents rejetés
                    const rejectedDocs = serverDocs
                        .filter((doc) => doc.statut === StatutDocument.REFUSE)
                        .map((doc) => {
                            if (doc.type === "CNI") {
                                const isFront = documents.find(
                                    (d) =>
                                        d.id === "cniFront" &&
                                        doc.fichierRectoUrl,
                                );
                                const isBack = documents.find(
                                    (d) =>
                                        d.id === "cniBack" &&
                                        doc.fichierVersoUrl,
                                );
                                return isFront
                                    ? "CNI Recto"
                                    : isBack
                                    ? "CNI Verso"
                                    : doc.type;
                            }
                            return (
                                documents.find(
                                    (d) => d.id === doc.type.toLowerCase(),
                                )?.name || doc.type
                            );
                        });

                    if (rejectedDocs.length > 0) {
                        showToast({
                            type: "error",
                            title: "Documents rejetés",
                            message: `Les documents suivants ont été rejetés : ${rejectedDocs.join(
                                ", ",
                            )}. Veuillez les re-télécharger.`,
                        });
                    }
                } else {
                    showToast({
                        type: "error",
                        title: "Erreur",
                        message: "Aucun document reçu du serveur.",
                    });
                }
            } catch (error: any) {
                console.error("Error fetching documents:", error);
                showToast({
                    type: "error",
                    title: "Erreur",
                    message:
                        error.message ||
                        "Erreur lors de la récupération des documents",
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchDocuments();

        // Nettoyage des URLs de prévisualisation au démontage
        return () => {
            documents.forEach((doc) => {
                if (doc.previewUrl) {
                    revokePreviewUrl(doc.previewUrl);
                }
            });
        };
    }, []);

    // Upload de fichier (stockage temporaire)
    const handleUpload = (id: string) => {
        const input = fileInputs.current[id];
        if (!input) return;

        input.accept = ".pdf,.jpg,.jpeg,.png";
        input.removeAttribute("capture");
        input.click();
    };

    const handleFileChange = async (
        id: string,
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validation du fichier
        const validation = await validateFile(file, 10, [
            ".pdf",
            "image/jpeg",
            "image/png",
        ]);
        if (!validation.isValid) {
            showToast({
                type: "error",
                title: "Erreur de fichier",
                message: validation.error || "Fichier invalide",
            });
            return;
        }

        // Simulation d'upload avec progression
        setUploadProgress((prev) => ({
            ...prev,
            [id]: { progress: 0, isUploading: true },
        }));

        // Mise à jour du document
        setDocuments((prev) =>
            prev.map((doc) =>
                doc.id === id
                    ? {
                          ...doc,
                          status: StatutDocument.EN_ATTENTE,
                          file,
                          previewUrl: generatePreviewUrl(file),
                      }
                    : doc,
            ),
        );

        // Simulation de progression fluide
        let progress = 0;
        const updateProgress = () => {
            progress += 2;
            setUploadProgress((prev) => ({
                ...prev,
                [id]: { progress, isUploading: true },
            }));

            if (progress < 100) {
                requestAnimationFrame(updateProgress);
            } else {
                setTempFiles((prev) => ({
                    ...prev,
                    [id]: file,
                }));

                showToast({
                    type: "success",
                    title: "Fichier prêt",
                    message:
                        'Fichier ajouté avec succès. Cliquez sur "Valider" pour envoyer tous les documents.',
                });

                setTimeout(() => {
                    setUploadProgress((prev) => {
                        const newProgress = { ...prev };
                        delete newProgress[id];
                        return newProgress;
                    });
                }, 2000);
            }
        };

        requestAnimationFrame(updateProgress);

        event.target.value = "";
    };

    // Supprimer un fichier
    const removeDocument = (id: string) => {
        const doc = documents.find((d) => d.id === id);
        if (doc?.previewUrl) {
            revokePreviewUrl(doc.previewUrl);
        }

        setTempFiles((prev) => {
            const newFiles = { ...prev };
            delete newFiles[id];
            return newFiles;
        });

        setDocuments((prev) =>
            prev.map((doc) =>
                doc.id === id
                    ? {
                          ...doc,
                          status: StatutDocument.NONFOURNI,
                          file: undefined,
                          previewUrl: undefined,
                      }
                    : doc,
            ),
        );

        showToast({
            type: "info",
            title: "Document supprimé",
            message: "Le document a été retiré de la liste d'envoi",
        });
    };

    // Soumission finale de tous les documents
    const handleSubmit = async () => {
        if (!window.confirm("Confirmez-vous l'envoi de tous les documents ?")) {
            return;
        }

        setIsSubmitting(true);

        try {
            let response;
            
            if (isSecondAttempt) {
                // Construire la liste des documents à mettre à jour
                const documentsToUpdate: DocumentUpdate[] = [];

                console.log(documents)
                // Vérifier CNI (recto et verso doivent être fournis ensemble)
                const cniFrontDoc = documents.find(
                    (doc) => doc.id === "cniFront",
                );
                const cniBackDoc = documents.find(
                    (doc) => doc.id === "cniBack",
                );
                if (
                    cniFrontDoc?.serverId &&
                    (cniFrontDoc.status === StatutDocument.REFUSE ||
                        cniFrontDoc.status === StatutDocument.NONFOURNI) &&
                    tempFiles.cniFront &&
                    tempFiles.cniBack
                ) {
                    documentsToUpdate.push({
                        id: cniFrontDoc.serverId,
                        type: "CNI",
                        file: tempFiles.cniFront,
                        fileBack: tempFiles.cniBack,
                    });
                } else if (
                    (tempFiles.cniFront || tempFiles.cniBack) &&
                    !(tempFiles.cniFront && tempFiles.cniBack)
                ) {
                    throw new Error("CNI nécessite à la fois recto et verso.");
                }

                // RCCM (optionnel, seulement si fichier fourni)
                const rccmDoc = documents.find((doc) => doc.id === "rccm");
                if (
                    rccmDoc?.serverId &&
                    (rccmDoc.status === StatutDocument.REFUSE ||
                        rccmDoc.status === StatutDocument.NONFOURNI) &&
                    tempFiles.rccm
                ) {
                    documentsToUpdate.push({
                        id: rccmDoc.serverId,
                        type: "RCCM",
                        file: tempFiles.rccm,
                    });
                }

                // DFE (requis si mis à jour)
                const dfeDoc = documents.find((doc) => doc.id === "dfe");
                console.log("dfe:", dfeDoc);
                if (
                    dfeDoc?.serverId &&
                    (dfeDoc.status === StatutDocument.REFUSE ||
                        dfeDoc.status === StatutDocument.NONFOURNI) &&
                    tempFiles.dfe
                ) {
                    documentsToUpdate.push({
                        id: dfeDoc.serverId,
                        type: "DFE",
                        file: tempFiles.dfe,
                    });
                } else if (
                    dfeDoc?.isRequired &&
                    (dfeDoc.status === StatutDocument.REFUSE ||
                        dfeDoc.status === StatutDocument.NONFOURNI) &&
                    !tempFiles.dfe
                ) {
                    throw new Error(
                        "Le document DFE est requis pour la mise à jour.",
                    );
                }

                // Vérifier s'il y a des documents à mettre à jour
                if (documentsToUpdate.length === 0) {
                    showToast({
                        type: "error",
                        title: "Aucun document à mettre à jour",
                        message:
                            "Aucun document rejeté ou non fourni à mettre à jour.",
                    });
                    setIsSubmitting(false);
                    return;
                }

                // Envoyer la mise à jour
                response = await updateRejectedDocuments(documentsToUpdate, {});
            } else {
                // Premier envoi
                const filesToSend = {
                    cniFront: tempFiles.cniFront,
                    cniBack: tempFiles.cniBack,
                    rccm: tempFiles.rccm,
                    dfe: tempFiles.dfe,
                };

                const validation = validateAllRequiredDocuments(filesToSend);
                if (!validation.isValid) {
                    showToast({
                        type: "error",
                        title: "Documents manquants",
                        message: `Documents requis manquants: ${validation.missingDocuments.join(
                            ", ",
                        )}`,
                    });
                    setIsSubmitting(false);
                    return;
                }

                response = await uploadAllDocuments(filesToSend, {});
            }

            if (response.success) {
                const serverDocs = Array.isArray(response.data)
                    ? (response.data as UploadDocumentsResponseData[])
                    : [];
                if (!Array.isArray(response.data)) {
                    console.warn(
                        "response.data is not an array:",
                        response.data,
                    );
                    showToast({
                        type: "warning",
                        title: "Données inattendues",
                        message:
                            "Les données des documents reçues ne sont pas au format attendu.",
                    });
                }
                setDocuments((prev) =>
                    prev.map((doc) => {
                        const serverDoc = serverDocs.find(
                            (sd: UploadDocumentsResponseData) =>
                                sd.type.toLowerCase() === doc.id ||
                                (sd.type === "CNI" &&
                                    ((doc.id === "cniFront" &&
                                        sd.fichierRectoUrl) ||
                                        (doc.id === "cniBack" &&
                                            sd.fichierVersoUrl))),
                        );
                        if (serverDoc) {
                            return {
                                ...doc,
                                serverId: serverDoc.id.toString(),
                                status: serverDoc.statut as StatutDocument,
                                fichierRectoUrl: serverDoc.fichierRectoUrl
                                    ? `${API_BASE_URL}${serverDoc.fichierRectoUrl}`
                                    : undefined,
                                fichierVersoUrl: serverDoc.fichierVersoUrl
                                    ? `${API_BASE_URL}${serverDoc.fichierVersoUrl}`
                                    : undefined,
                                commentaire: serverDoc.commentaire,
                                creeLe: serverDoc.creeLe,
                                majLe: serverDoc.majLe,
                                file: undefined, // Réinitialiser les fichiers locaux après envoi
                                previewUrl: undefined,
                            };
                        }
                        return {
                            ...doc,
                            file: undefined,
                            previewUrl: undefined,
                        };
                    }),
                );

                // Réinitialiser tempFiles après envoi
                setTempFiles({});

                showToast({
                    type: "success",
                    title: "Documents envoyés",
                    message:
                        response.message ||
                        "Vos documents ont été envoyés pour validation",
                });

                navigate("/compte-en-attente");
            } else {
                throw new Error(
                    response.message || "Échec de l'envoi des documents",
                );
            }
        } catch (error: any) {
            let errorMessage =
                error.response?.data?.message ||
                error.message ||
                "Erreur lors de l'envoi des documents";
            if (error.code === "ECONNABORTED") {
                errorMessage = "Délai d'attente dépassé. Veuillez réessayer.";
            } else if (error.response?.status === 413) {
                errorMessage = "Un ou plusieurs fichiers sont trop volumineux.";
            }
            showToast({
                type: "error",
                title: "Erreur d'envoi",
                message: errorMessage,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Prévisualiser un document
    const handlePreview = (url: string, name: string) => {
        if (url.toLowerCase().endsWith(".pdf")) {
            setPreviewModal({ url, name });
        } else {
            window.open(url, "_blank");
        }
    };

    // Utilitaires UI
    const getStatusColor = (status: DocumentStatus, hasFile: boolean) => {
        switch (status) {
            case StatutDocument.VALIDE:
                return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
            case StatutDocument.EN_ATTENTE:
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
            case StatutDocument.NONFOURNI:
            case StatutDocument.REFUSE:
                return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
        }
    };

    const getStatusIcon = (
        status: DocumentStatus,
        id: string,
        hasFile: boolean,
    ) => {
        const progress = uploadProgress[id];

        if (progress?.isUploading) {
            return <Loader className="w-4 h-4 animate-spin" />;
        }

        switch (status) {
            case StatutDocument.VALIDE:
            case StatutDocument.EN_ATTENTE:
                return <CheckCircle className="w-4 h-4" />;
            case StatutDocument.NONFOURNI:
            case StatutDocument.REFUSE:
                return <AlertTriangle className="w-4 h-4" />;
            default:
                return <FileText className="w-4 h-4" />;
        }
    };

    const getStatusText = (
        status: DocumentStatus,
        id: string,
        hasFile: boolean,
    ) => {
        const progress = uploadProgress[id];

        if (progress?.isUploading) {
            return `Upload... ${progress.progress}%`;
        }

        if (hasFile) {
            return "Prêt à envoyer";
        }

        switch (status) {
            case StatutDocument.EN_ATTENTE:
                return "En attente";
            case StatutDocument.VALIDE:
                return "Validé";
            case StatutDocument.NONFOURNI:
                return "Non fourni";
            case StatutDocument.REFUSE:
                return "Rejeté";
            default:
                return "Inconnu";
        }
    };

    // Filtrage des documents requis
    const requiredDocs = documents.filter((doc) => doc.isRequired);

    // Compter les documents téléchargés ou valides
    const uploadedCount = requiredDocs.filter(
        (doc) =>
            tempFiles[doc.id] ||
            doc.status === StatutDocument.EN_ATTENTE ||
            doc.status === StatutDocument.VALIDE,
    ).length;

    const hasRequiredFiles = uploadedCount === requiredDocs.length;

    if (isLoading) {
        return (
            <div className="min-h-screen pt-16 bg-gradient-to-br from-nexsaas-pure-white to-nexsaas-light-gray dark:from-nexsaas-vanta-black dark:to-gray-900">
                <div className="container mx-auto px-2 sm:px-4 py-6 max-w-4xl">
                    <div className="flex justify-center items-center h-64">
                        <Loader className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-nexsaas-deep-blue" />
                        <span className="ml-2 sm:ml-3 text-sm sm:text-base text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                            Chargement...
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-12 sm:pt-16 bg-gradient-to-br from-nexsaas-pure-white to-nexsaas-light-gray dark:from-nexsaas-vanta-black dark:to-gray-900">
            <div className="container mx-auto px-2 sm:px-4 py-6 max-w-4xl">
                {/* Header */}
                <div className="text-center mb-6 sm:mb-8">
                    <div className="p-3 sm:p-4 bg-red-500/10 rounded-full inline-block mb-4 sm:mb-6">
                        <AlertTriangle className="w-12 h-12 sm:w-16 sm:h-16 text-red-500" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-3 sm:mb-4">
                        Documents Requis
                    </h1>
                    <p className="text-sm sm:text-lg text-nexsaas-vanta-black dark:text-gray-300 max-w-xl sm:max-w-2xl mx-auto">
                        Pour accéder à toutes les fonctionnalités, veuillez
                        télécharger tous les documents requis. Ils seront
                        envoyés ensemble pour validation.
                    </p>
                </div>

                {/* Progression */}
                <div className="mb-6 sm:mb-8">
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xs sm:text-sm font-medium text-blue-800 dark:text-blue-400">
                                    Progression
                                </h3>
                                <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 mt-1">
                                    {uploadedCount} / {requiredDocs.length}{" "}
                                    documents prêts
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="text-lg sm:text-2xl font-bold text-blue-600">
                                    {Math.round(
                                        (uploadedCount / requiredDocs.length) *
                                            100,
                                    )}
                                    %
                                </div>
                            </div>
                        </div>
                        <div className="mt-2 sm:mt-3 w-full bg-blue-200 rounded-full h-1.5 sm:h-2">
                            <div
                                className="bg-blue-600 h-1.5 sm:h-2 rounded-full transition-all duration-500"
                                style={{
                                    width: `${
                                        (uploadedCount / requiredDocs.length) *
                                        100
                                    }%`,
                                }}
                            />
                        </div>
                        {hasRequiredFiles && (
                            <div className="mt-2 text-xs sm:text-sm text-green-700 dark:text-green-400">
                                ✓ Tous les documents requis sont prêts pour
                                l'envoi
                            </div>
                        )}
                    </div>
                </div>

                {/* Documents List */}
                <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
                    {documents.map((document) => {
                        const progress = uploadProgress[document.id];
                        const hasFile = !!tempFiles[document.id];
                        const DocumentIcon = document.icon;
                        const isEditable =
                            document.status === StatutDocument.REFUSE ||
                            document.status === StatutDocument.NONFOURNI;

                        return (
                            <Card
                                key={document.id}
                                className="hover:shadow-md transition-shadow p-3 sm:p-4"
                            >
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                                    <div className="flex items-center space-x-3 sm:space-x-4 w-full">
                                        <div className="p-2 sm:p-3 bg-nexsaas-deep-blue/10 rounded-lg">
                                            <DocumentIcon className="w-5 h-5 sm:w-6 sm:h-6 text-nexsaas-deep-blue" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-base sm:text-lg font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                                {document.name}
                                            </h3>
                                            <p className="text-xs sm:text-sm text-nexsaas-vanta-black dark:text-gray-300">
                                                {document.description}
                                            </p>
                                            {document.id === "rccm" &&
                                                document.status ===
                                                    StatutDocument.NONFOURNI && (
                                                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                                                        Ce document est
                                                        optionnel.
                                                    </p>
                                                )}
                                            {document.commentaire && (
                                                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                                    Commentaire:{" "}
                                                    {document.commentaire}
                                                </p>
                                            )}
                                            <div className="flex items-center mt-2">
                                                <span
                                                    className={`inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                                        document.status,
                                                        hasFile,
                                                    )}`}
                                                >
                                                    {getStatusIcon(
                                                        document.status,
                                                        document.id,
                                                        hasFile,
                                                    )}
                                                    <span className="ml-1">
                                                        {getStatusText(
                                                            document.status,
                                                            document.id,
                                                            hasFile,
                                                        )}
                                                    </span>
                                                </span>
                                            </div>
                                            {progress?.isUploading && (
                                                <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                                                    <div
                                                        className="bg-blue-600 h-1.5 sm:h-2 rounded-full transition-all duration-300"
                                                        style={{
                                                            width: `${progress.progress}%`,
                                                        }}
                                                    />
                                                </div>
                                            )}
                                            {hasFile &&
                                                tempFiles[document.id] && (
                                                    <div className="mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                                        📎{" "}
                                                        {
                                                            tempFiles[
                                                                document.id
                                                            ].name
                                                        }{" "}
                                                        (
                                                        {(
                                                            tempFiles[
                                                                document.id
                                                            ].size /
                                                            (1024 * 1024)
                                                        ).toFixed(2)}{" "}
                                                        MB)
                                                    </div>
                                                )}
                                        </div>
                                    </div>

                                    <input
                                        type="file"
                                        style={{ display: "none" }}
                                        ref={(el) =>
                                            (fileInputs.current[document.id] =
                                                el)
                                        }
                                        onChange={(e) =>
                                            handleFileChange(document.id, e)
                                        }
                                        aria-label={`Téléverser ${document.name}`}
                                    />

                                    <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto justify-start sm:justify-end">
                                        {(document.previewUrl ||
                                            document.fichierRectoUrl ||
                                            document.fichierVersoUrl) && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    handlePreview(
                                                        document.previewUrl ||
                                                            document.fichierRectoUrl ||
                                                            document.fichierVersoUrl!,
                                                        document.name,
                                                    )
                                                }
                                                aria-label={`Prévisualiser ${document.name}`}
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                        )}
                                        {isEditable &&
                                            (hasFile ||
                                                document.fichierRectoUrl ||
                                                document.fichierVersoUrl) && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        removeDocument(
                                                            document.id,
                                                        )
                                                    }
                                                    aria-label={`Supprimer ${document.name}`}
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            )}
                                        {isEditable && (
                                            <Button
                                                size="sm"
                                                onClick={() =>
                                                    handleUpload(document.id)
                                                }
                                                aria-label={`Téléverser ${document.name}`}
                                            >
                                                <Upload className="w-4 h-4 mr-2" />
                                                {document.status ===
                                                StatutDocument.REFUSE
                                                    ? "Re-télécharger"
                                                    : "Télécharger"}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                    <Link to="/dashboard">
                        <Button variant="outline" size="lg">
                            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                            Retour au tableau de bord
                        </Button>
                    </Link>
                    <Button
                        size="lg"
                        disabled={isSubmitting}
                        onClick={handleSubmit}
                    >
                        {isSubmitting ? (
                            <Loader className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                        ) : (
                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        )}
                        {isSubmitting
                            ? "Envoi en cours..."
                            : `Valider les documents (${uploadedCount}/${requiredDocs.length})`}
                    </Button>
                </div>

                {/* Message d'aide */}
                {!hasRequiredFiles && (
                    <div className="mt-4 sm:mt-6">
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 sm:p-4 text-center">
                            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 inline mr-2" />
                            <span className="text-xs sm:text-sm text-yellow-800 dark:text-yellow-400">
                                Veuillez sélectionner tous les documents requis
                                avant de valider
                            </span>
                        </div>
                    </div>
                )}

                {/* Help Section */}
                <div className="mt-8 sm:mt-12 text-center">
                    <Card className="bg-nexsaas-light-gray dark:bg-gray-800 p-3 sm:p-4">
                        <h3 className="text-base sm:text-lg font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                            Besoin d'aide ?
                        </h3>
                        <p className="text-xs sm:text-sm text-nexsaas-vanta-black dark:text-gray-300 mb-3 sm:mb-4">
                            Notre équipe support est là pour vous accompagner
                            dans le processus de validation.
                        </p>
                        <Button variant="outline" size="sm">
                            Contacter le support
                        </Button>
                    </Card>
                </div>
            </div>

            {/* Modale de prévisualisation pour les PDF uniquement */}
            {previewModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 max-w-[90vw] sm:max-w-3xl w-full">
                        <h3 className="text-base sm:text-lg font-semibold">
                            {previewModal.name}
                        </h3>
                        <iframe
                            src={previewModal.url}
                            className="w-full h-[60vh] sm:h-96 mt-3 sm:mt-4"
                            title={`Prévisualisation de ${previewModal.name}`}
                        />
                        <Button
                            onClick={() => setPreviewModal(null)}
                            className="mt-3 sm:mt-4 w-full sm:w-auto"
                        >
                            Fermer
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentsRequiredPage;
