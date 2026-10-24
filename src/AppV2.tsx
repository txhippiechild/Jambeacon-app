"use client";
/* eslint-disable @next/next/no-img-element */

import { type ChangeEvent, useEffect, useMemo, useRef, useState } from "react";

type Screen = "builder" | "profile" | "beacons" | "jams" | "inbox" | "shop";
type AvatarBase = "Ambilicous" | "C Note" | "Lee Fingerz" | "Beast" | "Dirt Bike Joey";
type AvatarKey = "ambilicous" | "c-note" | "lee-fingerz" | "beast" | "dirt-bike-joey" | "big-show" | "jrod" | "democrat-pat" | "hard-rock-harold" | "tx-hippie-child";
type Tone = "lime" | "orange" | "purple" | "cyan";
type JamMessage = { id: number; mine: boolean; text: string };
type AvatarLook = { id: string; avatar: AvatarBase; name: string; image: string; points: number; tone: Tone; description: string };
type ShopItem = AvatarLook;
type CrewMember = { name: string; role: string; avatar: AvatarKey; description: string };
type SavedAvatar = { base?: string; lookId?: string; ownedLookIds?: string[]; customAvatarData?: string; isCustomAvatar?: boolean; points?: number; campaignProgress?: number };

const TX_HOST = { name: "Tx Hippie Child", subName: "Guitar Gangsta", role: "Guitar player from Spring, Texas" };

const avatarCatalog: Record<AvatarBase, { key: AvatarKey; role: string; tagline: string; defaultLookId: string }> = {
  Ambilicous: { key: "ambilicous", role: "Keyboard", tagline: "Neon keys and fearless stage energy", defaultLookId: "ambilicous-original" },
  "C Note": { key: "c-note", role: "Bass", tagline: "A five-string groove with Texas shine", defaultLookId: "c-note-original" },
  "Lee Fingerz": { key: "lee-fingerz", role: "Guitar", tagline: "A road-tested lead player with arena fire", defaultLookId: "lee-fingerz-original" },
  Beast: { key: "beast", role: "Guitar", tagline: "JamBeacon's guitar hero from first gig to Rockmania", defaultLookId: "beast-original" },
  "Dirt Bike Joey": { key: "dirt-bike-joey", role: "Guitar", tagline: "From the trail to the Rockmania stage", defaultLookId: "joey-original" },
};

const avatarImages: Record<AvatarKey, string> = {
  "ambilicous": "/avatars/ambilicous/original.webp",
  "c-note": "/avatars/c-note/original.webp",
  "lee-fingerz": "/avatars/lee-fingerz/original.webp",
  beast: "/avatars/beast/original.webp",
  "dirt-bike-joey": "/avatars/dirt-bike-joey/original.webp",
  "big-show": "/avatars/crew/big-show.webp",
  jrod: "/avatars/crew/jrod.webp",
  "democrat-pat": "/avatars/crew/democrat-pat.webp",
  "hard-rock-harold": "/avatars/crew/hard-rock-harold-banjo-cutout.webp",
  "tx-hippie-child": "/tx-hippie-child.webp",
};

const people: Array<{ id: number; name: string; role: string; miles: string; tone: Tone; avatar: AvatarKey }> = [
  { id: 1, name: "Ambilicous", role: "Keyboard", miles: "2.4 mi", tone: "cyan", avatar: "ambilicous" },
  { id: 2, name: "Lee Fingerz", role: "Guitar", miles: "0.8 mi", tone: "purple", avatar: "lee-fingerz" },
  { id: 3, name: "C Note", role: "Bass", miles: "3.7 mi", tone: "orange", avatar: "c-note" },
  { id: 4, name: "Beast", role: "Guitar", miles: "4.2 mi", tone: "lime", avatar: "beast" },
  { id: 5, name: "Dirt Bike Joey", role: "Guitar", miles: "1.6 mi", tone: "cyan", avatar: "dirt-bike-joey" },
];

const lookCatalog: AvatarLook[] = [
  { id: "ambilicous-original", avatar: "Ambilicous", name: "Neon Keys Original", image: "/avatars/ambilicous/original.webp", points: 0, tone: "purple", description: "Her original neon keyboard look." },
  { id: "ambilicous-headliner", avatar: "Ambilicous", name: "Neon Headliner", image: "/avatars/ambilicous/neon-headliner.webp", points: 450, tone: "purple", description: "Braided magenta hair, stagewear, ear monitors, and her keyboard in one full-body look." },
  { id: "c-note-original", avatar: "C Note", name: "Neon Bass Original", image: "/avatars/c-note/original.webp", points: 0, tone: "lime", description: "His original five-string bass and green-hat look." },
  { id: "c-note-emerald-road", avatar: "C Note", name: "Emerald Road Case", image: "/avatars/c-note/emerald-road-case.webp", points: 450, tone: "lime", description: "An emerald tour jacket, embellished bass strap, and vivid five-string bass." },
  { id: "lee-fingerz-original", avatar: "Lee Fingerz", name: "Original Guitar Rig", image: "/avatars/lee-fingerz/original.webp", points: 0, tone: "orange", description: "His original leather jacket and amber electric guitar." },
  { id: "lee-fingerz-arena", avatar: "Lee Fingerz", name: "Arena Voltage", image: "/avatars/lee-fingerz/arena-voltage.webp", points: 450, tone: "cyan", description: "A tailored stage jacket, cyan strap, wrist cuff, and full-body guitar look." },
  { id: "beast-original", avatar: "Beast", name: "Beast Original Form", image: "/avatars/beast/original.webp", points: 0, tone: "orange", description: "Beast's original full-body guitar look." },
  { id: "beast-jambeacon-shirt", avatar: "Beast", name: "JamBeacon T-Shirt", image: "/avatars/beast/jambeacon-shirt.webp", points: 300, tone: "lime", description: "Beast's JamBeacon tee and complete guitar-player look." },
  { id: "beast-first-gig", avatar: "Beast", name: "First Gig Spotlight", image: "/avatars/beast/first-gig.webp", points: 400, tone: "orange", description: "Beast's first-show outfit in a full-body performance look." },
  { id: "beast-road-jacket", avatar: "Beast", name: "Road Jacket", image: "/avatars/beast/road-jacket.webp", points: 500, tone: "orange", description: "Beast's road jacket, guitar, and complete touring look." },
  { id: "beast-neon-stage", avatar: "Beast", name: "Neon Stage", image: "/avatars/beast/neon-stage.webp", points: 650, tone: "purple", description: "Beast's neon-lit stage outfit and full guitar rig." },
  { id: "beast-rockmania-suit", avatar: "Beast", name: "Rockmania Champion Suit", image: "/avatars/beast/rockmania-suit.webp", points: 900, tone: "cyan", description: "Beast's championship Rockmania outfit in a complete full-body look." },
  { id: "joey-original", avatar: "Dirt Bike Joey", name: "Joey Original Form", image: "/avatars/dirt-bike-joey/original.webp", points: 0, tone: "orange", description: "Dirt Bike Joey's original full-body look." },
  { id: "joey-trail-rider", avatar: "Dirt Bike Joey", name: "Trail Rider", image: "/avatars/dirt-bike-joey/trail-rider.webp", points: 300, tone: "orange", description: "Joey's trail-ready outfit as a complete full-body character look." },
  { id: "joey-night-rider", avatar: "Dirt Bike Joey", name: "Night Rider", image: "/avatars/dirt-bike-joey/night-rider.webp", points: 400, tone: "purple", description: "Joey's night-rider outfit, hair, and accessories in one full-body look." },
  { id: "joey-festival-roadie", avatar: "Dirt Bike Joey", name: "Festival Roadie", image: "/avatars/dirt-bike-joey/festival-roadie.webp", points: 500, tone: "cyan", description: "Joey's festival roadie outfit and complete stage look." },
  { id: "joey-pit-crew", avatar: "Dirt Bike Joey", name: "Pit Crew Mechanic", image: "/avatars/dirt-bike-joey/pit-crew-mechanic.webp", points: 650, tone: "lime", description: "Joey's mechanic gear with his full-body character art." },
  { id: "joey-ultimate-stage", avatar: "Dirt Bike Joey", name: "Ultimate Stage Rider", image: "/avatars/dirt-bike-joey/ultimate-stage-rider.webp", points: 900, tone: "orange", description: "Joey's final stage-rider outfit and complete instrument look." },
];

