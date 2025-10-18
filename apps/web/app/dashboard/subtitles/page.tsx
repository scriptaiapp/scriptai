"use client"
import { useState, useRef, ChangeEvent } from 'react';
import { Upload, FileVideo, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export default function VideoUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_SIZE = 50 * 1024 * 1024; // 50MB
  const MAX_DURATION = 8 * 60; // 8 minutes in seconds

  const validateVideo = (file: File): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      // Check file size
      if (file.size > MAX_SIZE) {
        reject('File size exceeds 100MB limit');
        return;
      }

      // Check video duration
      const video = document.createElement('video');
      video.preload = 'metadata';

      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        if (video.duration > MAX_DURATION) {
          reject('Video duration exceeds 8 minutes limit');
        } else {
          resolve(true);
        }
      };

      video.onerror = () => {
        reject('Invalid video file');
      };

      video.src = URL.createObjectURL(file);
    });
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setError('');
    setSuccess('');
    setFile(null);

    if (!selectedFile) return;

    // Check if it's a video file
    if (!selectedFile.type.startsWith('video/')) {
      setError('Please select a video file');
      return;
    }

    try {
      await validateVideo(selectedFile);
      setFile(selectedFile);
    } catch (err) {
      setError(err as string);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('video', file);

    try {
      const response = await fetch('/api/subtitle', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setSuccess('Video uploaded successfully!');
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || `Upload failed: ${response.statusText}`);
      }
    } catch (err) {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Video Upload</h1>
            <p className="text-gray-600">Upload your video for subtitle generation</p>
          </div>

          <div className="mb-6">
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-indigo-400 transition-colors">
              <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="video-upload"
                  disabled={uploading}
              />
              <label
                  htmlFor="video-upload"
                  className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="w-16 h-16 text-indigo-500 mb-4" />
                <span className="text-lg font-semibold text-gray-700 mb-2">
                Choose a video file
              </span>
                <span className="text-sm text-gray-500">
                Max 8 minutes • Max 100MB
              </span>
              </label>
            </div>
          </div>

          {file && (
              <div className="mb-6 p-4 bg-indigo-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <FileVideo className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">{file.name}</p>
                    <p className="text-sm text-gray-600">{formatFileSize(file.size)}</p>
                  </div>
                </div>
              </div>
          )}

          {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-800 text-sm">{error}</p>
              </div>
          )}

          {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-green-800 text-sm">{success}</p>
              </div>
          )}

          <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Uploading...
                </>
            ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Upload Video
                </>
            )}
          </button>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Supported formats: MP4, MOV, AVI, WebM</p>
          </div>
        </div>
      </div>
  );
}