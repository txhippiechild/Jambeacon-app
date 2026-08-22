"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useRef, useState } from "react";

type Screen = "builder" | "profile" | "beacons" | "jams" | "inbox" | "shop";
type AvatarBase = "Riff" | "Tempo";
type JamMessage = { id: number; mine: boolean; text: string };
type ShopItem = {
  id: string;
  name: string;
  kind: string;
  icon: string;
  points: number;
  cash: string;
  tone: "lime" | "orange" | "purple" | "cyan";
};

const people = [
  { id: 1, name: "Dre V.", role: "Drums", miles: "2.4 mi", tone: "cyan", avatar: "male" },
  { id: 2, name: "Maya R.", role: "Lead guitar", miles: "0.8 mi", tone: "purple", avatar: "female" },
  { id: 3, name: "Luis K.", role: "Bass", miles: "3.7 mi", tone: "orange", avatar: "male" },
  { id: 4, name: "Zoe M.", role: "Vocals", miles: "4.2 mi", tone: "lime", avatar: "female" },
  { id: 5, name: "Sam T.", role: "Keys", miles: "1.6 mi", tone: "cyan", avatar: "female" },
];

const shopItems: ShopItem[] = [
  { id: "comet", name: "Comet S", kind: "Generic guitar skin", icon: "🎸", points: 1000, cash: "$9.99", tone: "lime" },
  { id: "road", name: "Road Jacket", kind: "Avatar outfit", icon: "🧥", points: 300, cash: "$2.99", tone: "orange" },
  { id: "stage", name: "Midnight Stage", kind: "Profile backdrop", icon: "🌃", points: 700, cash: "$5.99", tone: "purple" },
  { id: "amp", name: "Voltage Stack", kind: "Generic amp prop", icon: "🔊", points: 450, cash: "$3.99", tone: "cyan" },
];

const loops = [
  { name: "Garage Rock", bpm: 110 },
  { name: "Punk Rush", bpm: 150 },
  { name: "Midnight Groove", bpm: 92 },
  { name: "Desert Drive", bpm: 118 },
  { name: "Slow Burn", bpm: 76 },
];

function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function AvatarImage({ avatar = "male", className = "", alt = "JamBeacon musician avatar" }: { avatar?: string; className?: string; alt?: string }) {
  const src = avatar === "female" ? "/avatar-female.png" : "/avatar-male.png";
  return <img className={cn("avatar-art", className)} src={src} alt={alt} />;
}

function Waveform({ active = false, seed = 0 }: { active?: boolean; seed?: number }) {
  const bars = useMemo(
    () => Array.from({ length: 52 }, (_, index) => Math.round(Math.abs(Math.sin((index + 1) * (seed + 1.7)) * 48) + 12)),
    [seed],
  );
  return (
    <div className={cn("waveform", active && "is-live")} aria-label={active ? "Live audio waveform" : "Audio waveform"}>
      {bars.map((height, index) => <i key={index} style={{ height: `${height}%`, animationDelay: `${index * -32}ms` }} />)}
    </div>
  );
}

function BottomNav({ screen, go }: { screen: Screen; go: (screen: Screen) => void }) {
  const items: Array<{ key: Screen; icon: string; label: string }> = [
    { key: "profile", icon: "♟", label: "Profile" },
    { key: "beacons", icon: "◎", label: "Beacons" },
    { key: "jams", icon: "♫", label: "Jams" },
    { key: "inbox", icon: "▢", label: "Inbox" },
    { key: "shop", icon: "•••", label: "More" },
  ];
  return (
    <nav className="bottom-nav" aria-label="JamBeacon navigation">
      {items.map((item) => (
        <button key={item.key} className={screen === item.key ? "active" : ""} onClick={() => go(item.key)}>
          <span>{item.icon}</span><small>{item.label}</small>
        </button>
      ))}
    </nav>
  );
}

function AppHeader({ points, onMenu }: { points: number; onMenu: () => void }) {
  return (
    <header className="app-header">
      <button className="icon-button" onClick={onMenu} aria-label="Open avatar builder">☰</button>
      <button className="wordmark" onClick={onMenu} aria-label="Customize avatar">JAM<span>BEACON</span></button>
      <div className="points-pill" title="Collaboration points">★ {points}</div>
    </header>
  );
}