const shopItems = lookCatalog.filter((look) => look.points > 0);
const shopCategories = ["COMPLETE FULL-BODY LOOKS"];
const defaultOwnedLooks = lookCatalog.filter((look) => look.points === 0).map((look) => look.id);
const crewCatalog: CrewMember[] = [
  { name: "Big Show", role: "Manager", avatar: "big-show", description: "Tour manager for the JamBeacon crew." },
  { name: "Jrod", role: "Coach • no instrument", avatar: "jrod", description: "Music coach; not a playable musician." },
  { name: "Democrat Pat", role: "Hip-hop scene manager", avatar: "democrat-pat", description: "Manager and connector for the hip-hop scene." },
  { name: "Hard Rock Harold", role: "Banjo coach • NPC", avatar: "hard-rock-harold", description: "Banjo coach and story character; not a playable musician." },
];

const loops = [
  ["Texas Thunder", 120, 8, "4/4", "Big modern rock", "texas-thunder-120bpm.mp3"],
  ["Lone Star Shuffle", 105, 4, "4/4", "Texas shuffle", "lone-star-shuffle-105bpm.mp3"],
  ["Funk Highway", 102, 4, "4/4", "Tight funk pocket", "funk-highway-102bpm.mp3"],
  ["Garage Stomp", 128, 4, "4/4", "Raw garage rock", "garage-stomp-128bpm.mp3"],
  ["Midnight Pocket", 92, 4, "4/4", "Deep slow groove", "midnight-pocket-92bpm.mp3"],
  ["Arena Drive", 135, 4, "4/4", "Open arena beat", "arena-drive-135bpm.mp3"],
  ["Blues Six", 84, 4, "6/8", "Heavy blues sway", "blues-six-84bpm.mp3"],
  ["Southern Half-Time", 76, 4, "4/4", "Wide half-time", "southern-halftime-76bpm.mp3"],
  ["Neon Punk", 172, 4, "4/4", "Fast punk charge", "neon-punk-172bpm.mp3"],
  ["Heavy Crown", 145, 4, "4/4", "Heavy rock drive", "heavy-crown-145bpm.mp3"],
  ["Desert Reggae", 88, 4, "4/4", "Offbeat desert groove", "desert-reggae-88bpm.mp3"],
  ["Breakbeat Chase", 110, 4, "4/4", "Syncopated chase", "breakbeat-chase-110bpm.mp3"],
].map(([name, bpm, bars, meter, feel, file]) => ({ name: String(name), bpm: Number(bpm), bars: Number(bars), meter: String(meter), feel: String(feel), src: `/audio/loops-v2/${file}` }));

const campaignChapters = [
  { act: "ACT I", title: "Bedroom Lightning", location: "Spring, Texas • 11:47 PM", story: "You are rocking alone in your bedroom when a final power chord cracks the wall behind an old amp. Inside is a guitar case that was never there before. The guitar within it hums your name, and Tx Hippie Child speaks through the amp: ‘That axe does not find just anybody.’", host: "Wake the four runes in the order the guitar flashes. Do that, and the road to Rockmania opens.", reward: "The Beacon Axe + 250 points", expected: ["⚡", "🌙", "🔥", "⚡"], choices: ["⚡", "🌙", "🔥", "★"], puzzle: "Repeat the guitar’s rune sequence" },
  { act: "ACT II", title: "The Beatkeeper", location: "The Impossible Garage", story: "The magical guitar opens a door into a garage larger on the inside than the whole house. C Note is laying down a bass pulse for the crew. He will join the run if you can lock into the rhythm without rushing the magic.", host: "Listen with your hands. The pocket is not about playing more—it is about landing together.", reward: "C Note joins the band + 250 points", expected: ["KICK", "SNARE", "KICK", "KICK"], choices: ["KICK", "SNARE", "HAT", "TOM"], puzzle: "Build the four-hit rhythm" },
  { act: "ACT III", title: "Low-End Crossroads", location: "Highway 45 After Midnight", story: "The road splits beneath a dead neon sign. C Note holds the low end on one side; Lee Fingerz answers with a guitar bend from the other. The guitar will not choose a path until you build a band order where every player has room.", host: "A song needs a floor before it needs fireworks. Put the crew in the order that lets the groove grow.", reward: "C Note and Lee Fingerz + 250 points", expected: ["DRUMS", "BASS", "GUITAR", "VOCALS"], choices: ["DRUMS", "BASS", "GUITAR", "VOCALS"], puzzle: "Assemble the band from foundation to finish" },
  { act: "ACT IV", title: "Signal City", location: "Three Venues • One Night", story: "Democrat Pat knows every room in Signal City and has heard that Rockmania scouts are moving across town. To reach them, the band must play three connected rooms and leave a musical signal at each one for local players to follow.", host: "Start where songs are born, go where strangers hear them, then climb where the whole city can answer.", reward: "Democrat Pat opens the Rockmania pass", expected: ["GARAGE", "SUBWAY", "ROOFTOP"], choices: ["GARAGE", "SUBWAY", "ROOFTOP", "ARENA"], puzzle: "Choose the route that grows the signal" },
  { act: "ACT V", title: "The Rockmania Run", location: "Rockmania Main Stage", story: "The crowd is already roaring when the magical guitar begins to fade. It has enough power for one complete arrangement. Put the final set in order, then take the band into the studio and record the performance that decides the Crown of Rockness.", host: "Count together. State the riff. Risk the solo. Land the final chord. Then play it like the bedroom door is still closed.", reward: "Crown of Rockness + champion badge", expected: ["COUNT IN", "RIFF", "SOLO", "FINAL CHORD"], choices: ["COUNT IN", "RIFF", "SOLO", "FINAL CHORD"], puzzle: "Arrange the final Rockmania performance" },
];

function cn(...values: Array<string | false | null | undefined>) { return values.filter(Boolean).join(" "); }

function isAvatarBase(value: unknown): value is AvatarBase {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(avatarCatalog, value);
}

function getDefaultLook(base: AvatarBase) {
  return lookCatalog.find((look) => look.id === avatarCatalog[base].defaultLookId)!;
}

function getLook(base: AvatarBase, id: string) {
  return lookCatalog.find((look) => look.avatar === base && look.id === id) ?? getDefaultLook(base);
}

