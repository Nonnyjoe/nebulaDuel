import { useState } from "react";
import { ethers } from "ethers";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { GameLayout } from "@/components/game/GameLayout";
import { PageHeader } from "@/components/game/PageHeader";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useWallet } from "@/hooks/useWallet";
import { useProfile } from "@/hooks/useProfile";
import { useSendInput } from "@/hooks/useSendInput";
import { useVouchers, useExecuteVoucher } from "@/hooks/useVouchers";
import { usePlayerCharacters } from "@/hooks/game";
import { depositCtsi } from "@/lib/cartesi/portals";
import { getBrowserSigner } from "@/lib/cartesi/signer";

export default function Wallet() {
  useDocumentTitle("Wallet — Nebula Duel");
  const { address, isConnected, connect } = useWallet();
  const { profile, refetch } = useProfile();
  const { send, pending } = useSendInput();
  const qc = useQueryClient();

  const points = Number(profile?.points ?? 0);
  const ctsi = Number(profile?.cartesi_token_balance ?? 0);

  const [depositAmt, setDepositAmt] = useState(10);
  const [withdrawAmt, setWithdrawAmt] = useState(10);
  const [pointsAmt, setPointsAmt] = useState(10);
  const [depositing, setDepositing] = useState(false);

  const doDeposit = async () => {
    if (depositAmt <= 0) return;
    setDepositing(true);
    const id = toast.loading("Depositing CTSI…");
    try {
      await depositCtsi(ethers.BigNumber.from(Math.floor(depositAmt)), getBrowserSigner());
      toast.success("Deposit submitted — balance updates shortly", { id });
      setTimeout(() => {
        qc.invalidateQueries({ queryKey: ["profile"] });
        refetch();
      }, 4000);
    } catch (e: any) {
      toast.error(e?.reason ?? e?.message ?? "Deposit failed", { id });
    } finally {
      setDepositing(false);
    }
  };

  if (!isConnected) {
    return (
      <GameLayout>
        <div className="max-w-2xl mx-auto px-6 py-28 text-center space-y-5">
          <div className="font-mono-display text-[10px] tracking-[0.3em] text-primary uppercase">// TREASURY</div>
          <h1 className="font-display text-5xl italic uppercase">Connect to manage funds</h1>
          <button onClick={connect} className="px-8 py-4 bg-primary text-primary-foreground font-display text-lg uppercase tracking-widest clip-chrome-sm glow-cyan-sm hover:brightness-110">Connect Wallet</button>
        </div>
      </GameLayout>
    );
  }

  return (
    <GameLayout>
      <div className="relative max-w-5xl mx-auto px-6 md:px-8 py-12 space-y-8">
        <PageHeader
          eyebrow="// TREASURY"
          title="Manage"
          accent="Funds"
          blurb="Deposit and withdraw CTSI, buy arena points, execute withdrawal vouchers, and bridge characters to NFTs."
          right={
            <div className="flex gap-3">
              <div className="glass-panel clip-chrome-sm px-4 py-3"><div className="text-[9px] font-mono-display text-muted-foreground uppercase">Points</div><div className="font-display text-lg text-primary">{points.toLocaleString()}</div></div>
              <div className="glass-panel clip-chrome-sm px-4 py-3"><div className="text-[9px] font-mono-display text-muted-foreground uppercase">CTSI</div><div className="font-display text-lg text-storm">{ctsi.toLocaleString()}</div></div>
            </div>
          }
        />

        <div className="grid md:grid-cols-3 gap-4">
          {/* Deposit */}
          <Panel title="Deposit CTSI" hint="Move CTSI from your wallet into the game treasury.">
            <AmountRow value={depositAmt} onChange={setDepositAmt} />
            <Action label={depositing ? "Depositing…" : "Deposit"} onClick={doDeposit} disabled={depositing} />
          </Panel>

          {/* Withdraw */}
          <Panel title="Withdraw CTSI" hint="Queue a withdrawal voucher (execute it below once proven).">
            <AmountRow value={withdrawAmt} onChange={setWithdrawAmt} />
            <Action
              label="Withdraw"
              onClick={() => send("withdraw", { amount: withdrawAmt }, { pendingMsg: "Queuing withdrawal…", successMsg: "Withdrawal voucher created", invalidate: ["vouchers"] })}
              disabled={pending || withdrawAmt <= 0 || withdrawAmt > ctsi}
            />
          </Panel>

          {/* Buy points */}
          <Panel title="Buy Points" hint="Convert CTSI into arena points for recruiting & charms.">
            <AmountRow value={pointsAmt} onChange={setPointsAmt} />
            <Action
              label="Buy Points"
              onClick={() => send("purchase_points", { amount: pointsAmt }, { pendingMsg: "Buying points…", successMsg: "Points purchased" })}
              disabled={pending || pointsAmt <= 0}
            />
          </Panel>
        </div>

        <VouchersPanel />
        <NftBridge address={address} disabled={pending} onWithdraw={(id) => send("withdraw_character_as_nft", { character_id: id }, { pendingMsg: "Minting NFT…", successMsg: "Character bridged to NFT", invalidate: ["players_characters"] })} />
      </div>
    </GameLayout>
  );
}