function BuilderScreen({ base, setBase, hair, setHair, outfit, setOutfit, gear, setGear, save }: {
  base: AvatarBase;
  setBase: (base: AvatarBase) => void;
  hair: string;
  setHair: (value: string) => void;
  outfit: string;
  setOutfit: (value: string) => void;
  gear: string;
  setGear: (value: string) => void;
  save: () => void;
}) {
  const [tab, setTab] = useState<"Base" | "Hair" | "Outfit" | "Gear">("Base");
  const options = {
    Base: ["Riff", "Tempo"],
    Hair: ["Neon Spike", "Braided Beat", "Midnight Wave", "Buzz Cut"],
    Outfit: ["First Gig", "Road Jacket", "Neon Club", "Stage Black"],
    Gear: ["First Act", "Comet S", "Voltage Bass", "Drum Sticks"],
  } as const;
  const selected = tab === "Base" ? base : tab === "Hair" ? hair : tab === "Outfit" ? outfit : gear;
  const choose = (value: string) => {
    if (tab === "Base") setBase(value as AvatarBase);
    if (tab === "Hair") setHair(value);
    if (tab === "Outfit") setOutfit(value);
    if (tab === "Gear") setGear(value);
  };
  return (
    <section className="screen builder-screen">
      <div className="screen-kicker lime">BUILD YOUR ROCKSTAR</div>
      <div className="avatar-stage">
        <div className="stage-ring" />
        <AvatarImage avatar={base === "Tempo" ? "female" : "male"} />
        <div className="loadout-tag"><b>{gear}</b><span>{outfit}</span></div>
      </div>
      <div className="builder-tabs" role="tablist">
        {(["Base", "Hair", "Outfit", "Gear"] as const).map((name) => (
          <button role="tab" aria-selected={tab === name} className={tab === name ? "active" : ""} key={name} onClick={() => setTab(name)}>{name}</button>
        ))}
      </div>
      <div className="choice-grid">
        {options[tab].map((option, index) => (
          <button className={cn("choice-card", selected === option && "selected")} key={option} onClick={() => choose(option)}>
            {tab === "Base" ? <AvatarImage avatar={index === 1 ? "female" : "male"} /> : <span className={cn("choice-icon", `tone-${index}`)}>{tab === "Hair" ? "✦" : tab === "Outfit" ? "◆" : "⚡"}</span>}
            <small>{option}</small>
          </button>
        ))}
      </div>
      <button className="primary-button lime-button" onClick={save}>SAVE MY AVATAR</button>
      <p className="fine-print">Starter gear is included. New looks unlock through collaborations and care packages.</p>
    </section>
  );
}

function ProfileScreen({ base, gear, edit }: { base: AvatarBase; gear: string; edit: () => void }) {
  return (
    <section className="screen profile-screen">
      <div className="profile-hero">
        <div className="profile-neon">LIVE<br />LOCAL</div>
        <AvatarImage avatar={base === "Tempo" ? "female" : "male"} />
        <button className="settings-button" onClick={edit} aria-label="Edit avatar">⚙</button>
      </div>
      <div className="profile-card">
        <div className="profile-identity">
          <div className="mini-avatar"><AvatarImage avatar={base === "Tempo" ? "female" : "male"} /></div>
          <div><h1>Texas Hippie Child</h1><p><i /> JAM NOW</p><span>🎸 {gear === "Drum Sticks" ? "DRUMS" : "GUITAR"}</span></div>
        </div>
        <div className="track-card">
          <div><b>PROFILE TRACK</b><span>1:28</span></div>
          <button className="play-button" aria-label="Play profile track">▶</button><Waveform seed={3} />
        </div>
        <button className="primary-button lime-button">🔊 HEAR MY TRACK</button>
        <button className="primary-button orange-button">🤝 REQUEST A JAM</button>
        <div className="profile-stats"><span><b>4</b> collabs</span><span><b>860</b> points</span><span><b>3</b> care packs</span></div>
      </div>
    </section>
  );
}

