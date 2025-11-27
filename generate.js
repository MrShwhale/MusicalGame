// This code generates the songs.js file
const path = require("node:path");
const fs = require("node:fs");

let CHAR_REGEX = /^\[(.+)\]$/;
let TITLE_REGEX = /^\?== (.+)$/;
let WHITESPACE_REGEX = /\s/;
let FILTERED_REGEX = /[^a-zA-Z0-9]/g;

const lyricSets = {};
const titles = ["Epic", "Hamilton", "Heathers", "The Mad Ones", "Six", "Hazbin Hotel Season 1"];

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

    // Maybe you'll add something here, but you haven't right now
    if (CHAR_REGEX.test(line)) {
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

const files = ["epic", "hamilton", "heathers", "mad_ones", "six", "hazbin1"];
const dir = "./albums";
for (const [index, file] of files.entries()) {
  lyricSets[titles[index]] = setUpLyricSet(path.join(dir, file), titles[index]);
}

fs.writeFileSync(
  "./public/script/songs.js",
  `var albums=${JSON.stringify(lyricSets)}`,
);
