import React, { useRef, useState } from "react";
import { QrReader } from "react-qr-reader";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ScanLine,
  StopCircle,
  CheckCircle2,
  AlertCircle,
  Loader2,
  QrCode,
  Wifi,
  HardHat,
  Upload,
  ImageIcon,
  X,
  Camera,
} from "lucide-react";

const BACKEND_URL = "http://localhost:3000/worker";

interface QRData {
  name: string;
  workerId: string;
  helmetId: string;
  role: string;
}

// ── Parse raw QR text as JSON into QRData ─────────────────────────────────────
function parseQRPayload(raw: string): QRData {
  try {
    const parsed = JSON.parse(raw);
    if (
      typeof parsed.name !== "string" ||
      typeof parsed.workerId !== "string" ||
      typeof parsed.helmetId !== "string" ||
      typeof parsed.role !== "string"
    ) {
      throw new Error(
        "QR code is missing required fields (name, workerId, helmetId, role).",
      );
    }
    return parsed as QRData;
  } catch {
    throw new Error(
      "QR code does not contain valid miner data. Expected JSON format.",
    );
  }
}

// ── Shared helper: POST QRData to backend ────────────────────────────────────
async function postToBackend(payload: QRData) {
  const res = await fetch(BACKEND_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload }),
  });
  // console.log(res.json());
  if (!res.ok) throw new Error(`Server responded with ${res.status}`);
  return res.json();
}

// ─────────────────────────────────────────────────────────────────────────────

type Tab = "camera" | "upload";

