import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Camera, X, Scan } from "lucide-react";
import jsQR from "jsqr";
import Button from "../UI/Button";

interface QRScannerProps {
    onScan: (result: string) => void;
    onClose: () => void;
    isOpen: boolean;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose, isOpen }) => {
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameId = useRef<number | null>(null);

    useEffect(() => {
        console.log("QRScanner mounted, isOpen:", isOpen);
        if (isOpen) {
            checkBrowserCompatibility();
        }
        return () => {
            console.log("QRScanner unmounting");
            stopCamera();
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, [isOpen]);

    const checkBrowserCompatibility = () => {
        // Check for secure context (HTTPS or localhost)
        const isSecureContext =
            window.isSecureContext !== false &&
            (window.location.protocol === "https:" ||
                window.location.hostname === "localhost" ||
                window.location.hostname === "127.0.0.1");
        if (!isSecureContext) {
            console.error(
                "Insecure context detected. Camera access requires HTTPS or localhost.",
            );
            setErrorMessage(
                "Accès à la caméra requis : veuillez utiliser HTTPS ou localhost.",
            );
            setHasPermission(false);
            return;
        }

        // Check for getUserMedia support
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.error("getUserMedia is not supported in this browser");
            setErrorMessage(
                "Ce navigateur ne prend pas en charge l'accès à la caméra. Essayez Chrome, Firefox, Edge ou Safari.",
            );
            setHasPermission(false);
            return;
        }

        checkCameraAvailability();
    };

    const checkCameraAvailability = async () => {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(
                (device) => device.kind === "videoinput",
            );
            if (videoDevices.length === 0) {
                console.error("No video input devices found");
                setErrorMessage("Aucune caméra détectée sur cet appareil.");
                setHasPermission(false);
            } else {
                console.log("Available cameras:", videoDevices);
                requestCameraPermission();
            }
        } catch (err) {
            console.error("Error checking devices:", err);
            setErrorMessage("Erreur lors de la vérification des appareils.");
            setHasPermission(false);
        }
    };

    const requestCameraPermission = async () => {
        console.log("Requesting camera permission...");
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: "environment", // Prefer rear camera
                    width: { ideal: 1280 }, // Optimize for performance
                    height: { ideal: 720 },
                },
            });
            console.log("Camera permission granted, stream obtained");
            setHasPermission(true);
            setErrorMessage(null);
            if (videoRef.current) {
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
                    if (isScanning) {
                        scanQRCode();
                    }
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
                setErrorMessage(`Erreur: ${err.message}`);
            }
        }
    };

    const stopCamera = () => {
        console.log("Stopping camera...");
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = (
                videoRef.current.srcObject as MediaStream
            ).getTracks();
            tracks.forEach((track) => track.stop());
            videoRef.current.srcObject = null;
        }
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
            animationFrameId.current = null;
        }
    };

    const scanQRCode = () => {
        if (!videoRef.current || !canvasRef.current || !isScanning) return;

        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        if (!context) {
            console.error("Failed to get canvas context");
            setErrorMessage(
                "Erreur: Impossible d'accéder au contexte du canvas.",
            );
            return;
        }

        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const imageData = context.getImageData(
            0,
            0,
            canvas.width,
            canvas.height,
        );

        const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
        });

        if (code) {
            console.log("QR Code detected:", code.data);
            onScan(code.data);
            setIsScanning(false);
            return;
        }

        animationFrameId.current = requestAnimationFrame(scanQRCode);
    };

    const startScanning = () => {
        if (!isScanning && hasPermission) {
            console.log("Starting QR code scanning");
            setIsScanning(true);
            scanQRCode();
        }
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
                            muted // Ensure compatibility with iOS Safari
                            className="w-full h-full object-cover"
                        />
                        <canvas ref={canvasRef} style={{ display: "none" }} />

                        {/* Scanning Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <motion.div
                                animate={
                                    isScanning ? { scale: [1, 1.1, 1] } : {}
                                }
                                transition={{ duration: 1, repeat: Infinity }}
                                className="w-64 h-64 border-4 border-nexsaas-saas-green rounded-lg relative"
                            >
                                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white"></div>
                                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white"></div>
                                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white"></div>
                                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white"></div>

                                {isScanning && (
                                    <motion.div
                                        animate={{ y: [0, 240, 0] }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                        }}
                                        className="absolute top-0 left-0 w-full h-1 bg-nexsaas-saas-green"
                                    />
                                )}
                            </motion.div>
                        </div>

                        {/* Scan Button */}
                        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
                            <Button
                                onClick={startScanning}
                                disabled={isScanning}
                                className="bg-nexsaas-saas-green hover:bg-green-600 text-white px-8 py-4 rounded-full"
                            >
                                {isScanning ? (
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{
                                            duration: 1,
                                            repeat: Infinity,
                                            ease: "linear",
                                        }}
                                    >
                                        <Scan className="w-6 h-6" />
                                    </motion.div>
                                ) : (
                                    <>
                                        <Camera className="w-6 h-6 mr-2" />
                                        Scanner
                                    </>
                                )}
                            </Button>
                        </div>
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
                                      "Veuillez autoriser l'accès à la caméra pour scanner les codes QR"
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
