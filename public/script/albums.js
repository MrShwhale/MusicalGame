const albumSources = [
  ["Epic", "epic"],
  ["Hamilton", "hamilton"],
  ["Heathers", "heathers"],
  ["The Mad Ones", "mad_ones"],
  ["Six", "six"],
  ["Hazbin Hotel Season 1", "hazbin1"],
  ["Hazbin Hotel Season 2", "hazbin2"],
  ["Spongebob The Musical", "sponge"],
  ["Helluva Boss Season 1", "helluva1"],
  ["Helluva Boss Season 2", "helluva2"],
  ["Operation Mincemeat", "mincemeat"],
  ["The Greatest Showman", "greatest"],
];

const characterLine = /^\[(.+)\]$/;
const songTitle = /^\?== (.+)$/;
const filteredCharacters = /[^a-zA-Z0-9]/g;

function parseAlbum(source, title) {
  const texts = [];

  for (const line of source.split("\n")) {
    if (line.trim().length === 0) {
      continue;
    }

    const titleMatch = line.match(songTitle);
    if (titleMatch) {
      texts.push({ name: titleMatch[1], filtered: [], raw: [] });
      continue;
    }

    if (characterLine.test(line)) {
      continue;
    }

    const splitLine = line.split(/\s/).filter((word) => word.length > 0);
    splitLine[splitLine.length - 1] += "\n";
    const filteredLine = splitLine
      .map((word) => word.trim().toLowerCase().replaceAll(filteredCharacters, ""))
      .filter((word) => word.length > 0);

    texts[texts.length - 1].filtered.push(...filteredLine);
    texts[texts.length - 1].raw.push(...splitLine);
  }

  return { name: title, texts };
}

async function loadAlbums() {
  const loadedAlbums = await Promise.all(
    albumSources.map(async ([title, filename]) => {
      const response = await fetch(`albums/${filename}`);
      if (!response.ok) {
        throw new Error(`Could not load ${filename}: ${response.status}`);
      }
      return parseAlbum(await response.text(), title);
    }),
  );

  return Object.fromEntries(loadedAlbums.map((album) => [album.name, album]));
}
