"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { listTakes, saveTake, deleteTake } from "./trackVault";

type Screen = "builder" | "profile" | "beacons" | "jams" | "loops" | "inbox" | "shop";
type Look = { hair: string; outfit: string; gear: string; accessories: Record<string,string>; backdrop: string; fullBodyId?:string; customAvatarSrc?:string };
const starterLook: Look = {hair:"Neon Spike",outfit:"First Gig",gear:"First Act",accessories:{},backdrop:""};
type AvatarBase = "Riff" | "Tempo" | "Road Dog" | "Blue King" | "Neon Nova" | "Thunder" | "Ambilicous" | "C Note" | "Lee Fingerz" | "Beast" | "Dirt Bike Joey";
type AvatarKey = "male" | "female" | "road-dog" | "blue-king" | "neon-nova" | "thunder" | "tx-hippie-child" | "ambilicous" | "c-note" | "lee-fingerz" | "beast" | "dirt-bike-joey";
type Tone = "lime" | "orange" | "purple" | "cyan";
type JamMessage = { id: number; mine: boolean; text: string };
type ShopItem = { id: string; name: string; kind: string; icon: string; points: number; tone: Tone; category: string; description: string; unlock: string; avatar?: AvatarBase; fullBody?: AvatarBase; image?: string };

const TX_HOST = { name: "Tx Hippie Child", subName: "Guitar Gangsta", role: "Guitar player from Spring, Texas" };

const avatarCatalog: Record<AvatarBase, { key: AvatarKey; role: string; tagline: string }> = {
  Ambilicous: {key:"ambilicous",role:"Keyboard",tagline:"Neon keys"},
  "C Note": {key:"c-note",role:"Bass",tagline:"Texas groove"},
  "Lee Fingerz": {key:"lee-fingerz",role:"Guitar",tagline:"Lead guitar"},
  Beast: {key:"beast",role:"Guitar",tagline:"Rockmania guitar hero"},
  "Dirt Bike Joey": {key:"dirt-bike-joey",role:"Drums",tagline:"Stage rider"},
  Riff: { key: "male", role: "Lead guitar", tagline: "Fast hooks and neon attitude" },
  Tempo: { key: "female", role: "Rhythm guitar", tagline: "Pocket-first rhythm player" },
  "Road Dog": { key: "road-dog", role: "Bass", tagline: "Road-tested low-end gravity" },
  "Blue King": { key: "blue-king", role: "Blues guitar", tagline: "Soul, space, and a dangerous bend" },
  "Neon Nova": { key: "neon-nova", role: "Lead guitar", tagline: "Future-rock voltage" },
  Thunder: { key: "thunder", role: "Drums", tagline: "The count-in that shakes the room" },
};

const avatarImages: Record<AvatarKey, string> = {
  ambilicous:"/avatars/ambilicous/original.webp", "c-note":"/avatars/c-note/original.webp", "lee-fingerz":"/avatars/lee-fingerz/original.webp",beast:"/avatars/beast/original.webp","dirt-bike-joey":"/avatars/dirt-bike-joey/original.webp",
  male: "/avatar-male.webp", female: "/avatar-female.webp", "road-dog": "/avatar-road-dog.webp",
  "blue-king": "/avatar-blue-king.webp", "neon-nova": "/avatar-neon-nova.webp", thunder: "/avatar-thunder.webp",
  "tx-hippie-child": "/tx-hippie-child.webp",
};

const people: Array<{ id: number; name: string; role: string; miles: string; tone: Tone; avatar: AvatarKey }> = [
  { id: 1, name: "Dre V.", role: "Drums", miles: "2.4 mi", tone: "cyan", avatar: "thunder" },
  { id: 2, name: "Maya R.", role: "Lead guitar", miles: "0.8 mi", tone: "purple", avatar: "neon-nova" },
  { id: 3, name: "Luis K.", role: "Bass", miles: "3.7 mi", tone: "orange", avatar: "road-dog" },
  { id: 4, name: "Zoe M.", role: "Vocals", miles: "4.2 mi", tone: "lime", avatar: "female" },
  { id: 5, name: "Sam T.", role: "Blues guitar", miles: "1.6 mi", tone: "cyan", avatar: "blue-king" },
];

const characterItems: ShopItem[] = [
  ["avatar-road-dog", "Road Dog", "RD", "orange", "Veteran bassist with a road-worn rig and an unshakable pocket.", "Road Dog"],
  ["avatar-blue-king", "Blue King", "BK", "cyan", "Soulful blues player built for bends, space, and late-night stages.", "Blue King"],
  ["avatar-neon-nova", "Neon Nova", "NN", "purple", "Future-rock lead player with electric color and fearless stage energy.", "Neon Nova"],
  ["avatar-thunder", "Thunder", "TH", "orange", "A powerhouse drummer who makes every band sound larger.", "Thunder"],
].map(([id, name, icon, tone, description, avatar]) => ({ id, name, icon, tone: tone as Tone, description, avatar: avatar as AvatarBase, kind: "Playable avatar", points: 700, category: "PLAYABLE AVATARS", unlock: "Equip in the builder" }));

const guitarSpecs: Array<[string, string, string, number, Tone, string]> = [
  ["texas-comet", "Texas Comet", "☄", 700, "lime", "Lime-edged stage guitar built for the opening flash."],
  ["ember-vibe", "Ember Vibe", "🔥", 800, "orange", "Fire-red finish for riffs that need heat before volume."],
  ["moonwave", "Moonwave Hollow", "☾", 850, "purple", "Midnight hollow-body look for clean chords and smoky rooms."],
  ["solar-burst", "Solar Burst", "☀", 900, "orange", "Gold-to-orange finish for the first outdoor stage."],
  ["glitch-runner", "Glitch Runner", "⚡", 950, "cyan", "Digital cyan streaks for the experimental route."],
  ["chrome-riot", "Chrome Riot", "✦", 1100, "cyan", "Mirror-metal attitude without a brand badge in sight."],
  ["canyon-howl", "Canyon Howl", "⛰", 750, "orange", "Desert-red grain and a wide-open-road personality."],
  ["midnight-nomad", "Midnight Nomad", "◆", 1000, "purple", "Deep black and violet for the last song before sunrise."],
  ["aurora-fang", "Aurora Fang", "✧", 1050, "cyan", "Sharp cyan-and-violet finish with arena energy."],
  ["dust-devil", "Dust Devil", "≋", 650, "orange", "Worn copper finish that looks better after every mile."],
  ["cosmic-outlaw", "Cosmic Outlaw", "★", 1150, "purple", "Star-field finish for the player taking the strange route."],
  ["swamp-circuit", "Swamp Circuit", "⌁", 825, "lime", "Moss green, black hardware, and dirty-groove energy."],
  ["lone-star-gold", "Lone Star Gold", "☆", 1200, "lime", "A gold Texas-stage finish reserved for confident finales."],
  ["violet-static", "Violet Static", "ϟ", 975, "purple", "Purple interference lines that move under stage light."],
];

