"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Text, Video } from "@shadcn/ui"; // Assuming you have the shadcn components

const IntroPage = () => {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [recording, setRecording] = useState(false);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);

  // Start Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      if (videoRef.current) videoRef.current.srcObject = stream;

      mediaRecorderRef.current = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      mediaRecorderRef.current.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorderRef.current.onstop = () => {
        const completeBlob = new Blob(chunks, { type: "video/webm" });
        setVideoBlob(completeBlob);
      };

      mediaRecorderRef.current.start();
      setRecording(true);
      setTimeout(stopRecording, 30000); // Auto-stop after 30s
    } catch (error) {
      alert("Camera access denied. Please enable it.");
    }
  };

  // Stop Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      videoRef.current?.srcObject?.getTracks().forEach((track) => track.stop());
    }
  };

  // Navigate to Quiz
  const handleContinue = () => {
    router.push("/quiz/demo-test");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <Card className="p-8 shadow-xl rounded-lg">
        <Text className="text-3xl font-semibold mb-6">
          Candidate Introduction
        </Text>

        <Video
          ref={videoRef}
          autoPlay
          muted
          className="rounded-lg shadow-lg w-96 h-64"
        />

        {!recording ? (
          <Button onClick={startRecording} className="mt-4">
            Start Recording
          </Button>
        ) : (
          <Button onClick={stopRecording} className="mt-4 bg-red-600">
            Stop Recording
          </Button>
        )}

        {videoBlob && (
          <div className="mt-6">
            <Text className="text-xl font-medium mb-2">Preview</Text>
            <Video
              controls
              src={URL.createObjectURL(videoBlob)}
              className="w-96 h-64"
            />
            <Button onClick={handleContinue} className="mt-4 bg-green-600">
              Continue to Quiz
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default IntroPage;
