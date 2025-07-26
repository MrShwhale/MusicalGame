// TODO make this server-generated
const albumOptions = [
  "Epic",
  "Hamilton",
  "Heathers",
  "The Mad Ones",
  "The Phantom of the Opera",
  "Six",
];

// Settings
let albumsInRotation;
let songStartLengths;
let albumsWeighted;
let songsWeighted;

// Global vars
let songIndex;
let uniqueLists;
let currentLine;
let currentLength;
let musicalIndex;
let wordIndex;

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function setMusicalHolder() {
  document.getElementById("musical-holder").innerHTML = "";
  let holder = document.getElementById("musical-holder");
  for (const album of albumsInRotation) {
    console.log(album);
    const title = document.createElement("h1");
    title.innerHTML = album.name;
    holder.appendChild(title);
    const musical = document.createElement("div");
    musical.classList.add("song-bank");
    for (const song of album.texts) {
      const button = document.createElement("button");
      button.setAttribute("type", "button");
      button.innerHTML = song.name;
      button.addEventListener("click", (e) => {
        makeGuess(e.target.innerHTML);
        e.target.remove();
      });
      musical.appendChild(button);
    }
    holder.appendChild(musical);
  }
}

function pickNewLine() {
  if (albumsWeighted) {
    // TODO pick weighted by song count
  } else {
    musicalIndex = getRandomInt(albumsInRotation.length);
  }

  if (songsWeighted) {
    // TODO pick weighted by song length
  } else {
    songIndex = getRandomInt(albumsInRotation[musicalIndex].texts.length);
  }

  currentLength = songStartLengths[musicalIndex];
  wordIndex =
    uniqueLists[musicalIndex][songIndex][
      getRandomInt(uniqueLists[musicalIndex][songIndex].length)
    ];

  let line = albumsInRotation[musicalIndex].texts[songIndex].raw
    .slice(wordIndex, wordIndex + currentLength)
    .join(" ")
    .replaceAll("\n", "<br>");

  document.getElementById("musical-text").innerHTML = line;
  setMusicalHolder();
}

function continueLine() {
  currentLength++;

  let line = albumsInRotation[musicalIndex].texts[songIndex].raw
    .slice(wordIndex, wordIndex + currentLength)
    .join(" ")
    .replaceAll("\n", "<br>");

  document.getElementById("musical-text").innerHTML = line;
}

function makeGuess(guess) {
  console.log("Guess:", guess);
  if (guess === albumsInRotation[musicalIndex].texts[songIndex].name) {
    pickNewLine();
  } else {
    continueLine();
  }
}

function generateUniques() {
  uniqueLists = [];
  for (let i = 0; i < albumsInRotation.length; i++) {
    let currentAlbum = albumsInRotation[i];
    let n = songStartLengths[i];
    const uniques = new Map();
    for (let j = 0; j < currentAlbum.texts.length; j++) {
      let currentSong = currentAlbum.texts[j];
      for (let k = 0; k < currentSong.filtered.length - n + 1; k++) {
        let nGram = currentSong.filtered.slice(k, k + n);
        let nStr = nGram.join(" ");
        uniques.set(nStr, [k, j, !uniques.has(nStr)]);
      }
    }

    console.log("uni", uniques);

    let textList = Array.apply(null, Array(currentAlbum.texts.length)).map(
      function (x, i) {
        return new Set();
      },
    );
    for (const nVal of uniques.values()) {
      if (nVal[2]) {
        textList[nVal[1]].add(nVal[0]);
      }
    }

    uniqueLists.push(
      textList.map((x) => {
        return Array.from(x);
      }),
    );
  }

  console.log("lists", uniqueLists);
}

function setDefaults() {
  fetch("album/Hamilton").then((response) => {
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    response.json().then((json) => {
      albumsInRotation = [json];
      songStartLengths = [8];
      albumsWeighted = false;
      songsWeighted = false;

      generateUniques();
      pickNewLine();
    });
  });
}

setDefaults();