const fullBodyLooks: {id:string;avatar:AvatarBase;name:string;image:string;points:number;tone:Tone;description:string}[] = [
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


// Artwork pieces cut from the approved Beast outfit images, with source masks
// and destination transforms in the original 768 × 1152 character coordinates.
type FittedPart = { base?:AvatarBase; source:string; slot:string; name:string; masks:{path:string;transform?:string}[]; viewBox:string };
const fittedParts:Record<string,FittedPart> = {
 "lee-cyan-strap": {base:"Lee Fingerz",source:"/avatars/lee-fingerz/arena-voltage.webp",slot:"strap",name:"Arena Cyan Guitar Strap",viewBox:"400 190 55 255",masks:[{path:"M420 201 L435 198 L448 202 L446 256 L439 314 L431 373 L433 396 L431 422 L419 436 L407 429 L405 413 L405 385 L412 332 Z",transform:"translate(0 20)"}]},
 "lee-stage-cuff": {base:"Lee Fingerz",source:"/avatars/lee-fingerz/arena-voltage.webp",slot:"wristband",name:"Arena Leather Wrist Cuff",viewBox:"215 465 48 55",masks:[{path:"M219 477 L232 470 L246 473 L260 487 L250 508 L239 515 L229 510 L221 500 Z",transform:"translate(0 24)"}]},
 "cnote-emerald-jacket": {base:"C Note",source:"/avatars/c-note/emerald-road-case.webp",slot:"jacket",name:"Emerald Embroidered Jacket",viewBox:"85 210 435 280",masks:[{path:"M183 245 L238 228 L268 212 L280 236 L302 276 L318 318 L322 359 L327 383 L309 415 L288 444 L249 468 L217 477 L213 466 L194 455 L178 457 L164 476 L147 484 L118 466 L101 439 L94 414 L111 375 L137 326 Z"},{path:"M442 242 L470 249 L482 269 L489 306 L510 349 L492 367 L462 382 L438 388 L436 341 Z"},{path:"M483 423 L510 439 L547 448 L565 438 L568 421 L581 430 L601 440 L600 460 L577 470 L545 476 L515 475 L487 465 L466 453 Z"}]},
 "ambi-stage-chain": {base:"Ambilicous",source:"/avatars/ambilicous/neon-headliner.webp",slot:"beltChain",name:"Headliner Waist Chain",viewBox:"275 420 60 60",masks:[{path:"M303 438 L317 429 L324 437 L313 450 L300 463 L287 474 L279 472 L282 461 Z",transform:"translate(4 25)"}]},
 "ambi-stage-ring": {base:"Ambilicous",source:"/avatars/ambilicous/neon-headliner.webp",slot:"beltCharm",name:"Headliner Ring Charm",viewBox:"415 435 42 60",masks:[{path:"M420 440 L432 439 L445 449 L452 460 L452 478 L440 491 L425 491 L422 480 L433 471 L432 458 L420 452 Z",transform:"translate(0 24)"}]},
 "joey-aviators": {base:"Dirt Bike Joey",source:"/avatars/dirt-bike-joey/night-rider.webp",slot:"glasses",name:"Night Rider Aviators",viewBox:"302 36 92 54",masks:[{path:"M305 65 L317 56 L333 54 L346 52 L357 43 L371 40 L382 44 L389 54 L392 65 L386 74 L371 80 L358 79 L349 70 L343 71 L341 79 L329 86 L316 86 L307 80 Z",transform:"translate(18 10)"}]},
 "joey-bandana": {base:"Dirt Bike Joey",source:"/avatars/dirt-bike-joey/trail-rider.webp",slot:"neckwear",name:"Trail Rider Red Bandana",viewBox:"315 162 114 66",masks:[{path:"M319 167 L332 165 L352 175 L377 181 L403 173 L416 167 L425 183 L425 203 L419 224 L407 221 L384 212 L365 204 L346 196 L329 188 Z",transform:"translate(3 16)"}]},
 "stage-glasses": {source:"/avatars/beast/jambeacon-shirt.webp",slot:"glasses",name:"Stage Glasses",viewBox:"242 55 118 58",masks:[{path:"M247 83 L257 78 L273 76 L280 70 L304 59 L321 57 L328 63 L351 63 L354 69 L328 74 L323 87 L313 92 L293 93 L285 84 L279 87 L273 101 L259 109 L252 103 Z",transform:"translate(5 -12)"}]},
 "beast-neon-visor": {source:"/avatars/beast/neon-stage.webp",slot:"glasses",name:"Neon Stage Visor",viewBox:"250 55 110 65",masks:[{path:"M256 86 L269 77 L310 63 L335 58 L344 63 L358 80 L346 85 L315 88 L285 103 L271 115 L261 108 Z",transform:"translate(-3 -12)"}]},
 "beast-jb-wristband": {source:"/avatars/beast/jambeacon-shirt.webp",slot:"wristband",name:"JamBeacon Wristband",viewBox:"218 435 86 90",masks:[{path:"M222 467 Q225 451 245 440 L260 444 L283 459 L298 473 L281 477 L269 488 L260 505 L263 515 L247 511 L232 493 Z",transform:"translate(3 5)"}]},
 "beast-red-finish": {source:"/avatars/beast/jambeacon-shirt.webp",slot:"guitarFinish",name:"Red Crackle Guitar Finish",viewBox:"110 506 411 255",masks:[{path:"M118 565 L237 515 L252 532 L265 551 L246 582 L237 598 Z"},{path:"M243 609 L273 621 L278 646 L301 676 L323 641 L335 626 L351 629 L362 613 L383 597 L392 599 L282 748 Z",transform:"translate(0 -8)"},{path:"M431 519 L509 527 L468 549 L405 584 L393 577 L422 550 Z",transform:"translate(0 8)"}]},
 "beast-neon-finish": {source:"/avatars/beast/neon-stage.webp",slot:"guitarFinish",name:"Neon Lightning Guitar Finish",viewBox:"76 505 445 270",masks:[{path:"M91 562 L234 518 L249 535 L264 553 L248 575 L239 599 Z",transform:"matrix(.84 0 0 1 42 0)"},{path:"M246 617 L265 627 L267 652 L288 679 L311 646 L321 623 L337 628 L357 611 L375 591 L386 598 L264 753 Z",transform:"matrix(.9 0 0 .94 45 31)"},{path:"M430 522 L509 523 L469 548 L405 579 L393 572 L421 549 Z",transform:"translate(0 12)"}]}
};
const fittedShopItems:ShopItem[]=Object.entries(fittedParts).filter(([id])=>id!=="stage-glasses").map(([id,part])=>({id,name:part.name,kind:part.slot==="guitarFinish"?"Fitted guitar finish":part.slot==="jacket"?"Fitted jacket":"Fitted accessory",icon:"✦",points:part.slot==="guitarFinish"||part.slot==="jacket"?250:100,tone:"cyan",category:"FITTED CHARACTER PARTS",description:"Extracted from "+(part.base||"Beast")+"’s existing costume artwork.",unlock:"Equip on the original look"}));
const shopItems: ShopItem[] = [
 ...fittedShopItems,
 ...fullBodyLooks.map(item=>({...item,avatar:undefined,fullBody:item.avatar,kind:"Full-body look",icon:"✦",category:"CHARACTER OUTFITS",unlock:"Equip outfit"})),
  {id:"stage-glasses",name:"Stage Glasses",kind:"Avatar accessory",icon:"🕶",points:100,tone:"cyan",category:"STYLE & GEAR",description:"Stage shades.",unlock:"Test points item"},
  ...characterItems,
  ...guitarSpecs.map(([id, name, icon, points, tone, description]) => ({ id, name, icon, points, tone, description, kind: "Generic guitar skin", category: "GUITAR VAULT", unlock: "Points store" })),
  { id: "road-jacket", name: "Road Jacket", kind: "Avatar outfit", icon: "🧥", points: 300, tone: "orange", category: "STYLE & GEAR", description: "A worn-in road look for the next mile marker.", unlock: "Builder outfit" },
  { id: "glow-strap", name: "Glow Strap", kind: "Guitar accessory", icon: "〰", points: 220, tone: "lime", category: "STYLE & GEAR", description: "Add motion to every riff and profile pose.", unlock: "Builder gear" },
  { id: "midnight-pedal", name: "Midnight Pedal", kind: "Guitar accessory", icon: "▣", points: 500, tone: "purple", category: "STYLE & GEAR", description: "A dark shimmer effect for the riff that changes the room.", unlock: "Builder gear" },
  { id: "pulse-mic", name: "Pulse Mic", kind: "Vocal accessory", icon: "🎙", points: 450, tone: "cyan", category: "STYLE & GEAR", description: "A stage-ready mic for the line everyone remembers.", unlock: "Builder gear" },
  { id: "garage-walls", name: "Garage Walls", kind: "Profile backdrop", icon: "▤", points: 500, tone: "lime", category: "STAGES", description: "The room where the first real song starts taking shape.", unlock: "Profile backdrop" },
  { id: "rooftop-neon", name: "Rooftop Neon", kind: "Profile backdrop", icon: "▥", points: 850, tone: "cyan", category: "STAGES", description: "City lights, open air, and a chorus with somewhere to go.", unlock: "Profile backdrop" },
  { id: "rockmania-stage", name: "Rockmania Fire", kind: "Final stage", icon: "🚀", points: 1800, tone: "orange", category: "STAGES", description: "Pyro, crowd lights, and the final Rockmania backdrop.", unlock: "Campaign finale" },
];
const shopCategories = Array.from(new Set(shopItems.map((item) => item.category)));

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
  { act: "ACT II", title: "The Beatkeeper", location: "The Impossible Garage", story: "The magical guitar opens a door into a garage larger on the inside than the whole house. Thunder is waiting behind a kit. He will join the run, but only if you can lock into his count without rushing the magic.", host: "Listen with your hands. The pocket is not about playing more—it is about landing together.", reward: "Thunder joins the band + 250 points", expected: ["KICK", "SNARE", "KICK", "KICK"], choices: ["KICK", "SNARE", "HAT", "TOM"], puzzle: "Build Thunder’s four-hit rhythm" },
  { act: "ACT III", title: "Low-End Crossroads", location: "Highway 45 After Midnight", story: "The road splits beneath a dead neon sign. Road Dog holds the low end on one side; Blue King answers with a bend from the other. The guitar will not choose a path until you build a band order where every player has room.", host: "A song needs a floor before it needs fireworks. Put the crew in the order that lets the groove grow.", reward: "Road Dog and Blue King + 250 points", expected: ["DRUMS", "BASS", "GUITAR", "VOCALS"], choices: ["DRUMS", "BASS", "GUITAR", "VOCALS"], puzzle: "Assemble the band from foundation to finish" },
  { act: "ACT IV", title: "Signal City", location: "Three Venues • One Night", story: "Neon Nova intercepts your Beacon and joins the crew, but Rockmania scouts are moving across town. To reach them, the band must play three connected rooms and leave a musical signal at each one for local players to follow.", host: "Start where songs are born, go where strangers hear them, then climb where the whole city can answer.", reward: "Neon Nova + the Rockmania pass", expected: ["GARAGE", "SUBWAY", "ROOFTOP"], choices: ["GARAGE", "SUBWAY", "ROOFTOP", "ARENA"], puzzle: "Choose the route that grows the signal" },
  { act: "ACT V", title: "The Rockmania Run", location: "Rockmania Main Stage", story: "The crowd is already roaring when the magical guitar begins to fade. It has enough power for one complete arrangement. Put the final set in order, then take the band into the studio and record the performance that decides the Crown of Rockness.", host: "Count together. State the riff. Risk the solo. Land the final chord. Then play it like the bedroom door is still closed.", reward: "Crown of Rockness + champion badge", expected: ["COUNT IN", "RIFF", "SOLO", "FINAL CHORD"], choices: ["COUNT IN", "RIFF", "SOLO", "FINAL CHORD"], puzzle: "Arrange the final Rockmania performance" },
];