function AvatarImage({ avatar = "beast", className = "", alt = "JamBeacon musician avatar", src }: { avatar?: AvatarKey; className?: string; alt?: string; src?: string }) {
  return <img className={cn("avatar-art", avatar === "tx-hippie-child" && "host-avatar", className)} src={src ?? avatarImages[avatar]} alt={alt} />;
}

function HostWelcome({ compact = false }: { compact?: boolean }) {
  return <article className={cn("host-welcome", compact && "compact")}><div className="host-welcome-art"><AvatarImage avatar="tx-hippie-child" alt="Tx Hippie Child playing guitar" /></div><div className="host-welcome-copy"><span>{compact ? "YOUR CAMPAIGN GUIDE" : "YOUR JAMBEACON HOST"}</span><h2>{TX_HOST.name}</h2><strong>{TX_HOST.subName}</strong><p>{compact ? `${TX_HOST.role}. I’ll guide the magical-guitar run, the puzzles, and your trip to Rockmania.` : `Welcome to JamBeacon. I’m ${TX_HOST.name}, your host. I built this for musicians tired of playing alone. Find nearby players, make real sounds together, and learn my three-week Texas Hippie Child Guitar Theory course along the way.`}</p>{!compact && <div className="host-welcome-tags"><span>3-DAY FREE TRIAL</span><span>3-WEEK COURSE</span><span>SPRING, TEXAS</span></div>}</div></article>;
}

function Waveform({ active = false, seed = 0 }: { active?: boolean; seed?: number }) {
  const bars = useMemo(() => Array.from({ length: 52 }, (_, index) => Math.round(Math.abs(Math.sin((index + 1) * (seed + 1.7)) * 48) + 12)), [seed]);
  return <div className={cn("waveform", active && "is-live")} aria-label={active ? "Live audio waveform" : "Audio waveform"}>{bars.map((height, index) => <i key={index} style={{ height: `${height}%`, animationDelay: `${index * -32}ms` }} />)}</div>;
}

function AvatarStageArt({ base, look, customAvatarSrc, profile = false }: { base: AvatarBase; look: AvatarLook; customAvatarSrc?: string; profile?: boolean }) {
  const avatar = avatarCatalog[base];
  return <div className={cn("avatar-look", profile && "profile-look")}><AvatarImage avatar={avatar.key} src={customAvatarSrc ?? look.image} className="full-body-art" alt={customAvatarSrc ? "Custom full-body JamBeacon avatar" : `${base}, ${look.name}, full-body ${avatar.role} look`} /><div className="appearance-hud"><span>{customAvatarSrc ? "CUSTOM AVATAR" : look.name}</span><span>{avatar.role}</span></div></div>;
}

function UnlockCard({ onOpen, compact = false }: { onOpen: () => void; compact?: boolean }) {
  return <aside className={cn("unlock-card", compact && "compact")}><div><span>FULL JAMBEACON</span><h3>$9.99 ONCE. YOURS FOR GOOD.</h3><p>Unlock the Beacon, all five story chapters, unlimited loop recording, complete full-body character looks, and future app updates. No monthly subscription.</p></div><button onClick={onOpen}>UNLOCK FOR $9.99 →</button></aside>;
}

function UnlockModal({ open, close, checkout }: { open: boolean; close: () => void; checkout: () => void }) {
  if (!open) return null;
  return <div className="modal-backdrop" role="presentation" onMouseDown={close}><section className="unlock-modal" role="dialog" aria-modal="true" aria-labelledby="unlock-title" onMouseDown={(event) => event.stopPropagation()}><button className="modal-close" onClick={close} aria-label="Close unlock offer">×</button><span className="offer-kicker">ONE PAYMENT • PERMANENT ACCESS</span><h2 id="unlock-title">OWN THE WHOLE ROAD TO ROCKMANIA</h2><div className="offer-price"><b>$9.99</b><span>once<br />not monthly</span></div><ul><li>Light your privacy-safe local Beacon</li><li>Play the complete magical-guitar campaign</li><li>Record over all current and future loop packs</li><li>Use the full avatar builder and points shop</li></ul><button className="primary-button lime-button" onClick={checkout}>CONTINUE TO SECURE CHECKOUT</button><small>Three-day preview first. No recurring Beacon fee.</small></section></div>;
}

function BottomNav({ screen, go }: { screen: Screen; go: (screen: Screen) => void }) {
  const items: Array<{ key: Screen; icon: string; label: string }> = [{ key: "profile", icon: "♟", label: "Profile" }, { key: "beacons", icon: "◎", label: "Beacons" }, { key: "jams", icon: "♫", label: "Jams" }, { key: "inbox", icon: "▢", label: "Inbox" }, { key: "shop", icon: "•••", label: "More" }];
  return <nav className="bottom-nav" aria-label="JamBeacon navigation">{items.map((item) => <button key={item.key} className={screen === item.key ? "active" : ""} onClick={() => go(item.key)}><span>{item.icon}</span><small>{item.label}</small></button>)}</nav>;
}

function AppHeader({ points, onMenu, onHome }: { points: number; onMenu: () => void; onHome: () => void }) {
  return <header className="app-header"><button className="icon-button" onClick={onMenu} aria-label="Open JamBeacon menu">☰</button><button className="wordmark" onClick={onHome} aria-label="Open avatar builder">JAM<span>BEACON</span></button><div className="points-pill" title="Collaboration points">★ {points}</div></header>;
}

function MenuDrawer({ open, close, screen, go, onUnlock }: { open: boolean; close: () => void; screen: Screen; go: (screen: Screen) => void; onUnlock: () => void }) {
  if (!open) return null;
  const items: Array<{ key: Screen; icon: string; label: string; copy: string }> = [{ key: "builder", icon: "✦", label: "Build Rockstar", copy: "Playable musician and full-body looks" }, { key: "profile", icon: "♟", label: "My Profile", copy: "Your musician card and track" }, { key: "beacons", icon: "◎", label: "Beacon Map", copy: "Find nearby musical signals" }, { key: "jams", icon: "♫", label: "Campaign + Studio", copy: "Story, puzzles, loops, and recording" }, { key: "inbox", icon: "▢", label: "Jam Chat", copy: "Meet and message players" }, { key: "shop", icon: "⚡", label: "Avatar Shop", copy: "Full-body looks and character art" }];
  return <div className="drawer-backdrop" onMouseDown={close}><aside className="menu-drawer" aria-label="JamBeacon menu" onMouseDown={(event) => event.stopPropagation()}><div className="drawer-head"><div><span>JAMBEACON</span><b>MAIN MENU</b></div><button onClick={close} aria-label="Close menu">×</button></div><div className="drawer-host"><AvatarImage avatar="tx-hippie-child" alt="Tx Hippie Child" /><p><b>Tx Hippie Child</b><span>Guitar Gangsta • Your host</span></p></div><nav>{items.map((item) => <button key={item.key} className={screen === item.key ? "active" : ""} onClick={() => go(item.key)}><i>{item.icon}</i><span><b>{item.label}</b><small>{item.copy}</small></span><em>›</em></button>)}</nav><button className="drawer-unlock" onClick={onUnlock}><b>UNLOCK EVERYTHING</b><span>$9.99 once • never monthly</span></button></aside></div>;
}

