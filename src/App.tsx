import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Float, Environment, Sparkles, Text } from "@react-three/drei";
import { Zap, Gift, Users, Trophy, Wallet, CheckSquare, Home, Menu, Plus } from "lucide-react";

declare global {
  interface Window { Telegram?: { WebApp?: { ready: () => void; expand: () => void; initData: string; colorScheme?: string } } }
}
type Player = { points: number | string; xp: number | string; taps: number | string; energy: number | string };
const demoPlayer: Player = { points: 0, xp: 0, taps: 0, energy: 1000 };

function Coin3D() {
  return <Canvas camera={{ position: [0, 0, 5], fov: 38 }} dpr={[1, 1.6]}>
    <ambientLight intensity={1.5} />
    <pointLight position={[4, 3, 5]} intensity={100} color="#42d9ff" />
    <pointLight position={[-3, -2, 3]} intensity={70} color="#ffb72b" />
    <Float speed={2.2} rotationIntensity={0.25} floatIntensity={0.35}>
      <mesh rotation={[0.15, 0.2, 0]}>
        <cylinderGeometry args={[1.35, 1.35, 0.22, 96]} />
        <meshStandardMaterial color="#e9a91b" metalness={0.9} roughness={0.22} />
      </mesh>
      <mesh position={[0, 0, 0.13]} rotation={[0, 0, 0]}>
        <circleGeometry args={[1.2, 96]} />
        <meshStandardMaterial color="#ffca42" metalness={0.72} roughness={0.24} emissive="#6a3300" emissiveIntensity={0.35} />
      </mesh>
      <mesh position={[0, 0, 0.16]}>
        <torusGeometry args={[1.08, 0.035, 12, 96]} />
        <meshStandardMaterial color="#fff0a2" metalness={0.8} roughness={0.18} />
      </mesh>
      <Text position={[0, -0.12, 0.205]} fontSize={1.05} anchorX="center" anchorY="middle" color="#fff1a4" outlineWidth={0.018} outlineColor="#8a4d08">
        A
      </Text>
    </Float>
    <Sparkles count={48} scale={4.2} size={3} speed={0.45} color="#5ddcff" />
    <Environment preset="city" />
  </Canvas>;
}

