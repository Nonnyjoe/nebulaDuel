import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWallet } from "@/hooks/useWallet";
import { useProfile } from "@/hooks/useProfile";
import { CHAIN_NAME } from "@/lib/cartesi/client";

function shorten(addr: string) {
  return `${addr.slice(0, 5)}...${addr.slice(-4)}`;
}

export function WalletHUD() {
  const { address, isConnected, isConnecting, connect, disconnect } = useWallet();
  const { profile } = useProfile();

  if (!isConnected || !address) {
    return (
      <button
        type="button"
        onClick={connect}
        disabled={isConnecting}
        className="glass-hud clip-chrome px-5 py-2.5 flex items-center gap-2 border-l-4 border-primary glow-cyan-sm font-display text-sm uppercase tracking-widest text-primary hover:brightness-110 transition disabled:opacity-60"
      >
        {isConnecting ? "Connecting…" : "Connect Wallet"}
      </button>
    );
  }

  const ctsi = Number(profile?.cartesi_token_balance ?? 0);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="glass-hud clip-chrome px-4 py-2 flex items-center gap-4 border-l-4 border-primary glow-cyan-sm text-left hover:brightness-110 transition"
        >
          <div className="text-right hidden sm:block">
            <div className="text-[9px] font-mono-display text-primary/60 leading-none uppercase tracking-widest">
              Network · {CHAIN_NAME}
            </div>
            <div className="text-xs font-bold font-mono-display mt-0.5">{shorten(address)}</div>
          </div>
          <div className="h-8 w-px bg-primary/20 hidden sm:block" />
          <div>
            <div className="text-[9px] font-mono-display text-primary/60 leading-none uppercase tracking-widest">
              Balance
            </div>
            <div className="text-sm font-display text-primary tracking-wide mt-0.5">
              {ctsi.toLocaleString()} <span className="text-foreground/60 text-xs">CTSI</span>
            </div>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="glass-hud border-primary/20 font-mono-display text-xs">
        <DropdownMenuLabel className="uppercase tracking-widest text-[10px] text-primary/70">
          {profile?.monika ? `${profile.monika} · ` : ""}
          {shorten(address)}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/profile" className="uppercase tracking-widest">Command Center</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/wallet" className="uppercase tracking-widest">Manage Funds</Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigator.clipboard?.writeText(address)}
          className="uppercase tracking-widest"
        >
          Copy Address
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={disconnect}
          className="uppercase tracking-widest text-destructive focus:text-destructive"
        >
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
