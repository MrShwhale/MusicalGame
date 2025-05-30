import re
from collections.abc import Callable
from typing import Dict, Union


# Describes a single text for the purposes of an Album
class Text:
    def __init__(self, name: str, raw: list[str], filtered: list[str]) -> None:
        self.raw = raw
        self.filtered = filtered
        self.name = name


# Describes a set of texts to work off of
class Album:
    def __init__(self, name: str):
        self.album_name = name

        # TEXT INFORMATION
        # A set of characters which have lines in the album
        self.characters = set()
        # A list of Texts which represent the album
        self.texts: list[Text] = []

        # A dict of text names to indices in the texts list
        self._index_dict: Dict[str, int] = {}

        # TEXT SPLITTING
        # A dict mapping n to a tuple in song order of tuples which are indices containing n-grams in that song
        self.n_gram_dict: Dict[int, tuple[tuple[int, ...], ...]] = {}

    # Load the text in to the maps/lists
    # :param files: a list of file paths from this location to files containing the texts
    # :param char_regex: a regex matching the FULL LINE of a character, with the "name" group matching the name of the character
    # :param title_regex: a regex matching the FULL LINE of a title, with the "title" group matching the title
    # :param char_filter: a function which determines which characters to remove for the filtered texts
    # :param placeholder_char: the name to use for lines spoken before a character is listed
    def load_text(
        self,
        files: Union[str, list[str]],
        char_regex: Union[re.Pattern, str],
        title_regex: Union[re.Pattern, str],
        char_filter: Callable[[str], bool] = lambda n: not n.isalnum(),
        placeholder_char: str = "NOCHARACTER",
    ):
        if isinstance(files, str):
            files = [files]

        if isinstance(char_regex, str):
            char_regex = re.compile(char_regex)

        if isinstance(title_regex, str):
            title_regex = re.compile(title_regex)

        song_ind = -1
        for file in files:
            with open(file) as f:
                current_char = placeholder_char
                for line in f:
                    if line.isspace():
                        continue
                    # print([c for c in line])
                    # print(line)
                    # This is a song title then start counting as a new song
                    title_match = title_regex.fullmatch(line)
                    if title_match is not None:
                        # print(title_match.groups())
                        name = title_match.groupdict().get("name")
                        # Use capture group 1 as a fallback
                        if name is None and len(title_match.groups()) > 0:
                            name = title_match.group(1)
                        # Use the line as a double fallback
                        if name is None:
                            name = line
                        # print(f"title: {name}");
                        song_ind += 1
                        self._index_dict[name] = song_ind
                        self.texts.append(Text(name, [], []))
                        continue

                    char_match = char_regex.fullmatch(line)
                    if char_match is not None:
                        name = char_match.groupdict().get("name")
                        # Use capture group 1 as a fallback
                        if name is None and len(char_match.groups()) > 1:
                            name = char_match.group(1)
                        # Use the line as a double fallback
                        if name is None:
                            name = placeholder_char

                        self.characters.add(name)
                        current_char = name
                        continue

                    # Split line by whitespace
                    split_line = line.split()
                    # Add a newline to the final word so we know when the line ends
                    split_line[-1] += "\n"
                    # Create the filtered version of the line
                    line = [
                        "".join([s.lower() for s in word if not char_filter(s)])
                        for word in split_line
                    ]
                    try:
                        self.texts[-1].filtered += line
                    except IndexError:
                        print("All lines must be within a text!")
                        return

                    self.texts[-1].raw += split_line

    # Save a list of unique n-grams
    def find_unique_ngrams(self, n: int):
        # Map of ngrams to (index of first word, text index, is unique?)
        uniques = {}
        for text_index, text in enumerate(self.texts):
            for word_ind in range(len(text.raw) - n + 1):
                triple = tuple(text.filtered[word_ind : word_ind + n])
                if triple not in uniques:
                    uniques[triple] = (word_ind, text_index, True)
                else:
                    uniques[triple] = (word_ind, text_index, False)

        # Maps texts to sets of their indices
        text_list: list[set[int]] = [set() for _ in self.texts]
        # Now we go through and only add uniques
        for triple in uniques.values():
            if triple[2]:
                # Add this to the list
                text_list[triple[1]].add(triple[0])
        # Convert the list of sets into a tuple of tuples, which is hashable
        # This will make everyone's life easier, and since you only access ngrams randomly it will be fine
        self.n_gram_dict[n] = tuple(tuple(s) for s in text_list)

    def song_count(self):
        return len(self.texts)