function BeaconScreen({ selected, setSelected, live, toggleLive }: { selected: number; setSelected: (id: number) => void; live: boolean; toggleLive: () => void }) {
  const person = people.find((item) => item.id === selected) ?? people[0];
  return (
    <section className="screen beacon-screen">
      <div className="screen-kicker cyan">APPROXIMATE 5-MILE AREA</div>
      <div className="map-stage">
        <div className="map-grid" /><div className="you-marker">▲<small>YOU</small></div>
        {people.map((item, index) => (
          <button key={item.id} className={cn("map-avatar", `pos-${index + 1}`, `ring-${item.tone}`, selected === item.id && "selected")} onClick={() => setSelected(item.id)} aria-label={`View ${item.name}, ${item.role}`}>
            <AvatarImage avatar={item.avatar} />
          </button>
        ))}
      </div>
      <article className="nearby-card cyan-card">
        <div className="nearby-avatar"><AvatarImage avatar={person.avatar} /></div>
        <div><h2>{person.name}</h2><p>{person.role} • {person.miles}</p><Waveform active={live} seed={person.id} /></div>
        <button className="chat-round" aria-label={`Message ${person.name}`}>▰</button>
      </article>
      <button className={cn("primary-button", live ? "orange-button" : "cyan-button")} onClick={toggleLive}>{live ? "⚡ BEACON LIVE — TAP TO TURN OFF" : "◎ LIGHT MY BEACON"}</button>
      <p className="privacy-note">Your exact address is never shown. JamBeacon displays only an intentionally shifted point inside an approximate five-mile area.</p>
      <div className="membership-strip">$9.99 ONE-TIME ACCESS • BEACON INCLUDED</div>
    </section>
  );
}

function InboxScreen({ messages, sendMessage, openRoom }: { messages: JamMessage[]; sendMessage: (text: string) => void; openRoom: () => void }) {
  const [draft, setDraft] = useState("");
  const submit = () => {
    if (!draft.trim()) return;
    sendMessage(draft.trim());
    setDraft("");
  };
  return (
    <section className="screen inbox-screen">
      <div className="screen-kicker cyan">AVATAR JAM CHAT</div>
      <div className="chat-scene" role="img" aria-label="Two musician avatars planning a collaboration" />
      <div className="chat-thread">
        {messages.map((message) => (
          <div key={message.id} className={cn("message-row", message.mine && "mine")}>
            <div className="chat-avatar"><AvatarImage avatar={message.mine ? "female" : "male"} /></div><p>{message.text}</p>
          </div>
        ))}
      </div>
      <div className="chat-compose"><input value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => event.key === "Enter" && submit()} placeholder="Message your jam partner…" aria-label="Jam message" /><button onClick={submit} aria-label="Send message">➤</button></div>
      <button className="primary-button cyan-button" onClick={openRoom}>⚡ OPEN COLLAB ROOM</button>
    </section>
  );
}

