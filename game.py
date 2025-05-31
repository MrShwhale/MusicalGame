import random

from album import Album


# A game has a collection of albums
class Game:
    # TODO add stats tracking
    def __init__(
        self,
        albums: list[Album],
        start_lengths: list[int],
        equalize_musicals: bool = True,
        equalize_songs: bool = False,
    ) -> None:
        self.albums = albums
        self.start_lengths = start_lengths

        # Equalize musicals based on song count
        # If this is False, all musicals have an equal chance of being chosen
        # Otherwise, longer musicals will be chosen more often
        self.equalize_musicals = equalize_musicals
        # Equalize songs within a musical by length
        # If this is False, all songs have an equal chance of being chosen
        # Otherwise, longer songs will be chosen more often
        self.equalize_songs = equalize_songs

        # List by musical of [total words given, songs received]
        self.album_stats: list[list[int]] = [[0, 0] for _ in albums]

        for album, length in zip(self.albums, self.start_lengths):
            album.find_unique_ngrams(length)

        # self.current_album: the album which the current song is in
        # self.current_song: a Text from one of the above Albums
        # self.word_index: the (usually unique) index to start from in the text
        # self.current_length: an int which represents how many words from the index to show
        self.new_song()

    def new_song(self):
        if self.equalize_musicals:
            # Weighted based on song count
            self.musical_index = random.choices(
                [x for x in range(len(self.albums))],
                weights=[m.song_count() for m in self.albums],
                k=1,
            )[0]
        else:
            self.musical_index = random.randint(0, len(self.albums) - 1)

        self.current_album = self.albums[self.musical_index]

        # Then, pick a random song from that musical
        start_len = self.start_lengths[self.musical_index]
        if self.equalize_songs:
            # Weighted based on triple count
            song_index = random.choices(
                [x for x in range(len(self.current_album.texts))],
                weights=[
                    len(self.current_album.n_gram_dict[start_len][i])
                    for i in range(len(self.current_album.texts))
                ],
                k=1,
            )[0]
        else:
            song_index = random.randint(0, len(self.current_album.texts) - 1)

        # Then, pick an index
        self.current_song = self.current_album.texts[song_index]
        self.word_index = random.choice(
            self.current_album.n_gram_dict[start_len][song_index]
        )
        self.current_length = start_len
        self.album_stats[self.musical_index][0] += start_len
        self.album_stats[self.musical_index][1] += 1

    # Returns a continuation of the current raw line
    def get_more_line(self):
        # BUG this will break if the WHOLE SONG is listed
        # I'm not fixing that; those people should be stopped
        if self.word_index + self.current_length == len(self.current_song.filtered):
            self.word_index -= 1
        self.current_length += 1
        self.album_stats[self.musical_index][0] += 1

    # Returns the current raw line
    def get_current_line(self) -> str:
        output = ""
        line = self.current_song.raw[
            self.word_index : self.word_index + self.current_length
        ]
        for word in line:
            if word.endswith("\n"):
                output += word
            else:
                output += word + " "
        # Cut off last added space
        return output[:-1]

    def validate_guess(self, guess: str) -> bool:
        return guess.lower() == self.current_song.name.lower()

    def get_song_names(self):
        return [text.name for text in self.current_album.texts]

    def get_all_song_names(self):
        return [
            (album.album_name, [text.name for text in self.current_album.texts])
            for album in self.albums
        ]

    def get_averages_by_musical(self):
        print("Average by musical:")
        for i in range(len(self.albums)):
            print(self.albums[self.musical_index].album_name, end=": ")
            stats = self.album_stats[i]
            print(stats[0] / max(stats[1], 0))

    def get_toal_average(self):
        pass


if __name__ == "__main__":
    hamilton = Album("Hamilton")

    hamilton.load_text("./lyrics/six_lyrics.txt", r"\[(.+)\]\n", r"\?== (.+)\n")

    game = Game([hamilton], [3])

    while True:
        # Get a new song
        game.new_song()
        while True:
            print(game.get_current_line())
            guess = input("Enter your guess: ")
            if guess == "names":
                col_width = 130
                current_printed = 0
                for name in game.get_song_names():
                    if current_printed + len(name) > col_width:
                        current_printed = len(name)
                        print(name, end="")
                        print()
                        continue
                    current_printed += len(name) + 3
                    print(name + " | ", end="")
                print()
            if game.validate_guess(guess):
                break
            else:
                game.get_more_line()
        print("NEXT")