function BuilderScreen({ base, lookId, selectBase, selectLook, ownedLookIds, customAvatarSrc, isCustomAvatar, onCustomAvatar, save, openShop, onUnlock }: {
  base: AvatarBase;
  lookId: string;
  selectBase: (base: AvatarBase) => void;
  selectLook: (look: AvatarLook) => void;
  ownedLookIds: string[];
  customAvatarSrc: string;
  isCustomAvatar: boolean;
  onCustomAvatar: (image: string) => void;
  save: () => void;
  openShop: () => void;
  onUnlock: () => void;
}) {
  const [tab, setTab] = useState<"Characters" | "Full Looks">("Characters");
  const [uploadError, setUploadError] = useState("");
  const activeLook = getLook(base, lookId);
  const ownedLooks = lookCatalog.filter((look) => look.avatar === base && ownedLookIds.includes(look.id));
  const uploadAvatar = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    setUploadError("");
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setUploadError("Choose a PNG, JPG, or WebP image.");
      return;
    }
    if (file.size > 1_500_000) {
      setUploadError("Choose an image under 1.5 MB so it can be saved on this device.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === "string" && onCustomAvatar(reader.result);
    reader.onerror = () => setUploadError("That image could not be opened. Try another file.");
    reader.readAsDataURL(file);
  };
  return <section className="screen builder-screen"><HostWelcome /><div className="screen-kicker lime">BUILD YOUR ROCKSTAR</div><div className="avatar-stage"><div className="stage-ring" /><AvatarStageArt base={base} look={activeLook} customAvatarSrc={isCustomAvatar ? customAvatarSrc : undefined} /></div><div className="builder-tabs" role="tablist">{(["Characters", "Full Looks"] as const).map((name) => <button role="tab" aria-selected={tab === name} className={tab === name ? "active" : ""} key={name} onClick={() => setTab(name)}>{name}</button>)}</div>{tab === "Characters" ? <div className="choice-grid base-grid">{(Object.keys(avatarCatalog) as AvatarBase[]).map((name) => <button className={cn("choice-card", !isCustomAvatar && base === name && "selected")} key={name} onClick={() => selectBase(name)}><AvatarImage avatar={avatarCatalog[name].key} alt={`${name}, ${avatarCatalog[name].role}`} /><small>{name}<span>{avatarCatalog[name].role}</span></small></button>)}</div> : <><p className="look-guidance">Each card is one complete full-body image. Hair, clothes, instrument, and accessories stay together as the selected preset.</p><div className="choice-grid look-grid">{isCustomAvatar && customAvatarSrc && <button className="choice-card selected" onClick={() => undefined}><AvatarImage avatar={avatarCatalog[base].key} src={customAvatarSrc} alt="Your custom full-body avatar" /><small>Custom Upload<span>Saved on this device</span></small></button>}{ownedLooks.map((look) => <button className={cn("choice-card", !isCustomAvatar && lookId === look.id && "selected")} key={look.id} onClick={() => selectLook(look)}><AvatarImage avatar={avatarCatalog[look.avatar].key} src={look.image} alt={`${look.avatar}, ${look.name}, full-body look`} /><small>{look.name}<span>{look.avatar}</span></small></button>)}</div><button className="secondary-button look-shop-link" onClick={openShop}>SHOP MORE FULL-BODY LOOKS</button></>}<div className="custom-avatar-panel"><div><b>USE YOUR OWN FULL-BODY ART</b><p>Upload a PNG, JPG, or WebP. The same image appears in the stage preview and your profile, and stays saved on this device.</p></div><label className="upload-avatar-button">CHOOSE IMAGE<input type="file" accept="image/png,image/jpeg,image/webp" onChange={uploadAvatar} /></label>{isCustomAvatar && <button className="text-button" onClick={() => selectBase(base)}>USE JAMBEACON CHARACTER</button>}{uploadError && <small role="alert">{uploadError}</small>}</div><button className="primary-button lime-button" onClick={save}>SAVE THIS ROCKSTAR</button><UnlockCard compact onOpen={onUnlock} /><p className="fine-print">The host stays Texas Hippie Child. The selectable musicians are Ambilicous, C Note, Lee Fingerz, Beast, and Dirt Bike Joey.</p></section>;
}

function ProfileScreen({ base, look, customAvatarSrc, edit, hearTrack, requestJam }: { base: AvatarBase; look: AvatarLook; customAvatarSrc?: string; edit: () => void; hearTrack: () => void; requestJam: () => void }) {
  const avatar = avatarCatalog[base];
  return <section className="screen profile-screen"><div className="profile-hero"><div className="profile-neon">LIVE<br />LOCAL</div><AvatarStageArt base={base} look={look} customAvatarSrc={customAvatarSrc} profile /><button className="settings-button" onClick={edit} aria-label="Edit avatar">⚙</button></div><div className="profile-card"><div className="profile-identity"><div className="mini-avatar"><AvatarImage avatar={avatar.key} src={customAvatarSrc ?? look.image} alt={customAvatarSrc ? "Custom avatar" : `${base}, ${look.name}`} /></div><div><h1>{customAvatarSrc ? "Custom Avatar" : base}</h1><p><i /> JAM NOW</p><span>♫ {avatar.role.toUpperCase()}</span><small className="profile-role">{customAvatarSrc ? "Your uploaded full-body character" : look.name} • {avatar.tagline}</small></div></div><div className="track-card"><div><b>PROFILE TRACK</b><span>ADD YOUR TAKE</span></div><button className="play-button" onClick={hearTrack} aria-label="Play profile track">▶</button><Waveform seed={3} /></div><button className="primary-button lime-button" onClick={hearTrack}>🔊 HEAR MY TRACK</button><button className="primary-button orange-button" onClick={requestJam}>🤝 REQUEST A JAM</button><div className="profile-stats"><span><b>4</b> collabs</span><span><b>860</b> points</span><span><b>3</b> care packs</span></div><HostWelcome compact /></div></section>;
}

function BeaconScreen({ selected, setSelected, live, toggleLive, openChat, onUnlock }: { selected: number; setSelected: (id: number) => void; live: boolean; toggleLive: () => void; openChat: () => void; onUnlock: () => void }) {
  const person = people.find((item) => item.id === selected) ?? people[0];
  return <section className="screen beacon-screen"><div className="screen-kicker cyan">APPROXIMATE 5-MILE AREA</div><div className="map-stage"><div className="map-grid" /><div className="you-marker">▲<small>YOU</small></div><div className="host-map-pin"><AvatarImage avatar="tx-hippie-child" alt="Tx Hippie Child" /><span><b>{TX_HOST.name}</b><small>{TX_HOST.subName} • HOST</small></span></div>{people.map((item, index) => <button key={item.id} className={cn("map-avatar", `pos-${index + 1}`, `ring-${item.tone}`, selected === item.id && "selected")} onClick={() => setSelected(item.id)} aria-label={`View ${item.name}, ${item.role}`}><AvatarImage avatar={item.avatar} /></button>)}</div><div className="map-reassurance"><AvatarImage avatar="tx-hippie-child" alt="Tx Hippie Child host" /><p><b>Musicians may be nearby.</b><span>Local signals appear as players light their Beacons. Tx Hippie Child stays on the map so nobody arrives to an empty room.</span></p></div><article className="nearby-card cyan-card"><div className="nearby-avatar"><AvatarImage avatar={person.avatar} /></div><div><h2>{person.name}</h2><p>{person.role} • {person.miles}</p><Waveform active={live} seed={person.id} /></div><button className="chat-round" onClick={openChat} aria-label={`Message ${person.name}`}>▰</button></article><button className={cn("primary-button", live ? "orange-button" : "cyan-button")} onClick={toggleLive}>{live ? "⚡ BEACON LIVE — TAP TO TURN OFF" : "◎ LIGHT MY BEACON"}</button><p className="privacy-note">Your exact address is never shown. JamBeacon displays only an intentionally shifted point inside an approximate five-mile area.</p><button className="membership-strip" onClick={onUnlock}>OWN JAMBEACON • $9.99 ONCE • UNLOCK THE BEACON</button><p className="membership-note">One payment. No per-use Beacon charge and no recurring Beacon fee.</p></section>;
}

