import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Camera, X } from "lucide-react";
import { BrowserQRCodeReader } from "@zxing/library";
import Button from "../UI/Button";

interface QRScannerProps {
    onScan: (result: string) => void;
    onClose: () => void;
    isOpen: boolean;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose, isOpen }) => {
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [scanTip, setScanTip] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const codeReader = useRef<BrowserQRCodeReader | null>(null);
    const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isScanningRef = useRef<boolean>(false);

    useEffect(() => {
        console.log("QRScanner mounted, isOpen:", isOpen);
        if (isOpen && !codeReader.current) {
            codeReader.current = new BrowserQRCodeReader();
            checkBrowserCompatibility();
        }
        return () => {
            console.log("QRScanner unmounting");
            stopScanner();
            if (scanTimeoutRef.current) {
                clearTimeout(scanTimeoutRef.current);
            }
        };
    }, [isOpen]);

    const checkBrowserCompatibility = () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.error("getUserMedia is not supported in this browser");
            setErrorMessage(
                "Ce navigateur ne prend pas en charge l'accès à la caméra. Essayez Chrome, Firefox, Edge ou Safari.",
            );
            setHasPermission(false);
            return;
        }
        requestCameraPermission();
    };

    const requestCameraPermission = async () => {
        console.log("Requesting camera permission...");
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: "environment",
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                },
            });
            console.log("Camera permission granted, stream obtained");
            setHasPermission(true);
            setErrorMessage(null);
            setScanTip(null);
            if (videoRef.current && codeReader.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => {
                    if (videoRef.current) {
                        videoRef.current.play().catch((err) => {
                            console.error("Video play error:", err);
                            setErrorMessage(
                                "Erreur lors de la lecture de la vidéo.",
                            );
                        });
                    }
                    startScanning();
                };
            }
        } catch (err: any) {
            console.error("Camera permission error:", err.name, err.message);
            setHasPermission(false);
            if (err.name === "NotAllowedError") {
                setErrorMessage(
                    "Accès à la caméra refusé. Veuillez autoriser l'accès dans les paramètres du navigateur.",
                );
            } else if (err.name === "NotFoundError") {
                setErrorMessage("Aucune caméra disponible.");
            } else if (err.name === "SecurityError") {
                setErrorMessage(
                    "Contexte sécurisé requis (utilisez HTTPS ou localhost).",
                );
            } else {
                setErrorMessage(`Erreur: ${err.message || "Erreur inconnue"}`);
            }
        }
    };

    const startScanning = async () => {
        if (!videoRef.current || !codeReader.current || isScanningRef.current) {
            console.log("Scanning already in progress or components not ready");
            return;
        }

        isScanningRef.current = true;
        try {
            console.log("Starting QR code scanning...");
            await codeReader.current.decodeFromVideoDevice(
                null, // Auto-select camera
                videoRef.current,
                (result, error) => {
                    if (result) {
                        console.log("QR Code detected:", result.getText());
                        onScan(result.getText());
                        // Keep scanner open for multiple scans
                    }
                    if (error) {
                        // Safely handle errors
                        const errorMessage = error?.message || String(error);
                        if (
                            errorMessage.includes("No MultiFormat Readers") ||
                            errorMessage.includes("No QR code found")
                        ) {
                            console.log("No valid QR code found in frame");
                        } else {
                            console.error(
                                "Scanning error:",
                                errorMessage,
                                error,
                            );
                        }
                    }
                },
            );

            // Set timeout for user feedback if no QR code is detected
            scanTimeoutRef.current = setTimeout(() => {
                setScanTip(
                    "Aucun code QR détecté. Essayez de rapprocher la caméra, d'améliorer l'éclairage ou de tapoter l'écran pour ajuster la mise au point.",
                );
                isScanningRef.current = false;
                stopScanner();
                // Restart scanning after a brief pause
                setTimeout(() => {
                    if (isOpen && videoRef.current) {
                        startScanning();
                    }
                }, 5000);
            }, 20000);
        } catch (err: any) {
            console.error("Scanning failed:", err.message || err);
            setErrorMessage(
                `Erreur lors du scan du QR code: ${
                    err.message || "Erreur inconnue"
                }`,
            );
            isScanningRef.current = false;
        }
    };

    const stopScanner = () => {
        console.log("Stopping scanner...");
        if (codeReader.current) {
            codeReader.current.reset();
            codeReader.current = null; // Ensure reader is recreated on next mount
        }
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = (
                videoRef.current.srcObject as MediaStream
            ).getTracks();
            tracks.forEach((track) => track.stop());
            videoRef.current.srcObject = null;
        }
        if (scanTimeoutRef.current) {
            clearTimeout(scanTimeoutRef.current);
            scanTimeoutRef.current = null;
        }
        setScanTip(null);
        isScanningRef.current = false;
    };

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-50 flex flex-col"
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-black/50">
                <h2 className="text-white text-lg font-semibold">
                    Scanner QR Code
                </h2>
                <Button variant="ghost" size="sm" onClick={onClose}>
                    <X className="w-6 h-6 text-white" />
                </Button>
            </div>

            {/* Scanner Area */}
            <div className="flex-1 relative">
                {hasPermission === true ? (
                    <>
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                        />

                        {/* Scanning Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                                className="w-64 h-64 border-4 border-nexsaas-saas-green rounded-lg relative"
                            >
                                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white"></div>
                                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white"></div>
                                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white"></div>
                                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white"></div>

                                <motion.div
                                    animate={{ y: [0, 240, 0] }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                    }}
                                    className="absolute top-0 left-0 w-full h-1 bg-nexsaas-saas-green"
                                />
                            </motion.div>
                        </div>

                        {/* Scan Tips */}
                        {scanTip && (
                            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-black/70 text-white p-4 rounded-lg max-w-sm text-center">
                                <p>{scanTip}</p>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center bg-gray-900">
                        <div className="text-center text-white p-8">
                            <Camera className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                            <h3 className="text-xl font-semibold mb-2">
                                {hasPermission === false
                                    ? errorMessage || "Accès caméra refusé"
                                    : "Vérification de la compatibilité..."}
                            </h3>
                            <p className="text-gray-300 mb-6">
                                {hasPermission === false
                                    ? errorMessage ||
                                      "Veuillez autoriser l'accès à la caméra pour scanner les QR codes"
                                    : "Vérification de l'accès à la caméra en cours..."}
                            </p>
                            {hasPermission === false &&
                                !errorMessage?.includes("navigateur") &&
                                !errorMessage?.includes("HTTPS") && (
                                    <Button
                                        onClick={requestCameraPermission}
                                        className="mb-4"
                                    >
                                        Réessayer
                                    </Button>
                                )}
                            {errorMessage?.includes("navigateur") && (
                                <p className="text-gray-300">
                                    Veuillez utiliser un navigateur moderne
                                    comme Chrome, Firefox, Edge ou Safari.
                                </p>
                            )}
                            {errorMessage?.includes("HTTPS") && (
                                <p className="text-gray-300">
                                    Veuillez accéder à ce site via HTTPS ou
                                    localhost.
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default QRScanner;
