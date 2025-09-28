'use client';

import { useState } from 'react';
import { Upload, X, Check, Loader } from 'lucide-react';

interface FileUploadProps {
  uploadType: 'profile' | 'project' | 'general';
  onUploadComplete?: (url: string, fileName: string) => void;
  currentImage?: string;
  acceptedTypes?: string;
  maxSize?: number; // in MB
  className?: string;
}

export default function FileUpload({
  uploadType,
  onUploadComplete,
  currentImage,
  acceptedTypes = 'image/*',
  maxSize = 5,
  className = ''
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<string>(currentImage || '');

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`);
      return;
    }

    // Create preview
    if (acceptedTypes.includes('.pdf')) {
      // For documents, just set a flag that file is selected
      setPreview('document-selected');
    } else {
      // For images, create actual preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }

    // Upload file
    setUploading(true);
    setError('');
    setUploadSuccess(false);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('uploadType', uploadType);
      
      if (uploadType === 'project') {
        const fileName = `project-${Date.now()}.${file.name.split('.').pop()}`;
        formData.append('fileName', fileName);
      } else if (uploadType === 'general') {
        const fileName = `cv-${Date.now()}.${file.name.split('.').pop()}`;
        formData.append('fileName', fileName);
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setUploadSuccess(true);
        onUploadComplete?.(result.url, result.fileName);
        setTimeout(() => setUploadSuccess(false), 3000);
      } else {
        setError(result.message || 'Upload failed');
      }
    } catch (err) {
      setError('Upload failed. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const clearPreview = () => {
    setPreview('');
    setError('');
    setUploadSuccess(false);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div className="relative">
        <input
          type="file"
          accept={acceptedTypes}
          onChange={handleFileChange}
          disabled={uploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          id={`file-upload-${uploadType}`}
        />
        <label
          htmlFor={`file-upload-${uploadType}`}
          className={`
            flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer
            transition-all duration-200 hover:bg-gray-50
            ${uploading ? 'border-primary-400 bg-primary-50' : 'border-gray-300'}
            ${error ? 'border-red-400 bg-red-50' : ''}
            ${uploadSuccess ? 'border-green-400 bg-green-50' : ''}
          `}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {uploading ? (
              <Loader className="w-8 h-8 mb-2 text-primary-500 animate-spin" />
            ) : uploadSuccess ? (
              <Check className="w-8 h-8 mb-2 text-green-500" />
            ) : (
              <Upload className="w-8 h-8 mb-2 text-gray-400" />
            )}
            
            <p className="mb-2 text-sm text-gray-500">
              {uploading ? (
                'Uploading...'
              ) : uploadSuccess ? (
                'Upload successful!'
              ) : (
                <>
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </>
              )}
            </p>
            
            {!uploading && !uploadSuccess && (
              <p className="text-xs text-gray-500">
                {acceptedTypes.includes('.pdf') 
                  ? `PDF, DOC, DOCX up to ${maxSize}MB`
                  : `PNG, JPG, WebP, GIF up to ${maxSize}MB`
                }
              </p>
            )}
          </div>
        </label>
      </div>

      {/* Preview */}
      {preview && (
        <div className="relative">
          <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
            {preview === 'document-selected' ? (
              // Document preview
              <div className="flex flex-col items-center justify-center h-full text-gray-600">
                <Upload className="w-12 h-12 mb-2" />
                <p className="text-sm font-medium">Document ready for upload</p>
                <p className="text-xs text-gray-500">Preview not available</p>
              </div>
            ) : (
              // Image preview
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            )}
            <button
              onClick={clearPreview}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {uploadSuccess && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-600">File uploaded successfully!</p>
        </div>
      )}
    </div>
  );
}