function InboxScreen({ messages, sendMessage, openRoom, playerAvatar, playerAvatarSrc }: { messages: JamMessage[]; sendMessage: (text: string) => void; openRoom: () => void; playerAvatar: AvatarKey; playerAvatarSrc: string }) {
  const [draft, setDraft] = useState(""); const submit = () => { if (!draft.trim()) return; sendMessage(draft.trim()); setDraft(""); };
  return <section className="screen inbox-screen"><div className="screen-kicker cyan">AVATAR JAM CHAT</div><div className="chat-scene" role="img" aria-label="Musicians planning a collaboration" /><div className="chat-thread">{messages.map((message) => <div key={message.id} className={cn("message-row", message.mine && "mine")}><div className="chat-avatar"><AvatarImage avatar={message.mine ? playerAvatar : "tx-hippie-child"} src={message.mine ? playerAvatarSrc : undefined} alt={message.mine ? "Your JamBeacon musician" : "Tx Hippie Child"} /></div><p>{message.text}</p></div>)}</div><div className="chat-compose"><input value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => event.key === "Enter" && submit()} placeholder="Message your jam partner…" aria-label="Jam message" /><button onClick={submit} aria-label="Send message">➤</button></div><button className="primary-button cyan-button" onClick={openRoom}>⚡ OPEN CAMPAIGN + STUDIO</button></section>;
}

function PuzzlePanel({ chapter, progress, onSolved, onFinalReady }: { chapter: number; progress: number; onSolved: () => void; onFinalReady: () => void }) {
  const data = campaignChapters[chapter - 1]; const [input, setInput] = useState<string[]>([]); const [feedback, setFeedback] = useState(""); const complete = progress > chapter;
  useEffect(() => { setInput([]); setFeedback(""); }, [chapter]);
  const press = (value: string) => { if (complete) return; const index = input.length; if (value !== data.expected[index]) { setInput([]); setFeedback("The magic reset. Read Tx Hippie Child’s clue and try again."); return; } const next = [...input, value]; setInput(next); setFeedback("That note locked in."); if (next.length === data.expected.length) { setFeedback(chapter === 5 ? "Arrangement solved. The Rockmania studio is open." : "Puzzle cleared. The road just opened."); window.setTimeout(chapter === 5 ? onFinalReady : onSolved, 650); } };
  return <div className={cn("puzzle-panel", complete && "complete")}><div className="puzzle-title"><span>PUZZLE {chapter} / 5</span><h3>{data.puzzle}</h3></div><div className="puzzle-sequence">{data.expected.map((_, index) => <i key={index}>{input[index] ?? (complete ? "✓" : "?")}</i>)}</div><div className="puzzle-buttons">{data.choices.map((choice) => <button key={choice} onClick={() => press(choice)} disabled={complete}>{choice}</button>)}</div><p>{complete ? `CLEARED • ${data.reward}` : feedback || "Tap the choices in the correct order."}</p></div>;
}

function CampaignMode({ progress, setProgress, addPoints, openStudio, onUnlock }: { progress: number; setProgress: (value: number) => void; addPoints: (value: number) => void; openStudio: () => void; onUnlock: () => void }) {
  const [chapter, setChapter] = useState(Math.min(progress, 5)); const data = campaignChapters[chapter - 1]; useEffect(() => setChapter(Math.min(progress, 5)), [progress]);
  const solve = () => { if (progress !== chapter) return; addPoints(250); setProgress(Math.min(5, chapter + 1)); };
  return <div className="campaign-mode">{progress >= 6 && <div className="champion-banner"><span>♛</span><div><small>CAMPAIGN COMPLETE</small><h2>CROWN OF ROCKNESS</h2><p>You took the magical guitar from a Spring, Texas bedroom to the Rockmania stage.</p></div></div>}<div className="campaign-map">{campaignChapters.map((item, index) => { const number = index + 1; const locked = number > progress; const done = number < progress || progress >= 6; return <button key={item.title} className={cn(chapter === number && "active", done && "done", locked && "locked")} onClick={() => locked ? undefined : setChapter(number)} disabled={locked}><i>{done ? "✓" : number}</i><span>{item.act}<small>{item.title}</small></span></button>; })}</div><article className="story-card"><div className="story-location"><span>{data.act}</span><b>{data.location}</b></div><h1>{data.title}</h1><p>{data.story}</p><div className="host-dialogue"><AvatarImage avatar="tx-hippie-child" alt="Tx Hippie Child" /><blockquote><b>{TX_HOST.name}:</b> “{data.host}”</blockquote></div><div className="story-cast">{chapter >= 2 && <AvatarImage avatar="c-note" alt="C Note" />}{chapter >= 3 && <AvatarImage avatar="lee-fingerz" alt="Lee Fingerz" />}{chapter >= 4 && <AvatarImage avatar="ambilicous" alt="Ambilicous" />}{chapter >= 5 && <AvatarImage avatar="beast" alt="Beast" />}{chapter >= 5 && <AvatarImage avatar="dirt-bike-joey" alt="Dirt Bike Joey" />}</div></article><PuzzlePanel chapter={chapter} progress={progress} onSolved={solve} onFinalReady={openStudio} /><div className="chapter-reward"><span>CHAPTER REWARD</span><b>{data.reward}</b></div><UnlockCard compact onOpen={onUnlock} /></div>;
}

