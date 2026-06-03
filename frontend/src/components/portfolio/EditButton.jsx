import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Pencil } from "lucide-react";

export default function EditButton({ onClick, label = "Edit", testid }) {
  const { isAdmin } = useAuth();
  const [hovered, setHovered] = useState(false);
  if (!isAdmin) return null;
  return (
    <button
      data-testid={testid || "edit-button"}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-klein text-klein font-mono text-[10px] tracking-[0.2em] uppercase hover:bg-klein hover:text-white transition-colors"
    >
      <Pencil className="w-3 h-3" />
      <span>{hovered ? label : "Edit"}</span>
    </button>
  );
}
