const CACHE_NAME = "jambeacon-rockmania-v13";
const APP_SHELL = [
  "/",
  "/app/",
  "/manifest.webmanifest",
  "/jambeacon-icon.svg",
  "/tx-hippie-child.webp",
  "/avatars/ambilicous/original.webp",
  "/avatars/ambilicous/neon-headliner.webp",
  "/avatars/c-note/original.webp",
  "/avatars/c-note/emerald-road-case.webp",
  "/avatars/lee-fingerz/original.webp",
  "/avatars/lee-fingerz/arena-voltage.webp",
  "/avatars/beast/original.webp",
  "/avatars/beast/jambeacon-shirt.webp",
  "/avatars/beast/first-gig.webp",
  "/avatars/beast/road-jacket.webp",
  "/avatars/beast/neon-stage.webp",
  "/avatars/beast/rockmania-suit.webp",
  "/avatars/dirt-bike-joey/original.webp",
  "/avatars/dirt-bike-joey/trail-rider.webp",
  "/avatars/dirt-bike-joey/night-rider.webp",
  "/avatars/dirt-bike-joey/festival-roadie.webp",
  "/avatars/dirt-bike-joey/pit-crew-mechanic.webp",
  "/avatars/dirt-bike-joey/ultimate-stage-rider.webp",
  "/avatars/crew/big-show.webp",
  "/avatars/crew/jrod.webp",
  "/avatars/crew/democrat-pat.webp",
  "/avatars/crew/hard-rock-harold-banjo-cutout.webp",
  "/jam-chat-scene.webp",
  "/audio/loops-v2/texas-thunder-120bpm.mp3",
  "/audio/loops-v2/lone-star-shuffle-105bpm.mp3",
  "/audio/loops-v2/funk-highway-102bpm.mp3",
  "/audio/loops-v2/garage-stomp-128bpm.mp3",
  "/audio/loops-v2/midnight-pocket-92bpm.mp3",
  "/audio/loops-v2/arena-drive-135bpm.mp3",
  "/audio/loops-v2/blues-six-84bpm.mp3",
  "/audio/loops-v2/southern-halftime-76bpm.mp3",
  "/audio/loops-v2/neon-punk-172bpm.mp3",
  "/audio/loops-v2/heavy-crown-145bpm.mp3",
  "/audio/loops-v2/desert-reggae-88bpm.mp3",
  "/audio/loops-v2/breakbeat-chase-110bpm.mp3"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok) caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response.clone()));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