function JamScreen({ points, addPoints, campaignProgress, setCampaignProgress, onUnlock, playerAvatar, playerAvatarSrc }: { points: number; addPoints: (points: number) => void; campaignProgress: number; setCampaignProgress: (value: number) => void; onUnlock: () => void; playerAvatar: AvatarKey; playerAvatarSrc: string }) {
  const [mode, setMode] = useState<"story" | "studio">("story"); const [loopIndex, setLoopIndex] = useState(0); const [previewing, setPreviewing] = useState(false); const [recording, setRecording] = useState(false); const [elapsed, setElapsed] = useState(0); const [audioUrl, setAudioUrl] = useState(""); const [status, setStatus] = useState("Preview a groove, put on headphones, then record your part."); const [submitted, setSubmitted] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null); const streamRef = useRef<MediaStream | null>(null); const chunksRef = useRef<Blob[]>([]); const timerRef = useRef<ReturnType<typeof setInterval> | null>(null); const audioContextRef = useRef<AudioContext | null>(null); const loopAudioRef = useRef<HTMLAudioElement | null>(null); const loopSourceRef = useRef<MediaElementAudioSourceNode | null>(null); const mixDestinationRef = useRef<MediaStreamAudioDestinationNode | null>(null); const previewRef = useRef<HTMLAudioElement | null>(null);
  const stopPreview = () => { previewRef.current?.pause(); if (previewRef.current) previewRef.current.currentTime = 0; previewRef.current = null; setPreviewing(false); };
  const preview = () => { if (previewing) { stopPreview(); return; } stopPreview(); const audio = new Audio(loops[loopIndex].src); audio.loop = true; audio.volume = .9; previewRef.current = audio; audio.play().then(() => setPreviewing(true)).catch(() => setStatus("Tap again after allowing audio playback in your browser.")); };
  const stopLoop = () => { const audio = loopAudioRef.current; if (audio) { audio.pause(); audio.currentTime = 0; audio.removeAttribute("src"); audio.load(); } loopAudioRef.current = null; loopSourceRef.current?.disconnect(); loopSourceRef.current = null; };
  const closeAudio = () => { stopLoop(); mixDestinationRef.current = null; audioContextRef.current?.close().catch(() => undefined); audioContextRef.current = null; };
  const startLoop = async (context: AudioContext, destination: MediaStreamAudioDestinationNode) => { stopLoop(); const audio = new Audio(loops[loopIndex].src); audio.loop = true; audio.preload = "auto"; audio.volume = .86; const source = context.createMediaElementSource(audio); source.connect(context.destination); source.connect(destination); loopAudioRef.current = audio; loopSourceRef.current = source; await context.resume(); await audio.play(); };
  const startRecording = async () => { stopPreview(); if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") { setStatus("This browser does not provide microphone recording. Open JamBeacon in Chrome on your phone."); return; } try { const stream = await navigator.mediaDevices.getUserMedia({ audio: true }); streamRef.current = stream; chunksRef.current = []; const context = new AudioContext(); audioContextRef.current = context; const destination = context.createMediaStreamDestination(); mixDestinationRef.current = destination; context.createMediaStreamSource(stream).connect(destination); await startLoop(context, destination); const recorder = new MediaRecorder(destination.stream); recorderRef.current = recorder; recorder.ondataavailable = (event) => event.data.size && chunksRef.current.push(event.data); recorder.onstop = () => { const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" }); if (audioUrl) URL.revokeObjectURL(audioUrl); setAudioUrl(URL.createObjectURL(blob)); stream.getTracks().forEach((track) => track.stop()); streamRef.current = null; closeAudio(); setStatus("Take saved with the groove mixed in. Listen, retake, or submit it."); }; recorder.start(); setElapsed(0); setRecording(true); setSubmitted(false); setStatus(`Recording over ${loops[loopIndex].name} — play your part.`); timerRef.current = setInterval(() => setElapsed((value) => value + 1), 1000); } catch { streamRef.current?.getTracks().forEach((track) => track.stop()); streamRef.current = null; closeAudio(); setStatus("The loop could not start. Check microphone permission and try again."); } };
  const stopRecording = () => { if (recorderRef.current?.state === "recording") recorderRef.current.stop(); if (timerRef.current) clearInterval(timerRef.current); timerRef.current = null; stopLoop(); setRecording(false); };
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); streamRef.current?.getTracks().forEach((track) => track.stop()); stopPreview(); closeAudio(); }, []);
  const submit = () => { if (!audioUrl) { setStatus("Record a take before submitting your track."); return; } if (!submitted) addPoints(300); setSubmitted(true); if (campaignProgress === 5) setCampaignProgress(6); setStatus(campaignProgress === 5 ? "Final take submitted. You earned the Crown of Rockness!" : "Track submitted. Your care package is ready."); };
  const time = `${String(Math.floor(elapsed / 60)).padStart(2, "0")}:${String(elapsed % 60).padStart(2, "0")}`;
  return <section className="screen jam-screen"><div className="screen-kicker orange">ROAD TO ROCKMANIA</div><HostWelcome compact /><div className="jam-mode-tabs"><button className={mode === "story" ? "active" : ""} onClick={() => setMode("story")}>⚡ STORY CAMPAIGN</button><button className={mode === "studio" ? "active" : ""} onClick={() => setMode("studio")}>● LOOP STUDIO</button></div>{mode === "story" ? <CampaignMode progress={campaignProgress} setProgress={setCampaignProgress} addPoints={addPoints} openStudio={() => { setMode("studio"); setStatus("Final arrangement solved. Choose a groove and record the Rockmania take."); }} onUnlock={onUnlock} /> : <><div className="studio-head"><span>12 NEW JAMBEACON ARRANGEMENTS</span><h1>{loops[loopIndex].name}</h1><p>{loops[loopIndex].feel} • {loops[loopIndex].bars}-BAR {loops[loopIndex].meter} • {loops[loopIndex].bpm} BPM</p><button onClick={preview} disabled={recording}>{previewing ? "■ STOP LOOP" : "▶ PREVIEW LOOP"}</button></div><div className="loop-picker">{loops.map((loop, index) => <button key={loop.name} className={loopIndex === index ? "active" : ""} onClick={() => { stopPreview(); setLoopIndex(index); }} disabled={recording}><b>{index + 1}</b><span>{loop.name}<small>{loop.feel}<br />{loop.bars}-BAR {loop.meter} • {loop.bpm} BPM</small></span></button>)}</div><div className="record-panel"><Waveform active={recording || previewing} seed={loopIndex + elapsed} /><div className="record-controls"><button className={cn("record-button", recording && "recording")} onClick={recording ? stopRecording : startRecording} aria-label={recording ? "Stop recording" : "Start recording"}><i /></button><strong>{time}</strong></div><p>{status}</p>{audioUrl && <audio className="take-player" src={audioUrl} controls />}<div className="record-actions"><button onClick={() => { setAudioUrl(""); setElapsed(0); setSubmitted(false); setStatus("Retake cleared. You are ready for another pass."); }} disabled={!audioUrl}>RETAKE</button><button className="submit-track" onClick={submit} disabled={!audioUrl}>SUBMIT TRACK</button></div></div><div className="vote-card"><span>SONG VOTE SHOWDOWN</span><div><div className="team-faces"><AvatarImage avatar="tx-hippie-child" alt="Tx Hippie Child" /><AvatarImage avatar={playerAvatar} src={playerAvatarSrc} /></div><b>VS</b><div className="team-faces rival"><AvatarImage avatar="ambilicous" alt="Ambilicous" /><AvatarImage avatar="c-note" alt="C Note" /></div></div></div><div className={cn("care-package", submitted && "ready")}><span>▣</span><div><b>{submitted ? "CARE PACKAGE READY" : "CARE PACKAGE LOCKED"}</b><small>{submitted ? `+300 points • ${points} total` : "Submit a take to unlock it"}</small></div></div><UnlockCard compact onOpen={onUnlock} /><p className="fine-print">These JamBeacon arrangements use public-domain CC0 drum one-shots. Headphones help keep the backing groove clean in your microphone.</p></>}</section>;
}