function JamScreen({ points, addPoints }: { points: number; addPoints: (points: number) => void }) {
  const [loopIndex, setLoopIndex] = useState(0);
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [audioUrl, setAudioUrl] = useState("");
  const [status, setStatus] = useState("Choose a loop, then record your one-take part.");
  const [submitted, setSubmitted] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const loopTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopLoop = () => {
    if (loopTimerRef.current) clearInterval(loopTimerRef.current);
    loopTimerRef.current = null;
    audioContextRef.current?.close().catch(() => undefined);
    audioContextRef.current = null;
  };

  const drumHit = (context: AudioContext, beat: number) => {
    const now = context.currentTime;
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = beat % 4 === 0 ? "sine" : "square";
    osc.frequency.setValueAtTime(beat % 4 === 0 ? 95 : 185, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.09);
    gain.gain.setValueAtTime(beat % 2 === 0 ? 0.14 : 0.055, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc.connect(gain).connect(context.destination);
    osc.start(now); osc.stop(now + 0.11);
  };

  const startLoop = () => {
    stopLoop();
    const context = new AudioContext();
    audioContextRef.current = context;
    let beat = 0;
    drumHit(context, beat);
    const interval = Math.round(60000 / loops[loopIndex].bpm / 2);
    loopTimerRef.current = setInterval(() => { beat += 1; drumHit(context, beat); }, interval);
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setStatus("This browser does not provide microphone recording. Open JamBeacon in Chrome on your phone.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => event.data.size && chunksRef.current.push(event.data);
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        setStatus("Take saved on this device. Listen, retake, or submit it.");
      };
      recorder.start(); startLoop(); setElapsed(0); setRecording(true); setSubmitted(false);
      setStatus("Recording live — play your part.");
      timerRef.current = setInterval(() => setElapsed((value) => value + 1), 1000);
    } catch {
      setStatus("Microphone permission was not granted. Allow microphone access and try again.");
    }
  };

  const stopRecording = () => {
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null; stopLoop(); setRecording(false);
  };

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (loopTimerRef.current) clearInterval(loopTimerRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    audioContextRef.current?.close().catch(() => undefined);
  }, []);

  const submit = () => {
    if (!audioUrl) { setStatus("Record a take before submitting your track."); return; }
    if (!submitted) addPoints(300);
    setSubmitted(true); setStatus("Challenge submitted! Your care package is ready.");
  };
  const time = `${String(Math.floor(elapsed / 60)).padStart(2, "0")}:${String(elapsed % 60).padStart(2, "0")}`;
  return (
    <section className="screen jam-screen">
      <div className="screen-kicker orange">ROAD TO ROCKMANIA</div>
      <div className="challenge-head"><span>CHALLENGE 03 / 25</span><h1>FIRST SIGNAL</h1><p>{loops[loopIndex].name.toUpperCase()} • {loops[loopIndex].bpm} BPM</p></div>
      <div className="loop-picker">
        {loops.map((loop, index) => <button key={loop.name} className={loopIndex === index ? "active" : ""} onClick={() => setLoopIndex(index)} disabled={recording}><b>{index + 1}</b><span>{loop.name}<small>{loop.bpm} BPM</small></span></button>)}
      </div>
      <div className="record-panel">
        <Waveform active={recording} seed={loopIndex + elapsed} />
        <div className="record-controls"><button className={cn("record-button", recording && "recording")} onClick={recording ? stopRecording : startRecording} aria-label={recording ? "Stop recording" : "Start recording"}><i /></button><strong>{time}</strong></div>
        <p>{status}</p>
        {audioUrl && <audio className="take-player" src={audioUrl} controls />}
        <div className="record-actions"><button onClick={() => { setAudioUrl(""); setElapsed(0); setSubmitted(false); setStatus("Retake cleared. You are ready for another one-take part."); }}>RETAKE</button><button className="submit-track" onClick={submit}>SUBMIT TRACK</button></div>
      </div>
      <div className="vote-card"><span>SONG VOTE SHOWDOWN</span><div><div className="team-faces"><AvatarImage /><AvatarImage avatar="female" /></div><b>VS</b><div className="team-faces rival"><AvatarImage avatar="female" /><AvatarImage /></div></div></div>
      <div className={cn("care-package", submitted && "ready")}><span>▣</span><div><b>{submitted ? "CARE PACKAGE READY" : "CARE PACKAGE LOCKED"}</b><small>{submitted ? `+300 points • New gear inside • ${points} total` : "Submit the challenge to unlock it"}</small></div></div>
      <p className="fine-print">Recorder files stay on this device in this build. Use headphones so the selected drum loop does not bleed into your microphone.</p>
    </section>
  );
}

function ShopScreen({ points, spend }: { points: number; spend: (item: ShopItem) => void }) {
  return (
    <section className="screen shop-screen">
      <div className="shop-title"><span>🛍</span><h1>AVATAR SHOP</h1><b>{points.toLocaleString()} PTS ★</b></div>
      <p className="shop-intro">Use collaboration points or choose the cash option later. Real payments are not connected in this test build.</p>
      <div className="shop-list">
        {shopItems.map((item) => <article key={item.id} className={cn("shop-item", `${item.tone}-card`)}><div className="shop-art">{item.icon}</div><div><small>{item.kind}</small><h2>{item.name}</h2><p>{item.cash} • OR USE POINTS</p><button onClick={() => spend(item)} disabled={points < item.points}>{points < item.points ? `${item.points - points} MORE PTS` : `${item.points} PTS`}</button></div></article>)}
      </div>
      <div className="road-progress"><div><span>⚡ ROAD TO ROCKMANIA</span><b>CHALLENGE 03 / 25</b></div><div className="progress-dots"><i className="done">✓</i><i className="done">✓</i><i className="current">3</i><i>4</i><i>5</i></div></div>
    </section>
  );
}