function cn(...values: Array<string | false | null | undefined>) { return values.filter(Boolean).join(" "); }
function slug(value: string) { return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }
function gearIcon(gear: string) { if (gear.includes("Drum")) return "🥁"; if (gear.includes("Bass")) return "𝄢"; if (gear.includes("Mic")) return "🎙"; if (gear.includes("Pedal")) return "▣"; return "🎸"; }

function AvatarImage({ avatar = "male", className = "", alt = "JamBeacon musician avatar" }: { avatar?: AvatarKey; className?: string; alt?: string }) {
  return <img className={cn("avatar-art", avatar === "tx-hippie-child" && "host-avatar", className)} src={avatarImages[avatar]} alt={alt} />;
}

function HostWelcome({ compact = false }: { compact?: boolean }) {
  return <article className={cn("host-welcome", compact && "compact")}><div className="host-welcome-art"><AvatarImage avatar="tx-hippie-child" alt="Tx Hippie Child playing guitar" /></div><div className="host-welcome-copy"><span>{compact ? "YOUR CAMPAIGN GUIDE" : "YOUR JAMBEACON HOST"}</span><h2>{TX_HOST.name}</h2><strong>{TX_HOST.subName}</strong><p>{compact ? `${TX_HOST.role}. I’ll guide the magical-guitar run, the puzzles, and your trip to Rockmania.` : `Welcome to JamBeacon. I’m ${TX_HOST.name}, your host. I built this for musicians tired of playing alone. Find nearby players, make real sounds together, and learn my three-week Texas Hippie Child Guitar Theory course along the way.`}</p>{!compact && <div className="host-welcome-tags"><span>3-DAY FREE TRIAL</span><span>3-WEEK COURSE</span><span>SPRING, TEXAS</span></div>}</div></article>;
}

function Waveform({ active = false, seed = 0 }: { active?: boolean; seed?: number }) {
  const bars = useMemo(() => Array.from({ length: 52 }, (_, index) => Math.round(Math.abs(Math.sin((index + 1) * (seed + 1.7)) * 48) + 12)), [seed]);
  return <div className={cn("waveform", active && "is-live")} aria-label={active ? "Live audio waveform" : "Audio waveform"}>{bars.map((height, index) => <i key={index} style={{ height: `${height}%`, animationDelay: `${index * -32}ms` }} />)}</div>;
}

