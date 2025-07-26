// Start the server, and load the text files in the way they should look
// Importing express module
const express = require("express");
const app = express();
const path = require("node:path");
const fs = require("node:fs");

let CHAR_REGEX = /^\[(.+)\]$/;
let TITLE_REGEX = /^\?== (.+)$/;
let WHITESPACE_REGEX = /\s/;
let FILTERED_REGEX = /[^a-zA-Z0-9]/g;

const lyricSets = {};
const titles = [
  "Epic",
  "Hamilton",
  "Heathers",
  "The Mad Ones",
  "The Phantom of the Opera",
  "Six",
];

function setUpLyricSet(fd, title) {
  const lyrics = fs.readFileSync(fd, "utf8");
  let album = {
    name: title,
  };

  let texts = [];

  for (const line of lyrics.split("\n")) {
    if (line.trim().length === 0) {
      continue;
    }

    if (TITLE_REGEX.test(line)) {
      let name = line.match(TITLE_REGEX)[1];
      texts.push({ name: name, filtered: [], raw: [] });
      continue;
    }

    // maybe you'll add something here, but you haven't right now
    if (CHAR_REGEX.test(line)) {
      // let name = line.match(CHAR_REGEX)[1];
      continue;
    }

    let splitLine = line
      .split(WHITESPACE_REGEX)
      .filter((word) => word.length > 0);
    splitLine[splitLine.length - 1] += "\n";
    let filteredLine = splitLine
      .map((word) => word.trim().toLowerCase().replaceAll(FILTERED_REGEX, ""))
      .filter((word) => word.length > 0);
    texts[texts.length - 1].filtered =
      texts[texts.length - 1].filtered.concat(filteredLine);
    texts[texts.length - 1].raw = texts[texts.length - 1].raw.concat(splitLine);
  }
  album.texts = texts;
  return album;
}

app.get("/", (req, res, next) => {
  res.sendFile("/game.html", { root: __dirname });
});

app.get("/album/:albumName", (req, res, next) => {
  let name = req.params.albumName;
  if (lyricSets[name]) {
    res.json(lyricSets[name]);
  } else {
    res.json({ error: "ALBUM_NOT_FOUND" });
  }
});

if (process.env.NODE_ENV === "development") {
  const hmr = require("express.js-hmr");
  app.use(hmr());
}

app.use(express.static("public"));

app.listen(3000, () => {
  const files = [
    "epic",
    "hamilton",
    "heathers",
    "mad_ones",
    "phantom_of_the_opera",
    "six",
  ];
  const dir = "public/albums";
  for (const [index, file] of files.entries()) {
    lyricSets[titles[index]] = setUpLyricSet(
      path.join(dir, file),
      titles[index],
    );
  }

  console.log("Server is Running");
});

// Minimize stats and settings on the left and right of the page