export default function JamBeaconApp() {
  const [screen, setScreen] = useState<Screen>("builder");
  const [base, setBase] = useState<AvatarBase>("Riff");
  const [hair, setHair] = useState("Neon Spike");
  const [outfit, setOutfit] = useState("First Gig");
  const [gear, setGear] = useState("First Act");
  const [points, setPoints] = useState(1250);
  const [beaconLive, setBeaconLive] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(1);
  const [notice, setNotice] = useState("");
  const [messages, setMessages] = useState<JamMessage[]>([
    { id: 1, mine: false, text: "Want to build a track?" },
    { id: 2, mine: true, text: "Yeah—send the loop." },
    { id: 3, mine: false, text: "Jam accepted." },
  ]);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = localStorage.getItem("jambeacon-avatar");
        if (!saved) return;
        const value = JSON.parse(saved) as { base?: AvatarBase; hair?: string; outfit?: string; gear?: string; points?: number };
        if (value.base) setBase(value.base);
        if (value.hair) setHair(value.hair);
        if (value.outfit) setOutfit(value.outfit);
        if (value.gear) setGear(value.gear);
        if (typeof value.points === "number") setPoints(value.points);
        setScreen("profile");
      } catch { localStorage.removeItem("jambeacon-avatar"); }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const persist = (nextPoints = points) => localStorage.setItem("jambeacon-avatar", JSON.stringify({ base, hair, outfit, gear, points: nextPoints }));
  const toast = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(""), 2600); };
  const saveAvatar = () => { persist(); toast("Rockstar saved. Welcome to JamBeacon."); setScreen("profile"); };
  const spend = (item: ShopItem) => {
    if (points < item.points) return;
    const next = points - item.points;
    setPoints(next); persist(next); toast(`${item.name} added to your avatar closet.`);
  };
  const addPoints = (amount: number) => { const next = points + amount; setPoints(next); persist(next); };

  return (
    <main className="site-shell">
      <aside className="desktop-rail">
        <div className="rail-brand"><span>⚡</span><b>JAM<em>BEACON</em></b><small>FIND PEOPLE. MAKE SONGS.</small></div>
        <p>Build your musician, light your approximate Beacon, and turn a first hello into a real track.</p>
        <nav>
          <button onClick={() => setScreen("builder")} className={screen === "builder" ? "active" : ""}>✦ Build Rockstar</button>
          <button onClick={() => setScreen("profile")} className={screen === "profile" ? "active" : ""}>♟ Avatar Profile</button>
          <button onClick={() => setScreen("beacons")} className={screen === "beacons" ? "active" : ""}>◎ Beacon Map</button>
          <button onClick={() => setScreen("inbox")} className={screen === "inbox" ? "active" : ""}>▢ Jam Chat</button>
          <button onClick={() => setScreen("jams")} className={screen === "jams" ? "active" : ""}>♫ Collab Room</button>
          <button onClick={() => setScreen("shop")} className={screen === "shop" ? "active" : ""}>🛍 Avatar Shop</button>
        </nav>
        <div className="rail-rule"><b>PRIVACY FIRST</b><span>Exact locations never appear on the public map.</span></div>
      </aside>
      <div className="phone-app">
        <AppHeader points={points} onMenu={() => setScreen("builder")} />
        <div className="screen-scroll">
          {screen === "builder" && <BuilderScreen base={base} setBase={setBase} hair={hair} setHair={setHair} outfit={outfit} setOutfit={setOutfit} gear={gear} setGear={setGear} save={saveAvatar} />}
          {screen === "profile" && <ProfileScreen base={base} gear={gear} edit={() => setScreen("builder")} />}
          {screen === "beacons" && <BeaconScreen selected={selectedPerson} setSelected={setSelectedPerson} live={beaconLive} toggleLive={() => { setBeaconLive((value) => !value); toast(beaconLive ? "Beacon turned off." : "Beacon live in your approximate area."); }} />}
          {screen === "inbox" && <InboxScreen messages={messages} sendMessage={(text) => setMessages((items) => [...items, { id: Date.now(), mine: true, text }])} openRoom={() => setScreen("jams")} />}
          {screen === "jams" && <JamScreen points={points} addPoints={addPoints} />}
          {screen === "shop" && <ShopScreen points={points} spend={spend} />}
        </div>
        {screen !== "builder" && <BottomNav screen={screen} go={setScreen} />}
        {notice && <div className="toast" role="status">{notice}</div>}
      </div>
      <aside className="desktop-live-card">
        <span>LIVE NEARBY</span>
        <div className="live-faces">{people.slice(0, 4).map((person) => <button key={person.id} onClick={() => { setSelectedPerson(person.id); setScreen("beacons"); }}><AvatarImage avatar={person.avatar} /><i className={person.tone} /></button>)}</div>
        <h2>5 musicians inside your privacy area</h2>
        <button onClick={() => setScreen("beacons")}>OPEN BEACON MAP →</button>
        <div className="side-challenge"><small>NEXT CHALLENGE</small><b>FIRST SIGNAL</b><span>Garage Rock • 110 BPM</span><button onClick={() => setScreen("jams")}>ENTER COLLAB ROOM</button></div>
      </aside>
    </main>
  );
}
