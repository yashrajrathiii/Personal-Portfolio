import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { formatApiErrorDetail } from "@/lib/api";
import { Lock } from "lucide-react";

export default function AdminLoginDialog({ open, onOpenChange }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back, Yash.");
      onOpenChange(false);
      setEmail("");
      setPassword("");
    } catch (err) {
      const msg = formatApiErrorDetail(err.response?.data?.detail) || err.message;
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="admin-login-dialog" className="sm:max-w-md rounded-none border-2 border-[#0A0A0A] bg-white">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-4 h-4 text-klein" />
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-klein">Admin Access</span>
          </div>
          <DialogTitle className="font-display font-black uppercase text-3xl tracking-tightest leading-none">
            Edit Mode
          </DialogTitle>
          <DialogDescription className="text-neutral-500">
            Sign in to update sections, projects, and experience.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="font-mono text-[10px] tracking-[0.2em] uppercase text-neutral-500">
              Email
            </Label>
            <Input
              id="email"
              data-testid="login-email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              className="rounded-none border-black/15 focus-visible:ring-klein focus-visible:border-klein"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="font-mono text-[10px] tracking-[0.2em] uppercase text-neutral-500">
              Password
            </Label>
            <Input
              id="password"
              data-testid="login-password-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="rounded-none border-black/15 focus-visible:ring-klein focus-visible:border-klein"
            />
          </div>
          <Button
            type="submit"
            data-testid="login-submit-button"
            disabled={loading}
            className="w-full rounded-none bg-klein hover:bg-[#00227A] text-white font-mono text-[11px] tracking-[0.25em] uppercase py-6"
          >
            {loading ? "Authenticating..." : "Enter Edit Mode →"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
