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
2. Add the user-facing title and lyrics filename to `albumSources` in `public/script/albums.js`.
3. The site fetches and parses the lyric files in the browser when it is opened.
4. Add the musical header to `public/assets`. It should be named as it appears in `albumSources`, with any non-word characters (\W) being removed.

# GitHub Pages
The site is deployed automatically by `.github/workflows/pages.yml` whenever changes are pushed to `main`.

In the repository's GitHub settings, open **Pages** and set **Source** to **GitHub Actions**. The workflow publishes `public/` together with `albums/`, so the browser can load the lyric files at runtime.

# Improvements
1. Restyle
2. Timed mode
3. API-based generation
4. Sound-based mode
5. Character mode

## Banners to add
Hazbin 1
Hazbin 2
Spongebob
Helluva 1
Helluva 2
Showman

CHECK YOUR NOTES AGAIN
