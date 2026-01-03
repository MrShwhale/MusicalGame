# Lyrics Disclaimer
I do not own the rights to any of the lyrics involved in this project.

# Adding/updating Albums
1. Add the lyrics file to the "albums" folder. Song names should be on lines starting with `?== ` followed by the name.
Character names should be on lines formatted as such`[<name>]`.
2. Add the user-facing "title" of the musical to the `titles` array. Then, add the name of the lyrics file to the `files` array, at the same index.
3. Run `pnpm gen`. Make sure it succeeds, and you can check "songs.js" if you wish to confirm (this file will be large, though).
4. Add the musical header to `public/assets`. It should be named as it appears in the `titles` array, with any non-word characters (\W) being removed.