function ShopScreen({ points, base, activeLook, customAvatarSrc, ownedLookIds, previewLookId, setPreviewLookId, spend, onUnlock, onEarnPoints, openBuilder }: {
  points: number;
  base: AvatarBase;
  activeLook: AvatarLook;
  customAvatarSrc?: string;
  ownedLookIds: string[];
  previewLookId: string;
  setPreviewLookId: (id: string) => void;
  spend: (item: ShopItem) => void;
  onUnlock: () => void;
  onEarnPoints: () => void;
  openBuilder: () => void;
}) {
  const previewLook = lookCatalog.find((look) => look.id === previewLookId) ?? activeLook;
  const previewCustom = !previewLookId ? customAvatarSrc : undefined;
  return <section className="screen shop-screen"><div className="shop-title"><span>🛍</span><h1>AVATAR SHOP</h1><b>{points.toLocaleString()} PTS ★</b></div><UnlockCard onOpen={onUnlock} /><div className="shop-preview-panel"><div><small>{previewLookId ? "COMPLETE LOOK PREVIEW" : "YOUR EQUIPPED CHARACTER"}</small><h2>{previewCustom ? "Custom Avatar" : previewLook.avatar}</h2><p>{previewCustom ? "Your uploaded full-body art" : previewLook.name}</p><button className="secondary-button" onClick={openBuilder}>OPEN CHARACTER BUILDER</button></div><div className="shop-preview-stage"><AvatarStageArt base={previewLook.avatar ?? base} look={previewLook} customAvatarSrc={previewCustom} /></div></div><p className="shop-intro">Preview each full-body preset, then buy and equip it. Purchases replace the same character image in your builder and profile; hair, clothes, instruments, and accessories are part of the selected artwork.</p><div className="shop-list">{shopCategories.map((category) => <div className="shop-category" key={category}><div className="shop-category-head"><b>{category}</b><span>{shopItems.length} LOOKS</span></div>{shopItems.map((item) => { const owned = ownedLookIds.includes(item.id); const equipped = !customAvatarSrc && base === item.avatar && activeLook.id === item.id; return <article key={item.id} className={cn("shop-item full-look-item", `${item.tone}-card`)}><button className="shop-art full-look-art" onClick={() => setPreviewLookId(item.id)} aria-label={`Preview ${item.name}`}><AvatarImage avatar={avatarCatalog[item.avatar].key} src={item.image} alt={`${item.avatar}, ${item.name}, full-body preview`} /></button><div><small>{item.avatar} • COMPLETE LOOK</small><h2>{item.name}</h2><p className="shop-description">{item.description}</p><div className="shop-meta"><strong>{owned ? "OWNED" : `${item.points} PTS`}</strong><span>{equipped ? "Equipped in builder + profile" : "Full-body art preview"}</span></div><div className="shop-actions"><button className="preview-look-button" onClick={() => setPreviewLookId(item.id)}>{previewLookId === item.id ? "PREVIEWING" : "PREVIEW"}</button><button className="buy-look-button" onClick={() => owned ? spend(item) : points >= item.points ? spend(item) : onEarnPoints()}>{equipped ? "EQUIPPED" : owned ? "EQUIP LOOK" : points < item.points ? "PLAY TO EARN POINTS" : `BUY & EQUIP • ${item.points} PTS`}</button></div></div></article>; })}</div>)}</div><section className="crew-roster"><div className="shop-category-head"><b>SUPPORTING CAST</b><span>STORY ROLES • NOT PLAYABLE</span></div><p>Managers and coaches stay in their JamBeacon roles; they are not offered as playable avatars.</p><div className="crew-grid">{crewCatalog.map((member) => <article className="crew-card" key={member.name}><div><AvatarImage avatar={member.avatar} alt={member.name} /></div><section><small>{member.role}</small><h3>{member.name}</h3><p>{member.description}</p></section></article>)}</div></section><div className="road-progress"><div><span>⚡ ROAD TO ROCKMANIA</span><b>5 STORY CHAPTERS</b></div><div className="progress-dots"><i className="done">1</i><i>2</i><i>3</i><i>4</i><i>5</i></div></div></section>;
}

