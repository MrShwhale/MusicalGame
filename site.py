import json

from flask import Flask, render_template, request

from album import Album
from game import Game

# TODO shipping with this as a global will kill you in real life
# Please make it user-dependent...
# A little, at least
musicals = []

app = Flask(__name__)

hamilton = Album("HAMILTON")
hamilton.load_text("./lyrics/hamilton_lyrics.txt", r"\[(.+)\]\n", r"\?== (.+)\n")

epic = Album("EPIC")
epic.load_text("./lyrics/epic_lyrics.txt", r"\[(.+)\]\n", r"\?== (.+)\n")

six = Album("SIX")
six.load_text("./lyrics/six_lyrics.txt", r"\[(.+)\]\n", r"\?== (.+)\n")

heathers = Album("HEATHERS")
heathers.load_text("./lyrics/heathers.txt", r"\[(.+)\]\n", r"\?== (.+)\n")

mad_ones = Album("THE MAD ONES")
mad_ones.load_text("./lyrics/mad_ones.txt", r"\[(.+)\]\n", r"\?== (.+)\n")

# game = Game([six, heathers, hamilton, epic], [3, 4, 3, 5])
game = Game([mad_ones], [3], equalize_songs=True)


@app.route("/")
def start():
    return render_template("main.html")


# Should return:
# The name of the current song
# And a new line/musical
@app.route("/api/give_up")
def give_up():
    old_name = game.current_song.name
    game.new_song()
    body = {
        "old_name": old_name,
        "line": game.get_current_line(),
        "musical": game.current_album.album_name,
        "songs": game.get_song_names(),
    }
    return json.dumps(body)


# Should return either:
# Success, and a new line/musical (including songlist)
# Failure, and a continuation of the old line
@app.route("/api/line")
def next_line():
    guess = request.args.get("guess")

    if guess is not None:
        print(guess)
        result = game.validate_guess(guess)
        if result:
            game.new_song()
            game.get_averages_by_musical()
        else:
            game.get_more_line()
        body = {
            "result": result,
            "line": game.get_current_line(),
            "musical": game.current_album.album_name,
            "songs": game.get_song_names(),
        }
    else:
        body = {
            "line": game.get_current_line(),
            "musical": game.current_album.album_name,
            "songs": game.get_song_names(),
        }

    return json.dumps(body)


if __name__ == "__main__":
    app.run(debug=True)
