# Lyrics Disclaimer
I do not own the rights to any of the lyrics involved in this project.

# Lyrics notes
Some lyrics have been changed for better consistency
## Hamilton
- Various lines changed to have more consistent spelling where needed.
## Hazbin Hotel Season 2
- Removed "Clean It Up!" since it would be too easy to guess most of the time.
## Helluva Boss
MANY changes were made to which songs were added for mostly length / visibility reasons.

# Adding/updating Albums
1. Add the lyrics file to the "albums" folder. Song names should be on lines starting with `?== ` followed by the name.
Character names should be on lines formatted as such`[<name>]`.
2. Add the user-facing "title" of the musical to the `titles` array. Then, add the name of the lyrics file to the `files` array, at the same index.
3. Run `pnpm gen`. Make sure it succeeds, and you can check "songs.js" if you wish to confirm (this file will be large, though).
4. Add the musical header to `public/assets`. It should be named as it appears in the `titles` array, with any non-word characters (\W) being removed.

# Improvements
1. Restyle
2. URL params for sharing
3. Timed mode
4. API-based generation
5. Sound-based mode
6. Character mode

CHECK YOUR NOTES AGAIN
