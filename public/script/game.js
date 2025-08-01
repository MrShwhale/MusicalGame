// TODO make this server-generated
const albumOptions = [
  "Epic",
  "Hamilton",
  "Heathers",
  "The Mad Ones",
  // "The Phantom of the Opera",
  "Six",
];

// Settings
let albumsInRotation;
let songStartLengths;
let albumsWeighted;
let songsWeighted;
let giveMusical;

// Global vars
let musicalIndex;
let songIndex;
let wordIndex;
let uniqueLists;
let currentLine;
let currentLength;
let stats;

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function setMusicalHolder() {
  document.getElementById("musical-holder").innerHTML = "";
  if (giveMusical) {
    addAlbumToHolder(albumsInRotation[musicalIndex]);
  } else {
    for (const album of albumsInRotation) {
      addAlbumToHolder(album);
    }
  }
}

function addAlbumToHolder(album) {
  let holder = document.getElementById("musical-holder");

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
  showStats();
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
  if (guess === albumsInRotation[musicalIndex].texts[songIndex].name) {
    stats[musicalIndex][0] += 1;
    stats[musicalIndex][1] += currentLength;
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
}

function setAlbums(names, lengths) {
  songStartLengths = lengths;
  Promise.all(
    names.map((name) => {
      return fetch(`album/${name}`).then((response) => {
        if (!response.ok) {
          throw new Error(`Response status: ${response.status}`);
          return Promise.reject();
        }

        return response.json();
      });
    }),
  ).then((values) => {
    albumsInRotation = values;
    stats = Array(values.length)
      .fill()
      .map(() => Array(2).fill(0));
    generateUniques();
    pickNewLine();
    printSettings();
  });
}

function showStats() {
  let container = document.getElementById("stats-panel");
  container.innerHTML = "";

  const header = document.createElement("h1");
  header.innerHTML = "Stats";
  container.appendChild(header);

  let [totalCorrect, totalLength] = stats.reduce(
    (acc, curr) => [acc[0] + curr[0], acc[1] + curr[1]],
    [0, 0],
  );

  let title = document.createElement("h2");
  title.innerHTML = "Total";
  container.appendChild(title);

  let correct = document.createElement("p");
  correct.innerHTML = `Total correct: ${totalCorrect}`;
  container.appendChild(correct);

  let average = document.createElement("p");
  let words = totalCorrect === 0 ? 0 : (totalLength / totalCorrect).toFixed(3);
  average.innerHTML = `Words per guess: ${words}`;
  container.appendChild(average);

  for (let index = 0; index < albumsInRotation.length; index++) {
    container.appendChild(document.createElement("hr"));
    let title = document.createElement("h2");
    title.innerHTML = albumsInRotation[index].name;
    container.appendChild(title);

    let correct = document.createElement("p");
    correct.innerHTML = `Total correct: ${stats[index][0]}`;
    container.appendChild(correct);

    let average = document.createElement("p");
    let words =
      stats[index][0] === 0
        ? 0
        : (stats[index][1] / stats[index][0]).toFixed(3);
    average.innerHTML = `Words per guess: ${words}`;
    container.appendChild(average);
  }
}

function printSettings() {
  let container = document.getElementById("album-settings");
  container.innerHTML = "";

  let namesToNumbers = {};
  for (let i = 0; i < albumsInRotation.length; i++) {
    namesToNumbers[albumsInRotation[i].name] = songStartLengths[i];
  }

  for (const album of albumOptions) {
    let holder = document.createElement("div");
    holder.classList.add("musical-setting");

    let enable = document.createElement("input");
    enable.setAttribute("type", "checkbox");

    let title = document.createElement("span");
    title.innerHTML = album;

    let wordCount = document.createElement("input");
    wordCount.setAttribute("type", "number");

    if (album in namesToNumbers) {
      enable.checked = true;
      wordCount.value = namesToNumbers[album];
    }
    holder.appendChild(enable);
    holder.appendChild(title);
    holder.appendChild(wordCount);

    container.appendChild(holder);
  }

  document.getElementById("album-weight").checked = albumsWeighted;
  document.getElementById("song-weight").checked = songsWeighted;
  document.getElementById("give-musical").checked = giveMusical;
}

function updateSettings() {
  // Create album list
  let albums = [];
  let lengths = [];
  for (const child of document.getElementById("album-settings").children) {
    if (child.firstChild.checked) {
      albums.push(child.children[1].innerHTML);
      lengths.push(child.children[2].value);
    }
  }

  // Check things
  // TODO add visual indicator here instead of undoing
  if (albums.length <= 0) {
    printSettings();
    return;
  }

  try {
    lengths = lengths.map((val) => {
      return parseInt(val);
    });
  } catch {
    printSettings();
    return;
  }

  if (
    !lengths.every((value) => {
      return value > 0;
    })
  ) {
    printSettings();
    return;
  }

  albumsWeighted = document.getElementById("album-weight").checked;
  songsWeighted = document.getElementById("song-weight").checked;
  giveMusical = document.getElementById("give-musical").checked;
  setAlbums(albums, lengths);
}

function setDefaults() {
  albumsWeighted = false;
  songsWeighted = false;
  // BUG this does not work as intended: uniques are only garunteed within musical
  giveMusical = true;
  setAlbums(["Hamilton"], [3]);
}

setDefaults();

document.getElementById("reset-settings").addEventListener("click", () => {
  printSettings();
});

document.getElementById("apply-settings").addEventListener("click", () => {
  updateSettings();
});

document.getElementById("hide-settings").addEventListener("click", () => {
  document.getElementById("settings-panel").classList.toggle("hidden");
});
