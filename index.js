// index.js
const Mustache = require('mustache');
const fs = require('fs');
const MUSTACHE_MAIN_DIR = './main.mustache';
const fetch = require('node-fetch');
request = require('request');
const XMLHttpRequest = require('xhr2');

function getCurrentSong(callback) {
    const that = this
    const url =
      'https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=belk5&api_key=c68ea49b4e861204b0e6b6607a77c542&format=json&limit=1'
    httpGetAsync(url, function(data) {
      const currentSong = JSON.parse(data)
      const theTrack = currentSong.recenttracks.track[0]
      const theArtist = theTrack.artist['#text']
      let theTitle = theTrack.name
      const nowPlaying = theTrack['@attr'] && theTrack['@attr'].nowplaying
      let listenText = ''
      if (nowPlaying) {
        listenText = "Right now, I'm listening to "
      } else {
        // converts 9712739817 ms to "4 minute" ago
        let timeSinceText = timeSince(theTrack.date.uts)
        // if it's not 1, make it plural
        if (!timeSinceText.startsWith('1 ')) {
          timeSinceText += 's'
        }
        listenText = timeSinceText + ' ago, I listened to '
      }
      /* split at the part in front of any hyphen or parenthese
       * to take a song title like this:
       *     (I Can't Get No) Satisfaction - Mono Version / Remastered 2002
       * and turn it into:
       *     (I Can't Get No) Satisfaction
       * and also cut it off at 32 characters for those songs that be like:
       *     Piano Sonata No. 14 in C-Sharp Minor, Op. 27 No. 2 "Moonlight": I. Adagio sostenuto
       */
      theTitle = theTitle
        .split(' - ')[0]
        .split(' (')[0]
        .trim()
        .substring(0, 32)
      that.listenText = listenText
      that.theTitle = theTitle
      that.theArtist = theArtist
    })
  }

  // https://stackoverflow.com/a/8247097
  function timeSince(date) {
    const seconds = Math.floor(new Date().getTime() / 1000 - date)
    let interval = Math.floor(seconds / 31536000)
    if (interval > 1) return interval + ' year'
    interval = Math.floor(seconds / 2592000)
    if (interval > 1) return interval + ' minute'
    interval = Math.floor(seconds / 86400)
    if (interval >= 1) return interval + ' day'
    interval = Math.floor(seconds / 3600)
    if (interval >= 1) return interval + ' hour'
    interval = Math.floor(seconds / 60)
    if (interval > 1) return interval + ' minute'
    return Math.floor(seconds) + ' second'
  }


  async function setWeatherInformation() {
    await fetch(
        'https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=belk5&api_key=c68ea49b4e861204b0e6b6607a77c542&format=json&limit=1'
    )
      .then(r => r.json())
      .then(data => {
        const theTrack = data.recenttracks.track[0]
        console.log(theTrack);
        const theArtist = theTrack.artist['#text']
        let theTitle = theTrack.name
        let thumbnail = theTrack.image[2]['#text']
        const nowPlaying = theTrack['@attr'] && theTrack['@attr'].nowplaying
        let listenText = ''
        if (nowPlaying) {
          listenText = "Currently listening to "
        } else {
          // converts 9712739817 ms to "4 minute" ago
          let timeSinceText = timeSince(theTrack.date.uts)
          // if it's not 1, make it plural
          if (!timeSinceText.startsWith('1 ')) {
            timeSinceText += 's'
          }
          listenText = timeSinceText + ' ago, I listened to '
        }
        theTitle = theTitle
        .split(' - ')[0]
        .split(' (')[0]
        .trim()
        .substring(0, 32)

DATA.prefix="🎵"
DATA.listenText = listenText
DATA.artist = theArtist
DATA.title = theTitle
DATA.thumbnail = thumbnail;
      });
  }

let DATA = {
  name: 'Belka',
  date: new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    timeZoneName: 'short',
    timeZone: 'Europe/Stockholm',
  }),

};/**
  * A - We open 'main.mustache'
  * B - We ask Mustache to render our file with the data
  * C - We create a README.md file with the generated output
  */
async function generateReadMe() {
await setWeatherInformation();
  fs.readFile(MUSTACHE_MAIN_DIR, (err, data) =>  {
    if (err) throw err;
    const output = Mustache.render(data.toString(), DATA);
    fs.writeFileSync('README.md', output);
  });
}
generateReadMe();
