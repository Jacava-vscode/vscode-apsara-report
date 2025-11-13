How to add Khmer font files for Apsara Report

This folder should contain the font files you want to self-host for Khmer UI and print output.

Recommended filenames (used by the CSS @font-face rules):
- KhBattambang.woff2 (or .woff)
- KhBokor.woff2 (or .woff)
- KhWrithand.woff2 (or .woff)
- KhmerS4.woff2 (or .woff)
- KhmerSBBICSerif.woff2 (or .woff)

Instructions:
1. Copy the .woff2 (preferred) or .woff files into this folder using one of the names above.
2. If you have other formats (TTF/OTF), you can convert to WOFF2 for best web performance, or include them here and update the @font-face src rules.
3. Refresh the app (or open the `settings.html` page) and choose the font from Settings → Fonts.

Notes:
- If a requested font file isn't present, the browser will fall back to the Google Fonts import (for Battambang/Bokor) or to system fonts.
- If you want me to copy the files from a specific path on your machine into this folder, either move them into the repo workspace yourself or provide the exact files here and I will add them.
