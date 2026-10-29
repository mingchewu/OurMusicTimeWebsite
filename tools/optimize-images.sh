#!/bin/zsh
# Builds web-sized copies of every image in media/ into media/web/ (large)
# and media/web/sm/ (thumbnails). Originals are never modified.
#
#   zsh tools/optimize-images.sh
#
# Output names: lowercase, spaces -> dashes, ".jpg" (or ".png" when the
# source has transparency). Re-run after adding photos; existing outputs
# are skipped unless the source is newer. Requires macOS `sips`.

set -e
setopt extendedglob
cd "${0:A:h}/.."

LARGE=1800
SMALL=760
QUALITY=78

find media -type f \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' \) \
  -not -path 'media/web/*' | while read -r src; do
  rel="${src#media/}"
  base="${rel:r}"
  base="${${base// /-}:l}"
  alpha=$(sips -g hasAlpha "$src" 2>/dev/null | awk '/hasAlpha/{print $2}')
  if [[ "$alpha" == "yes" ]]; then ext=png; fmt=png; else ext=jpg; fmt=jpeg; fi
  # An opaque PNG beside a JPEG of the same name would overwrite it
  twins=( "${src:r}".(#i)(jpg|jpeg)(N) )
  if [[ "$ext" == jpg && "${src:e:l}" == png && ${#twins} -gt 0 ]]; then
    base="$base-png"
  fi

  for size dir in $LARGE media/web $SMALL media/web/sm; do
    out="$dir/$base.$ext"
    [[ -f "$out" && "$out" -nt "$src" ]] && continue
    mkdir -p "${out:h}"
    sips -Z $size -s format $fmt -s formatOptions $QUALITY "$src" --out "$out" >/dev/null
    echo "→ $out"
  done
done