export default function App() {
  const [player, setPlayer] = useState<Player>(demoPlayer);
  const [name, setName] = useState("ARM Player");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("Tap the coin to collect game points");
  const [tab, setTab] = useState("Home");
  const tg = window.Telegram?.WebApp;
  const authHeaders = (): HeadersInit => tg?.initData ? { Authorization: `tma ${tg.initData}` } : {};

  useEffect(() => {
    tg?.ready(); tg?.expand();
    fetch("/api/state", { headers: authHeaders() })
      .then(async r => { const data = await r.json(); if (!r.ok) throw new Error(data.error); setPlayer(data.player); setName(data.user?.name ?? "ARM Player"); })
      .catch(() => setNotice("Preview mode: connect Telegram + database to save progress."))
      .finally(() => setLoading(false));
  }, []);

  async function tap() {
    if (busy) return;
    setBusy(true);
    try {
      const r = await fetch("/api/tap", { method: "POST", headers: { "Content-Type": "application/json", ...authHeaders() }, body: JSON.stringify({ taps: 1 }) });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      setPlayer(data.player); setNotice(`+${data.player.added} game point${data.player.added === 1 ? "" : "s"}!`);
    } catch {
      // Local visual preview only; never claim points are saved when the API is unavailable.
      if (!tg?.initData) {
        setPlayer(p => ({ ...p, points: Number(p.points) + 1, xp: Number(p.xp) + 1, taps: Number(p.taps) + 1, energy: Math.max(0, Number(p.energy) - 1) }));
        setNotice("+1 preview point — not saved to the server");
      } else setNotice("Could not save tap. Check server and database settings.");
    } finally { setBusy(false); }
  }

  const points = Number(player.points).toLocaleString();
  const xp = Number(player.xp);
  const energy = Number(player.energy);
  const nav = [
    { name: "Home", icon: Home }, { name: "Tasks", icon: CheckSquare },
    { name: "Friends", icon: Users }, { name: "Wallet", icon: Wallet }, { name: "More", icon: Menu }
  ];
  return <main className="app-shell">
    <header className="topbar">
      <div className="brand"><div className="brand-mark">A</div><div><strong>ARM <span>TAP</span></strong><small>MADE IN ARMENIA</small></div></div>
      <div className="level-pill"><Trophy size={14}/> LEVEL {Math.floor(xp / 500) + 1}</div>
    </header>
    <section className="welcome">
      <div><p className="eyebrow">WELCOME BACK</p><h1>Hey, {name} <span>✦</span></h1><p className="sub">Your next level is one tap away.</p></div>
      <div className="balance"><small>YOUR ARM POINTS</small><strong>{points}</strong><span><Zap size={13} fill="currentColor"/> +{xp} XP earned</span></div>
    </section>
    <section className="coin-card">
      <div className="orbit orbit-one"></div><div className="orbit orbit-two"></div>
      <div className="coin-caption"><span className="live-dot"></span> TAP TO EARN <span className="coin-caption-line"></span></div>
      <button className="coin-button" onClick={tap} disabled={busy || loading || energy <= 0} aria-label="Tap ARM coin"><Coin3D /></button>
      <div className="tap-hint">{busy ? "COLLECTING..." : "TAP THE COIN"}</div>
      <div className="energy-row"><span><Zap size={15} fill="currentColor"/> ENERGY</span><strong>{energy.toLocaleString()} / 1,000</strong></div>
      <div className="energy-track"><div style={{ width: `${Math.max(0, Math.min(100, energy / 10))}%` }} /></div>
      <p className="notice">{notice}</p>
    </section>
    <section className="quick-stats">
      <div className="stat"><span className="stat-icon gold"><Zap size={17}/></span><small>TOTAL TAPS</small><strong>{Number(player.taps).toLocaleString()}</strong></div>
      <div className="stat"><span className="stat-icon blue"><Trophy size={17}/></span><small>YOUR LEVEL</small><strong>{Math.floor(xp / 500) + 1}</strong></div>
      <div className="stat"><span className="stat-icon purple"><Gift size={17}/></span><small>DAILY BONUS</small><strong>Coming soon</strong></div>
    </section>
    <section className="section-head"><div><p className="eyebrow">KEEP THE MOMENTUM</p><h2>Daily missions</h2></div><button className="text-button" onClick={() => {setTab("Tasks"); setNotice("Daily missions will be enabled in the next backend phase.");}}>View all <span>↗</span></button></section>
    <section className="mission-list">
      <div className="mission"><div className="mission-icon"><Gift size={20}/></div><div className="mission-copy"><strong>Daily check-in</strong><small>Open ARM Tap every day</small></div><span className="reward">+100 XP</span><button className="mission-action" onClick={() => setNotice("Daily check-in is not enabled yet.")}><Plus size={16}/></button></div>
      <div className="mission"><div className="mission-icon cyan"><Users size={20}/></div><div className="mission-copy"><strong>Invite a friend</strong><small>Grow the ARM community</small></div><span className="reward">+250 XP</span><button className="mission-action" onClick={() => setNotice("Referral rewards will be added after the core game is deployed.")}><Plus size={16}/></button></div>
    </section>
    <nav className="bottom-nav">{nav.map(item => { const Icon = item.icon; return <button key={item.name} className={tab === item.name ? "nav-item active" : "nav-item"} onClick={() => {setTab(item.name); if(item.name !== "Home") setNotice(`${item.name} section is planned for the next development step.`);}}><Icon size={19}/><span>{item.name}</span></button>; })}</nav>
    <footer>ARM TAP <span>•</span> GAME POINTS ONLY <span>•</span> TON INTEGRATION LATER</footer>
  </main>;
}