// Use the same art and coordinate system in the shop, builder and profile.
function lookImage(base:AvatarBase,look:Look) {
  return look.customAvatarSrc || fullBodyLooks.find(item=>item.id===look.fullBodyId&&item.avatar===base)?.image || avatarImages[avatarCatalog[base].key];
}
function partFits(id:string,base:AvatarBase,look:Look) {
 const part=fittedParts[id];
 if(!part||(part.base||"Beast")!==base||look.customAvatarSrc)return false;
 return !look.fullBodyId||fullBodyLooks.some(l=>l.id===look.fullBodyId&&l.avatar===base&&l.points===0);
}
function itemVisible(item:ShopItem,base:AvatarBase) {
 return (!item.fullBody||item.fullBody===base)&&(!fittedParts[item.id]||(fittedParts[item.id].base||"Beast")===base);
}
function fittedOutfit(item:ShopItem,base:AvatarBase) {
 return item.id==="road-jacket"?fullBodyLooks.find(l=>l.id==="beast-road-jacket"&&l.avatar===base):undefined;
}
function canEquip(item:ShopItem,base:AvatarBase,look:Look) {
 return !!(item.avatar||item.fullBody===base||fittedOutfit(item,base)||partFits(item.id,base,look)||item.kind.includes("backdrop")||item.kind==="Final stage");
}
function partForValue(value:string|undefined) {
 return Object.entries(fittedParts).find(([id,p])=>value===id||value===p.name)?.[0];
}
function PartArt({id,thumbnail=false}:{id:string;thumbnail?:boolean}){
 const uid=useId().replace(/[^a-zA-Z0-9_-]/g,"");
 const part=fittedParts[id]; if(!part)return null;
 const layers=part.masks.map((m,i)=><g key={i} transform={thumbnail?undefined:m.transform}><clipPath id={uid+"clip"+i} clipPathUnits="userSpaceOnUse"><path d={m.path}/></clipPath><image href={part.source} width="768" height="1152" clipPath={"url(#"+uid+"clip"+i+")"}/></g>);
 return thumbnail?<svg viewBox={part.viewBox} style={{width:"100%",height:"100%"}} role="img" aria-label={part.name}>{layers}</svg>:<g data-fitted-part={id}>{layers}</g>;
}
function AvatarStageArt({base,profile=false,...look}:Look&{base:AvatarBase;profile?:boolean}){
 const src=lookImage(base,look);
 const parts=["jacket","strap","guitarFinish","beltChain","beltCharm","neckwear","wristband","glasses"].map(slot=>partForValue(look.accessories?.[slot])).filter((id):id is string=>!!id&&partFits(id,base,look));
 return <div className={cn("avatar-look",profile&&"profile-look")}><div className={"avatar-backdrop backdrop-"+slug(look.backdrop||"")} aria-hidden="true"/><div style={{position:"absolute",inset:"0",zIndex:2,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>{parts.length?<svg viewBox="0 0 768 1152" style={{width:"100%",height:"100%",filter:"drop-shadow(0 12px 15px #0008)"}} role="img" aria-label={base+" fitted avatar"}><image href={src} width="768" height="1152"/>{parts.map(id=><PartArt id={id} key={id}/>)}</svg>:<img src={src} alt={base+" avatar"} style={{width:"100%",height:"100%",objectFit:"contain",filter:"drop-shadow(0 12px 15px #0008)"}}/>}</div></div>;
}

function UnlockCard({ onOpen, compact = false }: { onOpen: () => void; compact?: boolean }) {
  return <aside className={cn("unlock-card", compact && "compact")}><div><span>FULL JAMBEACON</span><h3>MEMBERSHIP COMING SOON</h3><p>This is a free test build. Paid membership is not active.</p></div><button onClick={onOpen}>MEMBERSHIP DETAILS →</button></aside>;
}

function UnlockModal({ open, close, checkout }: { open: boolean; close: () => void; checkout: () => void }) {
  if (!open) return null;
  return <div className="modal-backdrop" role="presentation" onMouseDown={close}><section className="unlock-modal" role="dialog" aria-modal="true" aria-labelledby="unlock-title" onMouseDown={(event) => event.stopPropagation()}><button className="modal-close" onClick={close} aria-label="Close unlock offer">×</button><span className="offer-kicker">TEST BUILD • NO PAYMENTS</span><h2 id="unlock-title">JAMBEACON MEMBERSHIP</h2><div className="offer-price"><b>$9.99</b><span>planned<br />per month</span></div><ul><li>Light your privacy-safe local Beacon</li><li>Play the complete magical-guitar campaign</li><li>Record over all current and future loop packs</li><li>Use the full avatar builder and points shop</li></ul><button className="primary-button lime-button" onClick={checkout}>CLOSE MEMBERSHIP PREVIEW</button><small>Planned three-day free trial. No purchases or charges in this build.</small></section></div>;
}

const mainTabs: Array<{ key: Screen; icon: string; label: string }> = [
  {key:"beacons",icon:"◎",label:"Beacon"}, {key:"jams",icon:"♫",label:"Jam Shack"}, {key:"loops",icon:"⟳",label:"Loop Station"}, {key:"inbox",icon:"▢",label:"Collab Room"}, {key:"profile",icon:"♟",label:"My Profile"}
];
function BottomNav({ screen, go }: {screen: Screen; go: (screen:Screen)=>void}) {
  return <nav className="bottom-nav" aria-label="JamBeacon navigation">{mainTabs.map(item=><button key={item.key} className={screen===item.key || (item.key==="profile" && (screen==="shop"||screen==="builder"))?"active":""} onClick={()=>go(item.key)}><span>{item.icon}</span><small>{item.label}</small></button>)}</nav>;
}

function AppHeader({ points, onMenu, onHome }: { points: number; onMenu: () => void; onHome: () => void }) {
  return <header className="app-header"><button className="icon-button" onClick={onMenu} aria-label="Open JamBeacon menu">☰</button><button className="wordmark" onClick={onHome} aria-label="Open avatar builder">JAM<span>BEACON</span></button><div className="points-pill" title="Collaboration points">★ {points}</div></header>;
}

function MenuDrawer({open,close,screen,go,onUnlock}: {open:boolean;close:()=>void;screen:Screen;go:(screen:Screen)=>void;onUnlock:()=>void}) {
 if(!open)return null;
 return <div className="drawer-backdrop" onMouseDown={close}><aside className="menu-drawer" aria-label="Menu" onMouseDown={e=>e.stopPropagation()}><div className="drawer-head"><b>JAMBEACON</b><button onClick={close} aria-label="Close menu">×</button></div><nav>{[...mainTabs,{key:"builder" as Screen,icon:"✦",label:"Edit Avatar"},{key:"shop" as Screen,icon:"★",label:"Avatar Shop"}].map(item=><button key={item.key} className={screen===item.key?"active":""} onClick={()=>go(item.key)}><i>{item.icon}</i><span><b>{item.label}</b></span><em>›</em></button>)}</nav><button className="drawer-unlock" onClick={onUnlock}>Account &amp; access</button></aside></div>;
}

function BuilderScreen({ base, setBase, hair, setHair, outfit, setOutfit, gear, setGear, save, onUnlock, accessories, backdrop, fullBodyId, customAvatarSrc, setCustomAvatar }: { base: AvatarBase; setBase: (base: AvatarBase) => void; hair: string; setHair: (value: string) => void; outfit: string; setOutfit: (value: string) => void; gear: string; setGear: (value: string) => void; save: () => void; onUnlock: () => void; accessories:Record<string,string>; backdrop:string; fullBodyId?:string; customAvatarSrc?:string; setCustomAvatar:(src:string)=>void }) {
  const [tab, setTab] = useState<"Base" | "Hair" | "Outfit" | "Gear">("Base");
  const options = { Base: Object.keys(avatarCatalog) as AvatarBase[], Hair: [] as string[], Outfit: fullBodyLooks.filter(l=>l.avatar===base).map(l=>l.name), Gear: [] as string[] };
  const selected = tab === "Base" ? base : tab === "Hair" ? hair : tab === "Outfit" ? outfit : gear;
  const choose = (value: string) => { if (tab === "Base") setBase(value as AvatarBase); if (tab === "Hair") setHair(value); if (tab === "Outfit") setOutfit(value); if (tab === "Gear") setGear(value); };
  const optionIcon = (option: string, index: number) => tab === "Hair" ? ["✦", "⠿", "≋", "▰"][index] : tab === "Outfit" ? ["◇", "◆", "◈", "▣"][index] : gearIcon(option);
  return <section className="screen builder-screen"><h1>My Avatar</h1><div className="avatar-stage"><div className="stage-ring" /><AvatarStageArt base={base} hair={hair} outfit={outfit} gear={gear} accessories={accessories} backdrop={backdrop} fullBodyId={fullBodyId} customAvatarSrc={customAvatarSrc}/></div><div className="builder-tabs" role="tablist">{(["Base", "Hair", "Outfit", "Gear"] as const).map((name) => <button role="tab" aria-selected={tab === name} className={tab === name ? "active" : ""} key={name} onClick={() => setTab(name)}>{name}</button>)}</div>{(tab==="Hair"||tab==="Gear")&&<p>Separate fitted assets are not available yet. Full-body outfits include their illustrated hair and equipment.</p>}<div className={cn("choice-grid", tab === "Base" && "base-grid")}>{options[tab].map((option, index) => <button className={cn("choice-card", selected === option && "selected")} key={option} onClick={() => choose(option)}>{tab === "Base" ? <AvatarImage avatar={avatarCatalog[option as AvatarBase].key} /> : tab==="Outfit"?<img className="avatar-art" src={fullBodyLooks.find(l=>l.avatar===base&&l.name===option)?.image} alt={option}/>:<span className={cn("choice-icon", `tone-${index % 4}`)}>{optionIcon(option, index)}</span>}<small>{option}</small></button>)}</div><label className="music-upload">Import your own avatar<input type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>{const file=e.target.files?.[0];if(!file)return;if(file.size>1500000||!["image/png","image/jpeg","image/webp"].includes(file.type)){alert("Choose a PNG, JPG or WebP under 1.5 MB.");return;}const reader=new FileReader();reader.onload=()=>setCustomAvatar(String(reader.result));reader.readAsDataURL(file);}}/></label>{customAvatarSrc&&<button onClick={()=>setCustomAvatar("")}>Use character artwork</button>}<button className="primary-button lime-button" onClick={save}>Save avatar</button></section>;
}

type LocalTrack = {id:string;name:string;blob:Blob;created:number;library:"profile"|"shack"};
function musicDB(): Promise<IDBDatabase> {
  return new Promise((resolve,reject)=>{const req=indexedDB.open("jambeacon-music",1);req.onupgradeneeded=()=>req.result.createObjectStore("tracks",{keyPath:"id"});req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});
}
async function readTracks(library:LocalTrack["library"]):Promise<LocalTrack[]> {
 if(library==="shack")return (await listTakes()).map(t=>({id:"vault:"+t.id,name:t.title,blob:t.audio,created:t.createdAt,library}));
 const db=await musicDB();return new Promise((resolve,reject)=>{const tx=db.transaction("tracks","readonly"),req=tx.objectStore("tracks").getAll();req.onsuccess=()=>resolve((req.result as LocalTrack[]).filter(t=>t.library===library).sort((a,b)=>b.created-a.created));req.onerror=()=>reject(req.error);tx.oncomplete=()=>db.close();});
}
async function saveTrack(blob:Blob,name:string,library:LocalTrack["library"]){
 if(library==="shack")return saveTake(name,blob);
 if(!blob.size)throw Error("Empty audio file");
 const db=await musicDB();return new Promise<void>((resolve,reject)=>{const tx=db.transaction("tracks","readwrite"),store=tx.objectStore("tracks");store.put({id:crypto.randomUUID(),name,blob,created:Date.now(),library});tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>{db.close();reject(tx.error);};});
}
async function removeTrack(id:string){if(id.startsWith("vault:"))return deleteTake(Number(id.slice(6)));const db=await musicDB();return new Promise<void>((resolve,reject)=>{const tx=db.transaction("tracks","readwrite");tx.objectStore("tracks").delete(id);tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>{db.close();reject(tx.error);};});}
function TrackPlayer({track,remove}:{track:LocalTrack;remove:()=>void}){
 const [url,setUrl]=useState("");useEffect(()=>{const u=URL.createObjectURL(track.blob);setUrl(u);return()=>URL.revokeObjectURL(u);},[track.blob]);
 return <div className="simple-track"><b>{track.name}</b><audio src={url||undefined} controls preload="metadata"/><button onClick={remove}>Remove</button></div>;
}
function MusicLibrary({library,refresh=0}:{library:LocalTrack["library"];refresh?:number}){
 const [tracks,setTracks]=useState<LocalTrack[]>([]),[error,setError]=useState("");
 const load=()=>readTracks(library).then(setTracks).catch(()=>setError("Music storage unavailable."));
 useEffect(()=>{void load();},[library,refresh]);
 return <div className="simple-library"><label className="music-upload">Import music<input type="file" accept="audio/*" multiple onChange={async e=>{const files=Array.from(e.target.files||[]);e.target.value="";try{for(const file of files)await saveTrack(file,file.name,library);await load();}catch{setError("Could not save music on this device.");}}}/></label><small>Saved on this device{library==="shack"?" • 20 tracks max":""}</small>{error&&<p role="alert">{error}</p>}{tracks.map(track=><TrackPlayer key={track.id} track={track} remove={()=>{void removeTrack(track.id).then(load).catch(()=>setError("Could not remove track."));}}/>)}</div>;
}
function ProfileScreen({base,look,edit,shop,clearAccessory}:{base:AvatarBase;look:Look;edit:()=>void;shop:()=>void;clearAccessory:(slot:string)=>void}){
 const [profile,setProfile]=useState<{name?:string;bio?:string;color?:string}>(()=>{try{return JSON.parse(localStorage.getItem("jambeacon-personal-page")||"{}");}catch{return {};}}),[editing,setEditing]=useState(false);
 const update=(next:typeof profile)=>{setProfile(next);localStorage.setItem("jambeacon-personal-page",JSON.stringify(next));};
 return <section className="screen profile-screen simple-profile"><div className="simple-heading"><h1>My Profile</h1><button onClick={()=>setEditing(!editing)}>{editing?"Done":"Edit page"}</button></div><div className="profile-hero" style={{backgroundColor:profile.color||"#11151a"}}><AvatarStageArt base={base} {...look} profile/><button className="settings-button" onClick={edit} aria-label="Edit avatar">⚙</button></div><h2>{profile.name||base}</h2>{profile.bio&&<p>{profile.bio}</p>}{editing&&<div className="simple-edit"><label>Artist name<input value={profile.name||""} onChange={e=>update({...profile,name:e.target.value})}/></label><label>Bio<textarea value={profile.bio||""} onChange={e=>update({...profile,bio:e.target.value})}/></label><label>Page color<input type="color" value={profile.color||"#11151a"} onChange={e=>update({...profile,color:e.target.value})}/></label></div>}<div className="simple-actions"><button onClick={edit}>Edit avatar</button><button onClick={shop}>Avatar shop</button></div>{Object.entries(look.accessories).map(([slot,name])=><div className="simple-accessory" key={slot}>{name}<button onClick={()=>clearAccessory(slot)}>Remove</button></div>)}<h2>My Music</h2><MusicLibrary library="profile"/></section>;
}

function BeaconScreen({ selected, setSelected, live, toggleLive, openChat, onUnlock }: { selected: number; setSelected: (id: number) => void; live: boolean; toggleLive: () => void; openChat: () => void; onUnlock: () => void }) {
  const person = people.find((item) => item.id === selected) ?? people[0];
  return <section className="screen beacon-screen"><h1>Beacon</h1><small>Demo map • Sample musicians only</small><div className="map-stage"><div className="map-grid" /><div className="you-marker">▲<small>YOU</small></div><div className="host-map-pin"><AvatarImage avatar="tx-hippie-child" alt="Tx Hippie Child" /><span><b>{TX_HOST.name}</b><small>{TX_HOST.subName} • HOST</small></span></div>{people.map((item, index) => <button key={item.id} className={cn("map-avatar", `pos-${index + 1}`, `ring-${item.tone}`, selected === item.id && "selected")} onClick={() => setSelected(item.id)} aria-label={`View ${item.name}, ${item.role}`}><AvatarImage avatar={item.avatar} /></button>)}</div><article className="nearby-card cyan-card"><div className="nearby-avatar"><AvatarImage avatar={person.avatar} /></div><div><h2>{person.name}</h2><p>{person.role} • {person.miles}</p><Waveform active={live} seed={person.id} /></div><button className="chat-round" onClick={openChat} aria-label={`Message ${person.name}`}>▰</button></article><button className={cn("primary-button", live ? "orange-button" : "cyan-button")} onClick={toggleLive}>{live ? "Demo Beacon on — turn off" : "Light demo Beacon"}</button><p className="privacy-note">Demo only: live location sharing requires a connected service.</p></section>;
}

type ForumThread={id:string;title:string;body:string;replies:string[]};
function InboxScreen(){
 const [threads,setThreads]=useState<ForumThread[]>(()=>{try{return JSON.parse(localStorage.getItem("jambeacon-local-forum")||"[]");}catch{return [];}}),[title,setTitle]=useState(""),[body,setBody]=useState(""),[selected,setSelected]=useState<string|null>(null),[reply,setReply]=useState("");
 const store=(next:ForumThread[])=>{setThreads(next);localStorage.setItem("jambeacon-local-forum",JSON.stringify(next));};
 const thread=threads.find(t=>t.id===selected);
 return <section className="screen inbox-screen"><h1>Collab Room</h1><small>Local preview • Shared forum not connected</small>{thread?<><button onClick={()=>setSelected(null)}>← All discussions</button><h2>{thread.title}</h2><p>{thread.body}</p>{thread.replies.map((r,i)=><p key={i} className="simple-reply">{r}</p>)}<form className="simple-edit" onSubmit={e=>{e.preventDefault();if(reply.trim()){store(threads.map(t=>t.id===thread.id?{...t,replies:[...t.replies,reply.trim()]}:t));setReply("");}}}><textarea aria-label="Reply" placeholder="Write a reply" value={reply} onChange={e=>setReply(e.target.value)}/><button>Reply</button></form></>:<><form className="simple-edit" onSubmit={e=>{e.preventDefault();if(title.trim()&&body.trim()){store([{id:crypto.randomUUID(),title:title.trim(),body:body.trim(),replies:[]},...threads]);setTitle("");setBody("");}}}><input aria-label="Discussion title" placeholder="Discussion title" value={title} onChange={e=>setTitle(e.target.value)} required/><textarea aria-label="Post" placeholder="Looking for a guitarist? Share an idea…" value={body} onChange={e=>setBody(e.target.value)} required/><button>Post discussion</button></form>{threads.map(t=><button key={t.id} className="simple-thread" onClick={()=>setSelected(t.id)}><b>{t.title}</b><small>{t.replies.length} replies</small></button>)}</>}</section>;
}
function LoopStation(){
 const [selected,setSelected]=useState(0),[library,setLibrary]=useState(loops),[repeat,setRepeat]=useState(true);
 useEffect(()=>{let active=true;fetch("/backing-tracks.json").then(r=>{if(!r.ok)throw Error();return r.json();}).then((items:typeof loops)=>{if(active&&Array.isArray(items)){const valid=items.filter(t=>typeof t.name==="string"&&typeof t.src==="string"&&/^\/(?!\/)/.test(t.src));setLibrary([...loops,...valid]);}}).catch(()=>{});return()=>{active=false;};},[]);
 const player=useRef<HTMLAudioElement>(null),track=library[selected]||library[0];
 return <section className="screen"><h1>Loop Station</h1><h2>{track.name}</h2><p>{track.bpm} BPM • {track.feel}</p><audio ref={player} key={track.src} controls loop={repeat} preload="metadata" src={track.src}/><div className="simple-actions"><button onClick={()=>{if(player.current){player.current.pause();player.current.currentTime=0;}}}>Stop</button><button aria-pressed={repeat} onClick={()=>setRepeat(!repeat)}>Loop {repeat?"on":"off"}</button></div><div className="loop-picker">{library.map((t,i)=><button key={t.src} className={i===selected?"active":""} onClick={()=>{player.current?.pause();setSelected(i);}}><b>{i+1}</b><span>{t.name}<small>{t.bpm} BPM</small></span></button>)}</div></section>;
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
  return <div className="campaign-mode">{progress >= 6 && <div className="champion-banner"><span>♛</span><div><small>CAMPAIGN COMPLETE</small><h2>CROWN OF ROCKNESS</h2><p>You took the magical guitar from a Spring, Texas bedroom to the Rockmania stage.</p></div></div>}<div className="campaign-map">{campaignChapters.map((item, index) => { const number = index + 1; const locked = number > progress; const done = number < progress || progress >= 6; return <button key={item.title} className={cn(chapter === number && "active", done && "done", locked && "locked")} onClick={() => locked ? undefined : setChapter(number)} disabled={locked}><i>{done ? "✓" : number}</i><span>{item.act}<small>{item.title}</small></span></button>; })}</div><article className="story-card"><div className="story-location"><span>{data.act}</span><b>{data.location}</b></div><h1>{data.title}</h1><p>{data.story}</p><div className="host-dialogue"><AvatarImage avatar="tx-hippie-child" alt="Tx Hippie Child" /><blockquote><b>{TX_HOST.name}:</b> “{data.host}”</blockquote></div><div className="story-cast">{chapter >= 2 && <AvatarImage avatar="thunder" alt="Thunder" />}{chapter >= 3 && <AvatarImage avatar="road-dog" alt="Road Dog" />}{chapter >= 3 && <AvatarImage avatar="blue-king" alt="Blue King" />}{chapter >= 4 && <AvatarImage avatar="neon-nova" alt="Neon Nova" />}</div></article><PuzzlePanel chapter={chapter} progress={progress} onSolved={solve} onFinalReady={openStudio} /><div className="chapter-reward"><span>CHAPTER REWARD</span><b>{data.reward}</b></div><UnlockCard compact onOpen={onUnlock} /></div>;
}

function JamScreen({ points, addPoints, campaignProgress, setCampaignProgress, onUnlock, playerAvatar }: { points: number; addPoints: (points: number) => void; campaignProgress: number; setCampaignProgress: (value: number) => void; onUnlock: () => void; playerAvatar: AvatarKey }) {
  const [libraryRefresh,setLibraryRefresh]=useState(0); const [loopIndex, setLoopIndex] = useState(0); const [previewing, setPreviewing] = useState(false); const [recording, setRecording] = useState(false); const [elapsed, setElapsed] = useState(0); const [audioUrl, setAudioUrl] = useState(""); const [status, setStatus] = useState("Ready to record."); const [submitted, setSubmitted] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null); const streamRef = useRef<MediaStream | null>(null); const chunksRef = useRef<Blob[]>([]); const timerRef = useRef<ReturnType<typeof setInterval> | null>(null); const audioContextRef = useRef<AudioContext | null>(null); const loopAudioRef = useRef<HTMLAudioElement | null>(null); const loopSourceRef = useRef<MediaElementAudioSourceNode | null>(null); const mixDestinationRef = useRef<MediaStreamAudioDestinationNode | null>(null); const previewRef = useRef<HTMLAudioElement | null>(null);
  const stopPreview = () => { previewRef.current?.pause(); if (previewRef.current) previewRef.current.currentTime = 0; previewRef.current = null; setPreviewing(false); };
  const preview = () => { if (previewing) { stopPreview(); return; } stopPreview(); const audio = new Audio(loops[loopIndex].src); audio.loop = true; audio.volume = .9; previewRef.current = audio; audio.play().then(() => setPreviewing(true)).catch(() => setStatus("Tap again after allowing audio playback in your browser.")); };
  const stopLoop = () => { const audio = loopAudioRef.current; if (audio) { audio.pause(); audio.currentTime = 0; audio.removeAttribute("src"); audio.load(); } loopAudioRef.current = null; loopSourceRef.current?.disconnect(); loopSourceRef.current = null; };
  const closeAudio = () => { stopLoop(); mixDestinationRef.current = null; audioContextRef.current?.close().catch(() => undefined); audioContextRef.current = null; };
  const startLoop = async (context: AudioContext, destination: MediaStreamAudioDestinationNode) => { stopLoop(); const audio = new Audio(loops[loopIndex].src); audio.loop = true; audio.preload = "auto"; audio.volume = .86; const source = context.createMediaElementSource(audio); source.connect(context.destination); source.connect(destination); loopAudioRef.current = audio; loopSourceRef.current = source; await context.resume(); await audio.play(); };
  const startRecording = async () => { stopPreview(); if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") { setStatus("This browser does not provide microphone recording. Open JamBeacon in Chrome on your phone."); return; } try { const stream = await navigator.mediaDevices.getUserMedia({ audio: true }); streamRef.current = stream; chunksRef.current = []; const context = new AudioContext(); audioContextRef.current = context; const destination = context.createMediaStreamDestination(); mixDestinationRef.current = destination; context.createMediaStreamSource(stream).connect(destination); await startLoop(context, destination); const recorder = new MediaRecorder(destination.stream); recorderRef.current = recorder; recorder.ondataavailable = (event) => event.data.size && chunksRef.current.push(event.data); recorder.onstop = () => { const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" }); if (audioUrl) URL.revokeObjectURL(audioUrl); setAudioUrl(URL.createObjectURL(blob)); stream.getTracks().forEach((track) => track.stop()); streamRef.current = null; closeAudio(); setStatus("Take ready."); }; recorder.start(); setElapsed(0); setRecording(true); setSubmitted(false); setStatus(`Recording over ${loops[loopIndex].name} — play your part.`); timerRef.current = setInterval(() => setElapsed((value) => value + 1), 1000); } catch { streamRef.current?.getTracks().forEach((track) => track.stop()); streamRef.current = null; closeAudio(); setStatus("The loop could not start. Check microphone permission and try again."); } };
  const stopRecording = () => { if (recorderRef.current?.state === "recording") recorderRef.current.stop(); if (timerRef.current) clearInterval(timerRef.current); timerRef.current = null; stopLoop(); setRecording(false); };
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); streamRef.current?.getTracks().forEach((track) => track.stop()); stopPreview(); closeAudio(); }, []);
  const submit = () => { if (!audioUrl) { setStatus("Record a take before submitting your track."); return; } if (!submitted) addPoints(300); setSubmitted(true); if (campaignProgress === 5) setCampaignProgress(6); setStatus(campaignProgress === 5 ? "Final take submitted. You earned the Crown of Rockness!" : "Track submitted. Your care package is ready."); };
  const time = `${String(Math.floor(elapsed / 60)).padStart(2, "0")}:${String(elapsed % 60).padStart(2, "0")}`;
  return <section className="screen jam-screen"><h1>Jam Shack</h1><div className="studio-head"><h2>{loops[loopIndex].name}</h2><p>{loops[loopIndex].bpm} BPM • {loops[loopIndex].feel}</p><button onClick={preview} disabled={recording}>{previewing?"Stop backing track":"Play backing track"}</button></div><label className="simple-edit">Backing track<select value={loopIndex} disabled={recording} onChange={e=>{stopPreview();setLoopIndex(Number(e.target.value));}}>{loops.map((loop,index)=><option key={loop.src} value={index}>{loop.name}</option>)}</select></label><div className="record-panel"><Waveform active={recording||previewing} seed={loopIndex+elapsed}/><div className="record-controls"><button className={cn("record-button",recording&&"recording")} onClick={recording?stopRecording:startRecording} aria-label={recording?"Stop recording":"Record"}><i/></button><strong>{time}</strong></div><p>{status}</p>{audioUrl&&<audio className="take-player" src={audioUrl} controls/>}<div className="record-actions"><button onClick={()=>{setAudioUrl("");setElapsed(0);setSubmitted(false);setStatus("Ready to record.");}} disabled={!audioUrl||recording}>Retake</button><button disabled={!audioUrl||recording||submitted} onClick={async()=>{try{const blob=await fetch(audioUrl).then(r=>r.blob());await saveTrack(blob,loops[loopIndex].name+" take","shack");setSubmitted(true);setLibraryRefresh(n=>n+1);setStatus("Saved to My Takes.");}catch{setStatus("Could not save this take.");}}}>Save take</button></div></div><h2>My Takes</h2><MusicLibrary library="shack" refresh={libraryRefresh}/></section>;
}

