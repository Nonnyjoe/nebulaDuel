import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useWallet } from "@/hooks/useWallet";
import { useProfile } from "@/hooks/useProfile";
import { useSendInput } from "@/hooks/useSendInput";
import charactersdata from "@/lib/game/characters";
import { uploadToPinata, pinataConfigured } from "@/lib/pinata";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Gate shown when a connected wallet has no on-chain player yet. Registers one
 * via create_player(monika, avatar_url). The avatar can be a self-uploaded
 * image (pinned to IPFS via Pinata — the primary option) or one of the existing
 * character icons. Mounted once in GameLayout so it appears app-wide.
 */
export function CreatePlayerDialog() {
  const { isConnected } = useWallet();
  const { hasProfile, isLoading, refetch } = useProfile();
  const { send, pending } = useSendInput();

  const iconChoices = useMemo(() => charactersdata.slice(0, 8).map((c) => c.img), []);
  const fileRef = useRef<HTMLInputElement>(null);

  const [monika, setMonika] = useState("");
  const [avatar, setAvatar] = useState(iconChoices[0]); // value submitted as avatar_url
  const [customUrl, setCustomUrl] = useState<string | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const open = isConnected && !isLoading && !hasProfile && !dismissed;
  const usingCustom = !!customUrl && avatar === customUrl;

  const onPickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("Image is too large (max 5 MB).");
      return;
    }
    const preview = URL.createObjectURL(file);
    setLocalPreview(preview);
    setUploading(true);
    const id = toast.loading("Uploading your image to IPFS…");
    try {
      const url = await uploadToPinata(file);
      setCustomUrl(url);
      setAvatar(url);
      toast.success("Image uploaded", { id });
    } catch (err: any) {
      toast.error(err?.message ?? "Upload failed — pick a character icon instead", { id });
      setLocalPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const selectIcon = (img: string) => {
    setAvatar(img);
    setCustomUrl(null);
    if (localPreview) {
      URL.revokeObjectURL(localPreview);
      setLocalPreview(null);
    }
  };

  const submit = async () => {
    const name = monika.trim();
    if (!name || uploading) return;
    try {
      await send(
        "create_player",
        { monika: name, avatar_url: avatar },
        { pendingMsg: "Forging your operator…", successMsg: "Welcome to Nebula Duel!" },
      );
      await refetch();
    } catch {
      /* toast already shown */
    }
  };

  const uploadPreview = customUrl ?? localPreview;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && setDismissed(true)}>
      <DialogContent className="glass-panel clip-bevel border-primary/40 max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-3xl uppercase italic tracking-tight text-glow">
            Register Operator
          </DialogTitle>
          <DialogDescription className="font-mono-display text-xs uppercase tracking-widest text-muted-foreground">
            Pick a callsign and avatar to mint your on-chain profile.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          <div>
            <label className="block text-[10px] font-mono-display uppercase tracking-widest text-muted-foreground mb-2">
              Callsign
            </label>
            <input
              value={monika}
              onChange={(e) => setMonika(e.target.value)}
              maxLength={24}
              placeholder="ARCHON"
              className="w-full bg-panel-2/60 px-4 py-3 font-display uppercase tracking-widest text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary clip-chrome-sm"
            />
          </div>

          {/* PRIMARY — upload your own image */}
          <div>
            <label className="block text-[10px] font-mono-display uppercase tracking-widest text-muted-foreground mb-2">
              Avatar · Upload your image
            </label>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickFile} />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className={`group relative w-full h-40 grid place-items-center overflow-hidden clip-chrome-sm border transition ${
                usingCustom ? "border-primary glow-cyan-sm" : "border-dashed border-foreground/25 hover:border-primary/60"
              }`}
            >
              {uploadPreview ? (
                <>
                  <img src={uploadPreview} alt="avatar preview" className="absolute inset-0 size-full object-cover" />
                  <div className="absolute inset-0 bg-background/30 opacity-0 group-hover:opacity-100 transition grid place-items-center">
                    <span className="font-mono-display text-[10px] uppercase tracking-widest text-primary">Change image</span>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <div className="font-display text-4xl text-primary/70 leading-none">+</div>
                  <div className="font-mono-display text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
                    Upload photo · PNG/JPG/GIF · max 5MB
                  </div>
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 grid place-items-center bg-background/60">
                  <span className="size-7 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                </div>
              )}
            </button>
            {!pinataConfigured() && (
              <p className="mt-1 font-mono-display text-[9px] uppercase tracking-widest text-storm">
                Uploads disabled — set VITE_PINATA_* to enable. Pick an icon below.
              </p>
            )}
          </div>

          {/* SECONDARY — or pick a character icon */}
          <div>
            <div className="flex items-center gap-3 my-1">
              <span className="h-px flex-1 bg-foreground/10" />
              <span className="font-mono-display text-[9px] uppercase tracking-widest text-muted-foreground">or pick a character icon</span>
              <span className="h-px flex-1 bg-foreground/10" />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {iconChoices.map((img) => {
                const active = !usingCustom && avatar === img;
                return (
                  <button
                    key={img}
                    type="button"
                    onClick={() => selectIcon(img)}
                    className={`relative aspect-square overflow-hidden clip-chrome-sm border transition ${
                      active ? "border-primary glow-cyan-sm" : "border-foreground/10 hover:border-primary/50"
                    }`}
                  >
                    <img src={img} alt="" className="size-full object-cover" loading="lazy" />
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={submit}
            disabled={pending || uploading || !monika.trim()}
            className="w-full py-4 bg-primary text-primary-foreground font-display text-xl uppercase tracking-widest italic clip-chrome-sm glow-cyan-sm hover:brightness-110 transition disabled:opacity-50 disabled:pointer-events-none"
          >
            {pending ? "Registering…" : uploading ? "Uploading…" : "Enter the Arena →"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
