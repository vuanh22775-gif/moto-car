import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, Loader } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

interface ImageUploaderProps {
  images: string[];          // mảng URL hiện tại
  onChange: (urls: string[]) => void;
  maxImages?: number;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  onChange,
  maxImages = 10,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // ── Upload files ────────────────────────────────────────────────────────
  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const remaining = maxImages - images.length;
    if (remaining <= 0) {
      toast.error(`Tối đa ${maxImages} ảnh`);
      return;
    }

    const selected = Array.from(files).slice(0, remaining);

    // Kiểm tra size & type phía client trước khi gửi lên server
    for (const file of selected) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`File "${file.name}" vượt quá 5MB`);
        return;
      }
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
        toast.error(`File "${file.name}" không hợp lệ (chỉ JPG, PNG, WEBP)`);
        return;
      }
    }

    setUploading(true);
    try {
      const formData = new FormData();
      selected.forEach(file => formData.append('images', file));

      const res = await api.post('/upload/vehicles', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      onChange([...images, ...res.data.urls]);
      toast.success(`Đã upload ${res.data.urls.length} ảnh`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Upload thất bại');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  // ── Xóa ảnh ────────────────────────────────────────────────────────────
  const handleRemove = async (url: string, idx: number) => {
    // Xóa khỏi UI trước
    onChange(images.filter((_, i) => i !== idx));

    // Gọi API xóa file trên server (không block UI)
    try {
      await api.delete('/upload/vehicles', { data: { url } });
    } catch {
      // Bỏ qua lỗi xóa file — ảnh đã được xóa khỏi form rồi
    }
  };

  // ── Drag & Drop ─────────────────────────────────────────────────────────
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleUpload(e.dataTransfer.files);
  };

  const canUploadMore = images.length < maxImages;

  return (
    <div className="space-y-3">
      {/* Ảnh đã upload */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {images.map((url, idx) => (
            <div key={idx} className="relative group aspect-square">
              <img
                src={url}
                alt={`Ảnh xe ${idx + 1}`}
                className="w-full h-full object-cover rounded-lg border border-gray-200"
              />
              {/* Nút xóa */}
              <button
                type="button"
                onClick={() => handleRemove(url, idx)}
                className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full
                           flex items-center justify-center opacity-0 group-hover:opacity-100
                           transition hover:bg-red-600"
              >
                <X size={11} />
              </button>
              {/* Badge số thứ tự */}
              {idx === 0 && (
                <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-[10px]
                                 px-1.5 py-0.5 rounded font-medium">
                  Ảnh bìa
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Vùng upload */}
      {canUploadMore && (
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition
            ${dragOver
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }
            ${uploading ? 'pointer-events-none opacity-60' : ''}`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2 text-blue-600">
              <Loader size={28} className="animate-spin" />
              <p className="text-sm font-medium">Đang upload...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-400">
              {dragOver
                ? <ImageIcon size={28} className="text-blue-500" />
                : <Upload size={28} />
              }
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Kéo thả hoặc <span className="text-blue-600">chọn file</span>
                </p>
                <p className="text-xs mt-0.5">JPG, PNG, WEBP · Tối đa 5MB/ảnh</p>
                <p className="text-xs text-gray-300 mt-0.5">
                  Còn có thể thêm {maxImages - images.length} ảnh
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Input file ẩn */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={e => handleUpload(e.target.files)}
      />
    </div>
  );
};

export default ImageUploader;