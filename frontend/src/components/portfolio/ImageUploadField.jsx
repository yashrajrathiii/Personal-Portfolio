import { useRef, useState } from "react";
import api, { API } from "@/lib/api";
import { toast } from "sonner";
import { Upload, X, Loader2 } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function resolveUrl(url) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/")) return `${BACKEND_URL}${url}`;
  return url;
}

export default function ImageUploadField({ value, onChange, testid = "image-upload" }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const onPick = () => inputRef.current?.click();

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // reset so same file can be re-picked
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/jpg", "image/webp"].includes(file.type)) {
      toast.error("Please choose a JPEG, PNG or WEBP image");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB");
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await api.post("/uploads/image", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onChange(data.url);
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const remove = () => onChange("");
  const displayUrl = resolveUrl(value);

  return (
    <div data-testid={testid} className="space-y-3">
      {displayUrl ? (
        <div className="relative border border-black/15">
          <img src={displayUrl} alt="Project cover" className="w-full aspect-[16/9] object-cover" />
          <button
            type="button"
            onClick={remove}
            data-testid={`${testid}-remove`}
            className="absolute top-2 right-2 p-1.5 bg-white border border-black/15 hover:border-red-500 hover:text-red-600"
            title="Remove image"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onPick}
          disabled={uploading}
          data-testid={`${testid}-button`}
          className="w-full aspect-[16/9] border border-dashed border-black/20 hover:border-klein hover:text-klein flex flex-col items-center justify-center gap-2 font-mono text-[10px] tracking-[0.2em] uppercase text-neutral-500 transition-colors"
        >
          {uploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Uploading...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              Choose JPEG / PNG / WEBP
              <span className="text-[9px] text-neutral-400">Up to 5 MB</span>
            </>
          )}
        </button>
      )}
      {displayUrl && (
        <button
          type="button"
          onClick={onPick}
          disabled={uploading}
          data-testid={`${testid}-replace`}
          className="w-full py-2 border border-black/15 font-mono text-[10px] tracking-[0.2em] uppercase text-neutral-600 hover:border-klein hover:text-klein"
        >
          {uploading ? "Uploading..." : "Replace Image"}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={onFile}
        className="hidden"
        data-testid={`${testid}-input`}
      />
    </div>
  );
}
