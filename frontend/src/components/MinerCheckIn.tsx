import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Camera, StopCircle, Video, AlertCircle } from "lucide-react";

const FRAME_INTERVAL_MS = 500; // send 1 frame every 500ms
const BACKEND_ENDPOINT = "http://localhost:8000/detect"; // change this

const LiveRecorder: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<number | null>(null);

  const [recording, setRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Attach stream to video tag whenever recording becomes true
  useEffect(() => {
    if (recording && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(console.error);
    }
  }, [recording]);

  // Start camera + frame sending
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      streamRef.current = stream;
      setRecording(true);
      startFrameCapture();
    } catch (err) {
      setError("Camera access denied or unavailable");
      console.error(err);
    }
  };

  // Stop everything
  const stopRecording = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    setRecording(false);
  };

  // Capture frames & send to backend
  const startFrameCapture = () => {
    intervalRef.current = window.setInterval(() => {
      if (!videoRef.current || !canvasRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      if (!ctx) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(async (blob) => {
        if (!blob) return;

        const formData = new FormData();
        formData.append("frame", blob, "frame.jpg");

        try {
          const res = await fetch("http://localhost:8000/detect", {
            method: "POST",
            body: formData, // DO NOT set headers
          });

          if (!res.ok) {
            console.error("Server error:", await res.text());
            return;
          }

          const data = await res.json();
          console.log(data);
        } catch (err) {
          console.error("Failed to send frame", err);
        }
      }, "image/jpeg");
    }, FRAME_INTERVAL_MS);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => stopRecording();
  }, []);

  return (
    <Card className="w-full bg-white border-border shadow-sm overflow-hidden">
      <CardHeader className="px-6 pt-5 pb-4 border-b border-border/50">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between w-full">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 shadow-sm border border-primary/20">
              <Video className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Miner Facial Check-in
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Verify identity and log attendance securely
              </p>
            </div>
          </div>

          <div className="w-full sm:w-auto">
            {!recording ? (
              <Button
                onClick={startRecording}
                className="w-full sm:w-auto gap-2 bg-primary hover:bg-primary/90 text-white shadow-equipment"
              >
                <Camera className="w-4 h-4" />
                Start Camera
              </Button>
            ) : (
              <Button
                onClick={stopRecording}
                variant="destructive"
                className="w-full sm:w-auto gap-2"
              >
                <StopCircle className="w-4 h-4" />
                Stop Camera
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {error && (
          <div className="mb-5 p-4 rounded-lg bg-red-50 text-red-700 border border-red-200 flex items-start gap-3 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Failed to start camera</p>
              <p className="mt-1 opacity-90">{error}</p>
            </div>
          </div>
        )}

        {recording && (
          <div className="w-full rounded-xl overflow-hidden bg-black border border-border shadow-inner relative aspect-[16/9] sm:aspect-[21/9] flex justify-center items-center">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />

            <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/10 shadow-lg z-10">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-[pulse_1s_ease-in-out_infinite]" />
              LIVE FEED
            </div>

            {/* Viewfinder overlay */}
            <div className="absolute inset-0 pointer-events-none p-6 sm:p-12 z-0">
              <div className="w-full h-full border border-white/10 rounded-2xl relative">
                {/* Corners */}
                <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-primary rounded-tl-2xl" />
                <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-primary rounded-tr-2xl" />
                <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-primary rounded-bl-2xl" />
                <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-primary rounded-br-2xl" />
              </div>
            </div>
          </div>
        )}

        {!recording && !error && (
          <div className="w-full aspect-[16/9] sm:aspect-[21/9] rounded-xl border-2 border-dashed border-border bg-slate-50/50 flex flex-col items-center justify-center p-6 text-muted-foreground transition-all hover:bg-slate-50">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <Video className="w-8 h-8 text-slate-400" />
            </div>
            <p className="font-medium text-slate-600">Camera is Inactive</p>
            <p className="text-sm mt-1 text-slate-500 text-center max-w-sm">
              Click "Start Camera" to begin the facial check-in process. Keep
              your face clearly visible within the frame.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LiveRecorder;
