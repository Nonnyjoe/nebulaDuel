import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { GameLayout } from "@/components/game/GameLayout";
import { PageHeader } from "@/components/game/PageHeader";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { readGameState } from "@/lib/cartesi/inspect";
import { useWallet } from "@/hooks/useWallet";
import { useSendInput } from "@/hooks/useSendInput";

function useAdminAddress() {
  return useQuery({
    queryKey: ["admin"],
    queryFn: async () => {
      const res = await readGameState("admin");
      return res.Status ? String(res.request_payload).toLowerCase() : null;
    },
    staleTime: 60_000,
  });
}

export default function Admin() {
  useDocumentTitle("Admin — Nebula Duel");
  const { address, isConnected, connect } = useWallet();
  const { data: admin, isLoading } = useAdminAddress();
  const { send, pending } = useSendInput();
  const isAdmin = !!address && address === admin;

  const [pointsRate, setPointsRate] = useState(100);
  const [feeBps, setFeeBps] = useState(300);
  const [newAdmin, setNewAdmin] = useState("");
  const [ctsiToken, setCtsiToken] = useState("");
  const [nebulaToken, setNebulaToken] = useState("");
  const [withdrawStake, setWithdrawStake] = useState(0);
  const [withdrawP2p, setWithdrawP2p] = useState(0);
  const [withdrawPts, setWithdrawPts] = useState(0);

  if (!isConnected) {
    return (
      <GameLayout>
        <div className="max-w-2xl mx-auto px-6 py-28 text-center space-y-5">
          <h1 className="font-display text-4xl italic uppercase">Connect to access admin</h1>
          <button onClick={connect} className="px-8 py-4 bg-primary text-primary-foreground font-display text-lg uppercase tracking-widest clip-chrome-sm glow-cyan-sm">Connect Wallet</button>
        </div>
      </GameLayout>
    );
  }

  if (isLoading) {
    return (
      <GameLayout>
        <div className="grid place-items-center py-32"><span className="size-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" /></div>
      </GameLayout>
    );
  }

  if (!isAdmin) {
    return (
      <GameLayout>
        <div className="max-w-2xl mx-auto px-6 py-28 text-center space-y-3">
          <div className="font-mono-display text-[10px] tracking-[0.3em] text-destructive uppercase">// ACCESS DENIED</div>
          <h1 className="font-display text-4xl italic uppercase">Admins only</h1>
          <p className="text-sm text-muted-foreground">This wallet is not the registered admin.</p>
        </div>
      </GameLayout>
    );
  }

  return (
    <GameLayout>
      <div className="relative max-w-5xl mx-auto px-6 md:px-8 py-12 space-y-6">
        <PageHeader eyebrow="// CONTROL ROOM" title="Admin" accent="Console" blurb="Tune the economy, rotate addresses, and withdraw protocol profit." />

        <div className="grid md:grid-cols-2 gap-4">
          <Card title="Points Rate">
            <Num value={pointsRate} onChange={setPointsRate} />
            <Go disabled={pending} onClick={() => send("change_points_rate", { new_point_rate: pointsRate }, { successMsg: "Points rate updated" })} />
          </Card>
          <Card title="Marketplace Fee (bps, max 2000)">
            <Num value={feeBps} onChange={setFeeBps} />
            <Go disabled={pending} onClick={() => send("set_marketplace_fee", { fee_bps: feeBps }, { successMsg: "Fee updated" })} />
          </Card>
          <Card title="Set CTSI Token Address">
            <Txt value={ctsiToken} onChange={setCtsiToken} placeholder="0x…" />
            <Go disabled={pending || !ctsiToken} onClick={() => send("set_cartesi_token_address", { ctsi_token: ctsiToken }, { successMsg: "CTSI token set" })} />
          </Card>
          <Card title="Set Nebula NFT Address">
            <Txt value={nebulaToken} onChange={setNebulaToken} placeholder="0x…" />
            <Go disabled={pending || !nebulaToken} onClick={() => send("set_nebula_token_address", { nebula_token: nebulaToken }, { successMsg: "Nebula token set" })} />
          </Card>
          <Card title="Transfer Admin">
            <Txt value={newAdmin} onChange={setNewAdmin} placeholder="0x…" />
            <Go disabled={pending || !newAdmin} onClick={() => send("change_admin_address", { new_admin_address: newAdmin }, { successMsg: "Admin transferred" })} />
          </Card>
        </div>

        <div className="glass-panel clip-bevel p-6">
          <div className="font-mono-display text-[10px] tracking-[0.3em] text-primary uppercase mb-4">// WITHDRAW PROTOCOL PROFIT</div>
          <div className="grid md:grid-cols-3 gap-4">
            <Card title="From Stake">
              <Num value={withdrawStake} onChange={setWithdrawStake} />
              <Go disabled={pending} onClick={() => send("withdraw_profit_from_stake", { amount: withdrawStake }, { successMsg: "Withdrawn" })} />
            </Card>
            <Card title="From P2P Sales">
              <Num value={withdrawP2p} onChange={setWithdrawP2p} />
              <Go disabled={pending} onClick={() => send("withdraw_profit_from_p2p_sales", { amount: withdrawP2p }, { successMsg: "Withdrawn" })} />
            </Card>
            <Card title="From Points Purchase">
              <Num value={withdrawPts} onChange={setWithdrawPts} />
              <Go disabled={pending} onClick={() => send("withdraw_profit_from_points_purchase", { amount: withdrawPts }, { successMsg: "Withdrawn" })} />
            </Card>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass-panel clip-chrome p-5 space-y-3">
      <h3 className="font-display text-sm uppercase tracking-tight text-primary">{title}</h3>
      {children}
    </div>
  );
}
function Num({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full bg-panel-2/60 px-4 py-2.5 font-display text-foreground focus:outline-none focus:ring-1 focus:ring-primary clip-chrome-sm" />;
}
function Txt({ value, onChange, placeholder }: { value: string; onChange: (s: string) => void; placeholder?: string }) {
  return <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-panel-2/60 px-4 py-2.5 font-mono-display text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary clip-chrome-sm" />;
}
function Go({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return <button onClick={onClick} disabled={disabled} className="w-full py-2.5 bg-primary text-primary-foreground font-display uppercase tracking-widest text-xs clip-chrome-sm hover:brightness-110 disabled:opacity-40 disabled:pointer-events-none">Apply</button>;
}