function Panel({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <div className="glass-panel clip-chrome p-5 space-y-3">
      <h3 className="font-display text-lg uppercase tracking-tight text-primary">{title}</h3>
      <p className="text-[11px] text-muted-foreground">{hint}</p>
      {children}
    </div>
  );
}

function AmountRow({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <input
      type="number"
      min={0}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full bg-panel-2/60 px-4 py-3 font-display text-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary clip-chrome-sm"
    />
  );
}

function Action({ label, onClick, disabled }: { label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} className="w-full py-3 bg-primary text-primary-foreground font-display uppercase tracking-widest text-sm clip-chrome-sm hover:brightness-110 glow-cyan-sm disabled:opacity-40 disabled:pointer-events-none">
      {label}
    </button>
  );
}

function VouchersPanel() {
  const { data: vouchers, isLoading } = useVouchers();
  const { execute, pending } = useExecuteVoucher();
  const withdrawals = (vouchers ?? []).filter((v) => !v.executed);
  return (
    <div className="glass-panel clip-bevel p-6">
      <div className="font-mono-display text-[10px] tracking-[0.3em] text-primary uppercase mb-4">// PENDING VOUCHERS</div>
      {isLoading ? (
        <div className="grid place-items-center py-6"><span className="size-5 rounded-full border-2 border-primary/30 border-t-primary animate-spin" /></div>
      ) : withdrawals.length === 0 ? (
        <p className="font-mono-display text-xs uppercase tracking-widest text-muted-foreground">No pending vouchers. Withdrawals appear here once queued.</p>
      ) : (
        <div className="space-y-2">
          {withdrawals.map((v) => (
            <div key={v.index} className="grid grid-cols-[auto_1fr_auto] gap-4 items-center px-4 py-3 bg-panel-2/40 font-mono-display text-xs">
              <span className="text-muted-foreground">#{v.index}</span>
              <span className="truncate text-foreground">→ {v.destination.slice(0, 10)}…</span>
              <button
                onClick={() => execute(v)}
                disabled={pending || !v.proofReady}
                className="px-4 py-1.5 border border-primary/40 text-primary text-[10px] uppercase tracking-widest hover:bg-primary/10 clip-chrome-sm disabled:opacity-40"
                title={v.proofReady ? "Execute on L1" : "Waiting for epoch claim"}
              >
                {v.proofReady ? "Execute" : "Pending proof"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function NftBridge({ address, onWithdraw, disabled }: { address: string | null; onWithdraw: (id: number) => void; disabled: boolean }) {
  const { data: roster } = usePlayerCharacters(address);
  return (
    <div className="glass-panel clip-bevel p-6">
      <div className="font-mono-display text-[10px] tracking-[0.3em] text-primary uppercase mb-4">// NFT BRIDGE</div>
      <p className="text-[11px] text-muted-foreground mb-4">Withdraw a character as an on-chain ERC-721 NFT. Re-deposit it any time to play again.</p>
      {!roster?.length ? (
        <p className="font-mono-display text-xs uppercase tracking-widest text-muted-foreground">No characters to bridge.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {roster.map((c) => (
            <div key={c.id} className="glass-panel clip-chrome-sm p-1 text-center">
              <img src={c.img} alt={c.name} className="aspect-square w-full object-cover clip-chrome-sm" loading="lazy" />
              <div className="font-display text-[10px] uppercase truncate px-1 pt-1">{c.name}</div>
              <button onClick={() => onWithdraw(c.id)} disabled={disabled} className="w-full mt-1 py-1.5 border border-primary/40 text-primary text-[9px] uppercase tracking-widest hover:bg-primary/10 clip-chrome-sm disabled:opacity-40">
                → NFT
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
