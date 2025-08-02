// TODO make this server-generated
const albumOptions = ["Epic", "Hamilton", "Heathers", "The Mad Ones", "Six"];

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

// Returns a random integer on the interval [0, max)
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

// Set the global arrays of unique n-grams
// n-grams and text are from the other global variables
// TODO actually set up not giving the musical (one uniqueList for all)
function generateUniques() {
  uniqueLists = [];
  for (let i = 0; i < albumsInRotation.length; i++) {
    const currentAlbum = albumsInRotation[i];
    const n = songStartLengths[i];
    const uniques = new Map();
    for (let j = 0; j < currentAlbum.texts.length; j++) {
      const currentSong = currentAlbum.texts[j];
      for (let k = 0; k < currentSong.filtered.length - n + 1; k++) {
        let nGram = currentSong.filtered.slice(k, k + n);
        let nStr = nGram.join(" ");
        uniques.set(nStr, [k, j, !uniques.has(nStr)]);
      }
    }

    const textList = Array.apply(null, Array(currentAlbum.texts.length)).map(
      function (_, _) {
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

// Replaces the HTML of the musical holder with either:
// The current musical, or
// All of the musicals
// Depending on settings
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

// Appends an album's song bank to the holder
function addAlbumToHolder(album) {
  const holder = document.getElementById("musical-holder");

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

// Pick a new valid line starter
// Sets all associated variables
// Also sets the HTML of the musical holder/stats panel
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

  const line = albumsInRotation[musicalIndex].texts[songIndex].raw
    .slice(wordIndex, wordIndex + currentLength)
    .join(" ")
    .replaceAll("\n", "<br>");

  document.getElementById("musical-text").innerHTML = line;
  setMusicalHolder();
  showStats();
}

// Change the current line to be a continuation of the same line
// Changes the musical text HTML
function continueLine() {
  currentLength++;
  if (
    currentLength >= albumsInRotation[musicalIndex].texts[songIndex].raw.length
  ) {
    // If they somehow guess all things and haven't gotten it,
    // give them a warning and something new
    alert("Bruh");
    pickNewLine();
  }

  const line = albumsInRotation[musicalIndex].texts[songIndex].raw
    .slice(wordIndex, wordIndex + currentLength)
    .join(" ")
    .replaceAll("\n", "<br>");

  document.getElementById("musical-text").innerHTML = line;
}

// Replaces the stats HTML with the current stats
function showStats() {
  const panel = document.getElementById("stats-panel");
  panel.innerHTML = "";

  const header = document.createElement("h1");
  header.innerHTML = "Stats";
  panel.appendChild(header);

  const [totalCorrect, totalLength] = stats.reduce(
    (acc, curr) => [acc[0] + curr[0], acc[1] + curr[1]],
    [0, 0],
  );

  const title = document.createElement("h2");
  title.innerHTML = "Total";
  panel.appendChild(title);

  const correct = document.createElement("p");
  correct.innerHTML = `Total correct: ${totalCorrect}`;
  panel.appendChild(correct);

  const average = document.createElement("p");
  const words =
    totalCorrect === 0 ? 0 : (totalLength / totalCorrect).toFixed(3);
  average.innerHTML = `Words per guess: ${words}`;
  panel.appendChild(average);

  for (let index = 0; index < albumsInRotation.length; index++) {
    panel.appendChild(document.createElement("hr"));
    const title = document.createElement("h2");
    title.innerHTML = albumsInRotation[index].name;
    panel.appendChild(title);

    const correct = document.createElement("p");
    correct.innerHTML = `Total correct: ${stats[index][0]}`;
    panel.appendChild(correct);

    const average = document.createElement("p");
    const words =
      stats[index][0] === 0
        ? 0
        : (stats[index][1] / stats[index][0]).toFixed(3);
    average.innerHTML = `Words per guess: ${words}`;
    panel.appendChild(average);
  }
}

// Queries the server for the given albums
// Also sets up settings, stats, and picks a new line
function setAlbums(names, lengths) {
  songStartLengths = lengths;
  Promise.all(
    names.map(async (name) => {
      return fetch(`album/${name}`).then((response) => {
        if (!response.ok) {
          throw new Error(`Response status: ${response.status}`);
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

// Set the global variables based on the settings HTML
function updateSettings() {
  const albums = [];
  const lengths = [];
  for (const child of document.getElementById("album-settings").children) {
    if (child.firstChild.checked) {
      albums.push(child.children[1].innerHTML);
      lengths.push(child.children[2].value);
    }
  }

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

// Set the settings HTML based on the global variables
function printSettings() {
  const container = document.getElementById("album-settings");
  container.innerHTML = "";

  const namesToNumbers = {};
  for (let i = 0; i < albumsInRotation.length; i++) {
    namesToNumbers[albumsInRotation[i].name] = songStartLengths[i];
  }

  for (const album of albumOptions) {
    const holder = document.createElement("div");
    holder.classList.add("musical-setting");

    const enable = document.createElement("input");
    enable.setAttribute("type", "checkbox");

    const title = document.createElement("span");
    title.innerHTML = album;

    const wordCount = document.createElement("input");
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

// Handles guessing, updating stats and picking a new line/continuing as needed
function makeGuess(guess) {
  if (guess === albumsInRotation[musicalIndex].texts[songIndex].name) {
    stats[musicalIndex][0] += 1;
    stats[musicalIndex][1] += currentLength;
    pickNewLine();
  } else {
    continueLine();
  }
}

// Set up the site with the defaults
// Changes globals and HTML
// TODO use most recently used settings
function setDefaults() {
  albumsWeighted = false;
  songsWeighted = false;
  giveMusical = true;
  setAlbums(["Hamilton"], [3]);
}

// Add event listeners to buttons which need it
function setUpButtons() {
  document.getElementById("reset-settings").addEventListener("click", () => {
    printSettings();
  });

  document.getElementById("apply-settings").addEventListener("click", () => {
    updateSettings();
  });

  document.getElementById("hide-settings").addEventListener("click", () => {
    document.getElementById("settings-panel").classList.toggle("hidden");
  });
}

setDefaults();
setUpButtons();