function ShopScreen({ points, spend, owns, base, look }: { points: number; spend: (item: ShopItem) => void; owns: (item: ShopItem)=>boolean; base:AvatarBase; look:Look }) {
  const [preview,setPreview]=useState<ShopItem|null>(null);
  useEffect(()=>setPreview(null),[base,look.fullBodyId,look.backdrop,look.customAvatarSrc,look.accessories]);
  const fit=preview&&(preview.fullBody===base?fullBodyLooks.find(l=>l.id===preview.id):fittedOutfit(preview,base));
  const previewBase=preview?.avatar||base;
  const previewLook:Look=preview?.avatar?starterLook:fit?{...look,fullBodyId:fit.id,outfit:fit.name,customAvatarSrc:""}:preview&&fittedParts[preview.id]?{...look,accessories:{...look.accessories,[fittedParts[preview.id].slot]:preview.name}}:preview&&(preview.kind.includes("backdrop")||preview.kind==="Final stage")?{...look,backdrop:preview.name}:look;
  return <section className="screen shop-screen"><div className="shop-title"><span>🛍</span><h1>AVATAR SHOP</h1><b>{points.toLocaleString()} PTS ★</b></div><div style={{position:"sticky",top:0,zIndex:9,background:"#101318",padding:"6px 0 8px"}}><div className="avatar-stage" style={{position:"relative",height:240,minHeight:240,marginBottom:4}}><AvatarStageArt base={previewBase} {...previewLook}/></div><p style={{textAlign:"center",margin:"4px 0"}}>{preview?"Trying on "+preview.name:"Equipped look · "+base} {preview&&<button onClick={()=>setPreview(null)}>Cancel preview</button>}</p></div><div className="shop-list">{shopCategories.map((category) => <div className="shop-category" key={category}><div className="shop-category-head"><b>{category}</b><span>{shopItems.filter((item) => item.category === category && itemVisible(item,base)).length} ITEMS</span></div>{shopItems.filter((item) => item.category === category && itemVisible(item,base)).map((item, index) => <article key={item.id} className={cn("shop-item", `${item.tone}-card`)}><div className={cn("shop-art", item.category === "GUITAR VAULT" && "guitar-art", `skin-${index % 6}`)}>{fittedParts[item.id]?<PartArt id={item.id} thumbnail/>:item.image ? <img src={item.image} alt={item.name} style={{width:"100%",height:"100%",objectFit:"contain"}}/> : item.avatar ? <AvatarImage avatar={avatarCatalog[item.avatar].key} alt={item.name} /> : <span>{item.icon}</span>}</div><div><small>{item.kind}</small><h2>{item.name}</h2><div className="shop-meta"><strong>{item.points} PTS</strong></div><button onClick={()=>setPreview(item)} disabled={!canEquip(item,base,look)}>Try on</button><button onClick={() => {spend(item);setPreview(null);}} disabled={!canEquip(item,base,look)||(!owns(item)&&points<item.points)}>{!canEquip(item,base,look)?(owns(item)?"Owned · fitting pending":"Fitted artwork pending"):owns(item)?"Equip":points<item.points?`${item.points-points} more pts`:item.avatar?"Buy character":"Buy & equip"}</button></div></article>)}</div>)}</div></section>;
}