export default function JamBeaconApp() {
  const [screen, setScreen] = useState<Screen>("builder");
  const [base, setBase] = useState<AvatarBase>("Beast");
  const [lookId, setLookId] = useState(avatarCatalog.Beast.defaultLookId);
  const [ownedLookIds, setOwnedLookIds] = useState<string[]>(defaultOwnedLooks);
  const [customAvatarData, setCustomAvatarData] = useState("");
  const [isCustomAvatar, setIsCustomAvatar] = useState(false);
  const [points, setPoints] = useState(1250);
  const [campaignProgress, setCampaignProgressState] = useState(1);
  const [beaconLive, setBeaconLive] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(1);
  const [notice, setNotice] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [unlockOpen, setUnlockOpen] = useState(false);
  const [shopPreviewLookId, setShopPreviewLookId] = useState("");
  const [messages, setMessages] = useState<JamMessage[]>([
    { id: 1, mine: false, text: "Tx Hippie Child here — welcome to JamBeacon. The magical guitar campaign is ready when you are." },
    { id: 2, mine: true, text: "Send the first loop." },
    { id: 3, mine: false, text: "Jam accepted. Meet me in Bedroom Lightning." },
  ]);
  const activeLook = getLook(base, lookId);
  const customAvatarSrc = isCustomAvatar ? customAvatarData : undefined;
  const playerAvatar = avatarCatalog[base].key;
  const playerAvatarSrc = customAvatarSrc ?? activeLook.image;

  const toast = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3000);
  };

  const persist = (next: Partial<{
    base: AvatarBase;
    lookId: string;
    ownedLookIds: string[];
    customAvatarData: string;
    isCustomAvatar: boolean;
    points: number;
    campaignProgress: number;
  }> = {}) => {
    try {
      localStorage.setItem("jambeacon-avatar", JSON.stringify({
        base: next.base ?? base,
        lookId: next.lookId ?? lookId,
        ownedLookIds: next.ownedLookIds ?? ownedLookIds,
        customAvatarData: next.customAvatarData ?? customAvatarData,
        isCustomAvatar: next.isCustomAvatar ?? isCustomAvatar,
        points: next.points ?? points,
        campaignProgress: next.campaignProgress ?? campaignProgress,
      }));
      return true;
    } catch {
      return false;
    }
  };

  const go = (next: Screen) => {
    setScreen(next);
    setMenuOpen(false);
  };

  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const savedJson = localStorage.getItem("jambeacon-avatar");
        if (!savedJson) return;
        const value = JSON.parse(savedJson) as SavedAvatar;
        const legacyBaseMap: Record<string, AvatarBase> = {
          Riff: "Beast",
          Tempo: "Ambilicous",
          "Road Dog": "C Note",
          "Blue King": "Lee Fingerz",
          "Neon Nova": "Lee Fingerz",
          Thunder: "Ambilicous",
        };
        const nextBase = isAvatarBase(value.base) ? value.base : legacyBaseMap[value.base ?? ""] ?? "Beast";
        const nextLook = getLook(nextBase, typeof value.lookId === "string" ? value.lookId : "").id;
        const validOwnedLooks = Array.isArray(value.ownedLookIds)
          ? value.ownedLookIds.filter((id) => lookCatalog.some((look) => look.id === id))
          : [];
        const nextOwnedLooks = [...new Set([...defaultOwnedLooks, ...validOwnedLooks])];
        setBase(nextBase);
        setLookId(nextLook);
        setOwnedLookIds(nextOwnedLooks);
        setCustomAvatarData(typeof value.customAvatarData === "string" ? value.customAvatarData : "");
        setIsCustomAvatar(Boolean(value.isCustomAvatar && value.customAvatarData));
        if (typeof value.points === "number") setPoints(value.points);
        if (typeof value.campaignProgress === "number") setCampaignProgressState(Math.min(6, Math.max(1, value.campaignProgress)));
        setScreen("profile");
      } catch {
        localStorage.removeItem("jambeacon-avatar");
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const selectBase = (nextBase: AvatarBase) => {
    const nextLook = getDefaultLook(nextBase);
    setBase(nextBase);
    setLookId(nextLook.id);
    setIsCustomAvatar(false);
    persist({ base: nextBase, lookId: nextLook.id, isCustomAvatar: false });
  };

  const selectLook = (look: AvatarLook) => {
    setBase(look.avatar);
    setLookId(look.id);
    setIsCustomAvatar(false);
    persist({ base: look.avatar, lookId: look.id, isCustomAvatar: false });
  };

  const applyCustomAvatar = (image: string) => {
    setCustomAvatarData(image);
    setIsCustomAvatar(true);
    const saved = persist({ customAvatarData: image, isCustomAvatar: true });
    toast(saved ? "Custom full-body avatar previewed and saved on this device." : "The custom preview is active, but this browser could not save it. Free some site storage and save again.");
  };

  const saveAvatar = () => {
    const saved = persist();
    toast(saved ? `${isCustomAvatar ? "Custom avatar" : activeLook.name} saved. Tx Hippie Child is ready to guide your run.` : "The avatar is previewed, but this browser could not save it.");
    setScreen("profile");
  };

  const spend = (item: ShopItem) => {
    const alreadyOwned = ownedLookIds.includes(item.id);
    if (!alreadyOwned && points < item.points) {
      setUnlockOpen(true);
      return;
    }
    const nextPoints = alreadyOwned ? points : points - item.points;
    const nextOwnedLooks = alreadyOwned ? ownedLookIds : [...ownedLookIds, item.id];
    setPoints(nextPoints);
    setOwnedLookIds(nextOwnedLooks);
    setBase(item.avatar);
    setLookId(item.id);
    setIsCustomAvatar(false);
    setShopPreviewLookId(item.id);
    persist({ base: item.avatar, lookId: item.id, ownedLookIds: nextOwnedLooks, isCustomAvatar: false, points: nextPoints });
    toast(alreadyOwned ? `${item.name} equipped. It is now live in your profile preview.` : `${item.name} bought and equipped. It is now live in your builder and profile.`);
  };

  const addPoints = (amount: number) => {
    const next = points + amount;
    setPoints(next);
    persist({ points: next });
  };

  const setCampaignProgress = (value: number) => {
    const next = Math.min(6, Math.max(1, value));
    setCampaignProgressState(next);
    persist({ campaignProgress: next });
  };

  const checkout = () => {
    toast("Secure checkout is not configured yet. No payment was taken.");
    setUnlockOpen(false);
  };

  return <main className="site-shell">
    <aside className="desktop-rail">
      <div className="rail-brand"><span>⚡</span><b>JAM<em>BEACON</em></b><small>FIND PEOPLE. MAKE SONGS.</small></div>
      <p>Choose a JamBeacon musician, preview a complete full-body look, and take the magical guitar from the bedroom to Rockmania.</p>
      <nav>
        <button onClick={() => go("builder")} className={screen === "builder" ? "active" : ""}>✦ Build Rockstar</button>
        <button onClick={() => go("profile")} className={screen === "profile" ? "active" : ""}>♟ Avatar Profile</button>
        <button onClick={() => go("beacons")} className={screen === "beacons" ? "active" : ""}>◎ Beacon Map</button>
        <button onClick={() => go("inbox")} className={screen === "inbox" ? "active" : ""}>▢ Jam Chat</button>
        <button onClick={() => go("jams")} className={screen === "jams" ? "active" : ""}>♫ Campaign + Studio</button>
        <button onClick={() => go("shop")} className={screen === "shop" ? "active" : ""}>🛍 Avatar Shop</button>
      </nav>
      <div className="rail-rule"><b>$9.99 ONCE</b><span>Permanent app access. No recurring Beacon fee.</span></div>
    </aside>
    <div className="phone-app">
      <AppHeader points={points} onMenu={() => setMenuOpen(true)} onHome={() => go("builder")} />
      <div className={cn("screen-scroll", screen !== "builder" && "with-bottom-nav")}>
        {screen === "builder" && <BuilderScreen base={base} lookId={lookId} selectBase={selectBase} selectLook={selectLook} ownedLookIds={ownedLookIds} customAvatarSrc={customAvatarData} isCustomAvatar={isCustomAvatar} onCustomAvatar={applyCustomAvatar} save={saveAvatar} openShop={() => go("shop")} onUnlock={() => setUnlockOpen(true)} />}
        {screen === "profile" && <ProfileScreen base={base} look={activeLook} customAvatarSrc={customAvatarSrc} edit={() => go("builder")} hearTrack={() => { toast("Record a profile take in the Loop Studio first."); go("jams"); }} requestJam={() => go("inbox")} />}
        {screen === "beacons" && <BeaconScreen selected={selectedPerson} setSelected={setSelectedPerson} live={beaconLive} toggleLive={() => { setBeaconLive((value) => !value); toast(beaconLive ? "Beacon turned off." : "Beacon live in your approximate area."); }} openChat={() => go("inbox")} onUnlock={() => setUnlockOpen(true)} />}
        {screen === "inbox" && <InboxScreen messages={messages} sendMessage={(text) => setMessages((items) => [...items, { id: Date.now(), mine: true, text }])} openRoom={() => go("jams")} playerAvatar={playerAvatar} playerAvatarSrc={playerAvatarSrc} />}
        {screen === "jams" && <JamScreen points={points} addPoints={addPoints} campaignProgress={campaignProgress} setCampaignProgress={setCampaignProgress} onUnlock={() => setUnlockOpen(true)} playerAvatar={playerAvatar} playerAvatarSrc={playerAvatarSrc} />}
        {screen === "shop" && <ShopScreen points={points} base={base} activeLook={activeLook} customAvatarSrc={customAvatarSrc} ownedLookIds={ownedLookIds} previewLookId={shopPreviewLookId} setPreviewLookId={setShopPreviewLookId} spend={spend} onUnlock={() => setUnlockOpen(true)} onEarnPoints={() => go("jams")} openBuilder={() => go("builder")} />}
      </div>
      {screen !== "builder" && <BottomNav screen={screen} go={go} />}
      <MenuDrawer open={menuOpen} close={() => setMenuOpen(false)} screen={screen} go={go} onUnlock={() => { setMenuOpen(false); setUnlockOpen(true); }} />
      <UnlockModal open={unlockOpen} close={() => setUnlockOpen(false)} checkout={checkout} />
      {notice && <div className="toast" role="status">{notice}</div>}
    </div>
    <aside className="desktop-live-card">
      <span>LIVE NEARBY</span>
      <div className="live-faces">{people.slice(0, 4).map((person) => <button key={person.id} onClick={() => { setSelectedPerson(person.id); go("beacons"); }}><AvatarImage avatar={person.avatar} /><i className={person.tone} /></button>)}</div>
      <h2>Musicians may be inside your privacy area</h2>
      <button onClick={() => go("beacons")}>OPEN BEACON MAP →</button>
      <div className="side-challenge"><small>NEXT STORY CHAPTER</small><b>{campaignChapters[Math.min(campaignProgress, 5) - 1].title}</b><span>Magic guitar • puzzles • full-band finale</span><button onClick={() => go("jams")}>ENTER THE CAMPAIGN</button></div>
    </aside>
  </main>;
}
