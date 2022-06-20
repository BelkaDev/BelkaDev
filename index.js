const Mustache = require("mustache");
const fs = require("fs");
const fetch = require("node-fetch");


const MUSTACHE_MAIN_DIR = "./main.mustache";

function getCurrentSong(callback) {
  const that = this;
  const url =
    "https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=belk5&api_key=c68ea49b4e861204b0e6b6607a77c542&format=json&limit=1";
  httpGetAsync(url, function (data) {
    const currentSong = JSON.parse(data);
    const theTrack = currentSong.recenttracks.track[0];
    const theArtist = theTrack.artist["#text"];
    let theTitle = theTrack.name;
    const nowPlaying = theTrack["@attr"] && theTrack["@attr"].nowplaying;
    let listenText = "";
    if (nowPlaying) {
      listenText = "Right now, I'm listening to ";
    } else {
      let timeSinceText = timeSince(theTrack.date.uts);
      if (!timeSinceText.startsWith("1 ")) {
        timeSinceText += "s";
      }
      listenText = timeSinceText + " ago, I listened to ";
    }
    theTitle = theTitle.split(" - ")[0].split(" (")[0].trim().substring(0, 32);
    that.listenText = listenText;
    that.theTitle = theTitle;
    that.theArtist = theArtist;
  });
}

function timeSince(date) {
  const seconds = Math.floor(new Date().getTime() / 1000 - date);
  let interval = Math.floor(seconds / 31536000);
  if (interval > 1) return interval + " year";
  interval = Math.floor(seconds / 2592000);
  if (interval > 1) return interval + " minute";
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) return interval + " day";
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) return interval + " hour";
  interval = Math.floor(seconds / 60);
  if (interval > 1) return interval + " minute";
  return Math.floor(seconds) + " second";
}

async function setTrackInformation() {
  await fetch(
    "https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=belk5&api_key=c68ea49b4e861204b0e6b6607a77c542&format=json&limit=1"
  )
    .then((r) => r.json())
    .then((data) => {
      const theTrack = data.recenttracks.track[0];
      const theArtist = theTrack.artist["#text"];
      let theTitle = theTrack.name;
      let thumbnail = theTrack.image[2]["#text"];
      const nowPlaying = theTrack["@attr"] && theTrack["@attr"].nowplaying;
      let listenText = "";
      if (nowPlaying) {
        listenText = "Currently listening to ";
      } else {
        let timeSinceText = timeSince(theTrack.date.uts);
        if (!timeSinceText.startsWith("1 ")) {
          timeSinceText += "s";
        }
        listenText = timeSinceText + " ago, I listened to ";
      }
      theTitle = theTitle
        .split(" - ")[0]
        .split(" (")[0]
        .trim()
        .substring(0, 32);

      DATA.prefix = "🎵🎶";
      DATA.searchQuery = `${theArtist} ${theTitle}`.replace(/\s+/g, "+");
      DATA.listenText = listenText;
      DATA.artist = theArtist;
      DATA.title = theTitle;
      DATA.thumbnail = thumbnail;
    });
}

let DATA = {
  name: "Belka",
  date: new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    timeZoneName: "short",
    timeZone: "Europe/Stockholm",
  }),
};
async function generateReadMe() {
  await setTrackInformation();
  fs.readFile(MUSTACHE_MAIN_DIR, (err, data) => {
    if (err) throw err;
    const output = Mustache.render(data.toString(), DATA);
    fs.writeFileSync("README.md", output);
  });
}
generateReadMe();