export default function JamBeaconApp(){
 const [saved]=useState<{base?:AvatarBase;hair?:string;outfit?:string;gear?:string;points?:number;campaignProgress?:number;looks?:Partial<Record<AvatarBase,Look>>;owned?:string[]}>(()=>{try{return JSON.parse(localStorage.getItem("jambeacon-avatar")||"{}");}catch{return {};}});
 const [screen,setScreen]=useState<Screen>("beacons"),[base,setBase]=useState<AvatarBase>(saved.base&&avatarCatalog[saved.base]?saved.base:"Beast"),[looks,setLooks]=useState<Partial<Record<AvatarBase,Look>>>(saved.looks||{[saved.base||"Beast"]:{...starterLook,hair:saved.hair||starterLook.hair,outfit:saved.outfit||starterLook.outfit,gear:saved.gear||starterLook.gear}}),[owned,setOwned]=useState<string[]>(saved.owned||[]),[points,setPoints]=useState(saved.points??1250),[campaignProgress,setCampaignProgress]=useState(saved.campaignProgress??1),[beaconLive,setBeaconLive]=useState(false),[selectedPerson,setSelectedPerson]=useState(1),[notice,setNotice]=useState(""),[menuOpen,setMenuOpen]=useState(false),[unlockOpen,setUnlockOpen]=useState(false);
 const look:Look={...starterLook,...looks[base],accessories:looks[base]?.accessories||{}};
 useEffect(()=>{if("serviceWorker"in navigator)navigator.serviceWorker.register("/sw.js").catch(()=>undefined);},[]);
 useEffect(()=>{try{localStorage.setItem("jambeacon-avatar",JSON.stringify({...saved,base,looks,owned,points,campaignProgress,hair:look.hair,outfit:look.outfit,gear:look.gear}));}catch{setNotice("Could not save avatar on this device.");}},[base,looks,owned,points,campaignProgress]);
 const changeLook=(patch:Partial<Look>)=>setLooks(all=>({...all,[base]:{...(all[base]||starterLook),...patch}}));
 const go=(next:Screen)=>{setScreen(next);setMenuOpen(false);};
 const toast=(message:string)=>{setNotice(message);window.setTimeout(()=>setNotice(""),3000);};
 const spend=(item:ShopItem)=>{
  if(!canEquip(item,base,look)){toast("This item needs fitted artwork for your character.");return;}
  const ownership=(item.avatar?"character":base)+":"+item.id;
  if(!owned.includes(ownership)){if(points<item.points){toast("Not enough points.");return;}setPoints(p=>p-item.points);setOwned(v=>[...v,ownership]);}
  if(item.avatar){setBase(item.avatar);toast(item.name+" equipped.");return;}
  if(item.fullBody){if(item.fullBody!==base)return;changeLook({fullBodyId:item.id,outfit:item.name,customAvatarSrc:""});}
  else if(fittedOutfit(item,base)){const fit=fittedOutfit(item,base)!;changeLook({outfit:fit.name,fullBodyId:fit.id,customAvatarSrc:""});}
  else if(item.kind.includes("backdrop")||item.kind==="Final stage")changeLook({backdrop:item.name});
  else if(fittedParts[item.id]){const slot=fittedParts[item.id].slot;changeLook({accessories:{...look.accessories,[slot]:item.name}});}
  else changeLook({gear:item.name});
  toast(item.name+" equipped.");
 };
 const clearAccessory=(slot:string)=>{const accessories={...look.accessories};delete accessories[slot];changeLook({accessories});};
 const playerAvatar=avatarCatalog[base].key;
 return <main className="site-shell simple-shell"><aside className="desktop-rail"><div className="rail-brand"><span>⚡</span><b>JAM<em>BEACON</em></b><small>FIND PEOPLE. MAKE SONGS.</small></div><nav>{mainTabs.map(item=><button key={item.key} onClick={()=>go(item.key)} className={screen===item.key?"active":""}>{item.icon} {item.label}</button>)}</nav></aside><div className="phone-app"><AppHeader points={points} onMenu={()=>setMenuOpen(true)} onHome={()=>go("beacons")}/><div className="screen-scroll with-bottom-nav">{(["beacons","jams","loops","inbox"] as Screen[]).includes(screen)&&<div className="equipped-avatar-strip" style={{display:"flex",alignItems:"center",gap:12,padding:"6px 12px",borderBottom:"1px solid #333",background:"#11151a"}}><div style={{position:"relative",width:90,height:112,flexShrink:0}}><AvatarStageArt base={base} {...look}/></div><div><strong>{base}</strong><p style={{margin:"4px 0",fontSize:12}}>Your equipped avatar</p><button onClick={()=>go("shop")}>Change look</button></div></div>}{screen==="builder"&&<BuilderScreen base={base} setBase={setBase} hair={look.hair} setHair={hair=>changeLook({hair})} outfit={look.outfit} setOutfit={outfit=>{const fit=fullBodyLooks.find(l=>l.avatar===base&&l.name===outfit);if(fit&&(fit.points===0||owned.includes(base+":"+fit.id)|| (fit.id==="beast-road-jacket"&&owned.includes(base+":road-jacket")))){changeLook({outfit:fit.name,fullBodyId:fit.id,customAvatarSrc:""});}else{toast("Choose fitted outfits in the Avatar Shop.");go("shop");}}} gear={look.gear} accessories={look.accessories} backdrop={look.backdrop} fullBodyId={look.fullBodyId} customAvatarSrc={look.customAvatarSrc} setCustomAvatar={customAvatarSrc=>changeLook({customAvatarSrc})} setGear={gear=>changeLook({gear})} save={()=>{toast("Avatar saved.");go("profile");}} onUnlock={()=>setUnlockOpen(true)}/>} {screen==="profile"&&<ProfileScreen base={base} look={look} edit={()=>go("builder")} shop={()=>go("shop")} clearAccessory={clearAccessory}/>} {screen==="beacons"&&<BeaconScreen selected={selectedPerson} setSelected={setSelectedPerson} live={beaconLive} toggleLive={()=>setBeaconLive(v=>!v)} openChat={()=>go("inbox")} onUnlock={()=>setUnlockOpen(true)}/>} {screen==="inbox"&&<InboxScreen/>} {screen==="loops"&&<LoopStation/>} {screen==="jams"&&<JamScreen points={points} addPoints={n=>setPoints(p=>p+n)} campaignProgress={campaignProgress} setCampaignProgress={setCampaignProgress} onUnlock={()=>setUnlockOpen(true)} playerAvatar={playerAvatar}/>} {screen==="shop"&&<ShopScreen points={points} base={base} look={look} spend={spend} owns={item=>owned.includes((item.avatar?"character":base)+":"+item.id)}/>}</div><BottomNav screen={screen} go={go}/><MenuDrawer open={menuOpen} close={()=>setMenuOpen(false)} screen={screen} go={go} onUnlock={()=>{setMenuOpen(false);setUnlockOpen(true);}}/><UnlockModal open={unlockOpen} close={()=>setUnlockOpen(false)} checkout={()=>{toast("Membership is not active in this free test build. No payment has been made.");setUnlockOpen(false);}}/>{notice&&<div className="toast" role="status">{notice}</div>}</div></main>;
}