const QRScanner: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("camera");

  // ── Camera state ─────────────────────────────────────────
  const [scanning, setScanning] = useState(false);

  // ── Upload state ─────────────────────────────────────────
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraRequestInFlightRef = useRef(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [decoding, setDecoding] = useState(false);

  // ── Shared state ─────────────────────────────────────────
  const [qrData, setQrData] = useState<QRData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // ── Shared: parse JSON, update state, POST to backend ────
  const submitToBackend = async (rawText: string): Promise<boolean> => {
    let parsed: QRData;
    try {
      parsed = parseQRPayload(rawText);
    } catch (err: any) {
      setError(err.message);
      return false;
    }
    setQrData(parsed);
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const data = await postToBackend(parsed);
      setSuccessMsg(data?.message ?? "Check-in successful");
      return true;
    } catch (err: any) {
      setError(err.message ?? "Something went wrong. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ── Camera: handle QrReader result ───────────────────────
  const handleCameraScan = async (result: any) => {
    if (!result?.text) return;
    if (!scanning || loading || successMsg || cameraRequestInFlightRef.current) {
      return;
    }

    if (qrData && result.text.includes(qrData.workerId)) return;

    cameraRequestInFlightRef.current = true;
    try {
      const success = await submitToBackend(result.text);
      if (success) {
        setScanning(false);
      }
    } finally {
      cameraRequestInFlightRef.current = false;
    }
  };

  // ── Upload: decode QR from image file ────────────────────
  const decodeImageFile = async (file: File) => {
    setDecoding(true);
    setError(null);
    setSuccessMsg(null);
    setQrData(null);

    const objectUrl = URL.createObjectURL(file);
    setUploadPreview(objectUrl);

    try {
      const reader = new BrowserMultiFormatReader();
      const imgEl = document.createElement("img");
      imgEl.src = objectUrl;
      await new Promise<void>((resolve, reject) => {
        imgEl.onload = () => resolve();
        imgEl.onerror = () => reject(new Error("Image failed to load"));
      });

      const result = await reader.decodeFromImageElement(imgEl);
      // result.getText() is expected to be a JSON string matching QRData
      await submitToBackend(result.getText());
    } catch (err: any) {
      const msg = err?.message?.includes("No MultiFormat")
        ? "No QR code found in this image. Please try a clearer photo."
        : (err?.message ?? "Could not decode image.");
      setError(msg);
    } finally {
      setDecoding(false);
    }
  };

  const handleFileChange = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (PNG, JPG, WEBP…).");
      return;
    }
    setUploadedFile(file);
    decodeImageFile(file);
  };

  // ── Drag-and-drop handlers ────────────────────────────────
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };
  const onDragLeave = () => setDragging(false);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFileChange(e.dataTransfer.files);
  };

  // ── Reset everything ──────────────────────────────────────
  const handleReset = () => {
    setScanning(false);
    cameraRequestInFlightRef.current = false;
    setUploadedFile(null);
    if (uploadPreview) URL.revokeObjectURL(uploadPreview);
    setUploadPreview(null);
    setQrData(null);
    setError(null);
    setSuccessMsg(null);
    setLoading(false);
    setDecoding(false);
  };

  const switchTab = (tab: Tab) => {
    handleReset();
    setActiveTab(tab);
  };

  // ─────────────────────────────────────────────────────────
  return (
    <Card className="w-full bg-white border border-border shadow-sm overflow-hidden">
      {/* ── Header ─────────────────────────────────────────── */}
      <CardHeader className="px-6 pt-5 pb-4 border-b border-border/50">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between w-full">
          {/* Title */}
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 shadow-sm border border-primary/20">
              <QrCode className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                QR Code Check-in
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Scan or upload a miner's QR badge to log attendance
              </p>
            </div>
          </div>

          {/* Right: live pill + action button */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {scanning && activeTab === "camera" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1.5 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-md font-medium"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </motion.div>
            )}

            {activeTab === "camera" && (
              <>
                {!scanning ? (
                  <Button
                    onClick={() => {
                      handleReset();
                      setScanning(true);
                    }}
                    className="w-full sm:w-auto gap-2 bg-primary hover:bg-primary/90 text-white shadow-sm"
                  >
                    <ScanLine className="w-4 h-4" />
                    Start Scanning
                  </Button>
                ) : (
                  <Button
                    onClick={handleReset}
                    variant="destructive"
                    className="w-full sm:w-auto gap-2"
                  >
                    <StopCircle className="w-4 h-4" />
                    Stop
                  </Button>
                )}
              </>
            )}

            {activeTab === "upload" && uploadedFile && (
              <Button
                onClick={handleReset}
                variant="outline"
                size="sm"
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {/* ── Body ───────────────────────────────────────────── */}
      <CardContent className="p-6 space-y-5">
        {/* ── Tab Switcher ─────────────────────────────────── */}
        <div className="flex gap-1 p-1 bg-slate-100 rounded-lg w-fit">
          {(["camera", "upload"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => switchTab(tab)}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="tab-pill"
                  className="absolute inset-0 bg-white rounded-md shadow-sm border border-border/60"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                {tab === "camera" ? (
                  <Camera className="w-4 h-4" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                {tab === "camera" ? "Camera" : "Upload Image"}
              </span>
            </button>
          ))}
        </div>

        {/* ── Error Banner ─────────────────────────────────── */}
        <AnimatePresence>
          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="p-4 rounded-lg bg-red-50 text-red-700 border border-red-200 flex items-start gap-3 text-sm"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Check-in Failed</p>
                <p className="mt-0.5 opacity-90">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Success Banner ───────────────────────────────── */}
        <AnimatePresence>
          {successMsg && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="p-4 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-start gap-3 text-sm"
            >
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-600" />
              <div>
                <p className="font-semibold">Check-in Recorded</p>
                <p className="mt-0.5 opacity-80">{successMsg}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ══════════════════════════════════════════════════ */}
        {/* ── TAB: CAMERA ──────────────────────────────────── */}
        {/* ══════════════════════════════════════════════════ */}
        <AnimatePresence mode="wait">
          {activeTab === "camera" && (
            <motion.div
              key="camera-tab"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.22 }}
            >
              <AnimatePresence mode="wait">
                {scanning ? (
                  <motion.div
                    key="scanner"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.3 }}
                    className="relative w-full aspect-[4/3] sm:aspect-[16/9] rounded-xl overflow-hidden bg-black border border-border shadow-inner"
                  >
                    <div className="absolute inset-0">
                      <QrReader
                        constraints={{ facingMode: "environment" }}
                        onResult={handleCameraScan}
                        scanDelay={300}
                        containerStyle={{ width: "100%", height: "100%" }}
                        videoStyle={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        videoContainerStyle={{
                          width: "100%",
                          height: "100%",
                          padding: 0,
                        }}
                      />
                    </div>

                    {/* Live badge */}
                    <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/10 shadow-lg">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-[pulse_1s_ease-in-out_infinite]" />
                      SCANNING
                    </div>

                    {/* Backend loading overlay */}
                    <AnimatePresence>
                      {loading && (
                        <motion.div
                          key="loader"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 z-20 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center gap-3"
                        >
                          <Loader2 className="w-8 h-8 text-white animate-spin" />
                          <p className="text-white text-sm font-medium">
                            Sending to backend…
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Corner viewfinder + scan line */}
                    <div className="absolute inset-0 pointer-events-none p-8 sm:p-16 z-10">
                      <div className="w-full h-full relative">
                        <div className="absolute top-0 left-0 w-10 h-10 border-t-[3px] border-l-[3px] border-primary rounded-tl-lg" />
                        <div className="absolute top-0 right-0 w-10 h-10 border-t-[3px] border-r-[3px] border-primary rounded-tr-lg" />
                        <div className="absolute bottom-0 left-0 w-10 h-10 border-b-[3px] border-l-[3px] border-primary rounded-bl-lg" />
                        <div className="absolute bottom-0 right-0 w-10 h-10 border-b-[3px] border-r-[3px] border-primary rounded-br-lg" />
                        <motion.div
                          className="absolute left-0 right-0 h-[2px] bg-primary/70 shadow-[0_0_8px_hsl(var(--primary))]"
                          animate={{ top: ["8%", "92%", "8%"] }}
                          transition={{
                            duration: 2.4,
                            ease: "easeInOut",
                            repeat: Infinity,
                          }}
                        />
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  /* Idle placeholder */
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full aspect-[4/3] sm:aspect-[16/9] rounded-xl border-2 border-dashed border-border bg-slate-50/50 flex flex-col items-center justify-center p-6 text-muted-foreground hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                      <QrCode className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="font-medium text-slate-600">
                      Scanner Inactive
                    </p>
                    <p className="text-sm mt-1 text-slate-500 text-center max-w-xs">
                      Click{" "}
                      <span className="font-medium text-primary">
                        Start Scanning
                      </span>{" "}
                      and hold a miner's QR badge up to the camera.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════ */}
          {/* ── TAB: UPLOAD ──────────────────────────────────── */}
          {/* ══════════════════════════════════════════════════ */}
          {activeTab === "upload" && (
            <motion.div
              key="upload-tab"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.22 }}
              className="space-y-4"
            >
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange(e.target.files)}
              />

              {/* Drop zone OR preview */}
              <AnimatePresence mode="wait">
                {!uploadedFile ? (
                  /* ── Drop zone ─────────────────────────────── */
                  <motion.div
                    key="dropzone"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full aspect-[4/3] sm:aspect-[16/9] rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-8 cursor-pointer select-none transition-all duration-200 ${dragging
                      ? "border-primary bg-primary/5 scale-[1.01]"
                      : "border-border bg-slate-50/50 hover:bg-slate-50 hover:border-primary/40"
                      }`}
                  >
                    <motion.div
                      animate={{ y: dragging ? -6 : 0 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5"
                    >
                      <Upload className="w-7 h-7 text-primary" />
                    </motion.div>

                    <p className="font-semibold text-slate-700 text-base">
                      {dragging ? "Drop to decode" : "Upload QR Image"}
                    </p>
                    <p className="text-sm text-slate-500 mt-1.5 text-center max-w-xs">
                      Drag &amp; drop or{" "}
                      <span className="text-primary font-medium underline underline-offset-2">
                        browse
                      </span>{" "}
                      an image containing a QR or barcode
                    </p>
                    <div className="flex items-center gap-2 mt-4 text-xs text-slate-400">
                      <ImageIcon className="w-3.5 h-3.5" />
                      PNG, JPG, WEBP, GIF supported
                    </div>
                  </motion.div>
                ) : (
                  /* ── Image preview + decode status ─────────── */
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.25 }}
                    className="relative w-full rounded-xl overflow-hidden border border-border bg-black shadow-inner"
                  >
                    <img
                      src={uploadPreview ?? ""}
                      alt="Uploaded QR"
                      className="w-full object-contain max-h-[50vh]"
                    />

                    {/* Decoding overlay */}
                    <AnimatePresence>
                      {decoding && (
                        <motion.div
                          key="decoding"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 bg-black/55 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-10"
                        >
                          <Loader2 className="w-9 h-9 text-white animate-spin" />
                          <p className="text-white text-sm font-medium">
                            Decoding QR code…
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* File name badge */}
                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-lg border border-white/10 max-w-[70%] truncate">
                      {uploadedFile.name}
                    </div>

                    {/* Re-upload button */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-lg border border-white/10 hover:bg-black/80 transition-colors flex items-center gap-1.5"
                    >
                      <Upload className="w-3 h-3" />
                      Replace
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Quick upload button below drop zone (when idle) */}
              {!uploadedFile && (
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="w-full gap-2 border-primary/30 text-primary hover:bg-primary/5 hover:border-primary/60"
                >
                  <ImageIcon className="w-4 h-4" />
                  Choose Image File
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Scanned miner card ───────────────────────────── */}
        <AnimatePresence>
          {qrData && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="rounded-xl border border-border bg-slate-50 overflow-hidden"
            >
              {/* Card header */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border/60 bg-white">
                <Wifi className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Scanned Miner
                </span>
                {loading && (
                  <span className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Sending…
                  </span>
                )}
              </div>

              {/* Miner info grid */}
              <div className="p-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/20 shadow-sm">
                    <HardHat className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-foreground leading-tight">
                      {qrData.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                      {qrData.role}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-white border border-border px-3 py-2">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-0.5">
                      Worker ID
                    </p>
                    <p className="text-sm font-mono font-semibold text-foreground">
                      {qrData.workerId}
                    </p>
                  </div>
                  <div className="rounded-lg bg-white border border-border px-3 py-2">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-0.5">
                      Helmet ID
                    </p>
                    <p className="text-sm font-mono font-semibold text-foreground">
                      {qrData.helmetId}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer action */}
              <div className="px-4 pb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="text-xs h-7 px-3 text-muted-foreground hover:text-foreground"
                >
                  Clear &amp; Reset
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default QRScanner;
