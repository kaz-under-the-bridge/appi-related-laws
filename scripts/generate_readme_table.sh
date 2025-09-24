#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

URL_LIST="docs/url_list.md"
STATUS="docs/status.csv"
OUT="docs/readme_table.md"

consulting_file_for_slug() {
  local slug="$1"
  local candidate="consulting/controls-${slug}.md"
  if [[ -f "$candidate" ]]; then echo "$candidate"; return; fi
  case "$slug" in
    appi-law) echo "consulting/controls-appi.md";;
    ppc-policy) echo "consulting/controls-ppc-policy.md";;
    ppc-3rdparty) echo "consulting/controls-ppc-3rdparty.md";;
    ppc-offshore) echo "consulting/controls-ppc-offshore.md";;
    ppc-anonymous) echo "consulting/controls-ppc-anonymous.md";;
    ppc-health) echo "consulting/controls-ppc-health.md";;
    ppc-mynumber-biz) echo "consulting/controls-mynumber-biz.md";;
    *) echo "";;
  esac
}

fmt_cell() {
  local status="$1"; shift || true
  local path="${1:-}"
  case "$status" in
    "◯") if [[ -n "$path" ]]; then echo "[◯]($path)"; else echo "◯"; fi ;;
    "-") echo "ー" ;;
    *) echo "×" ;;
  esac
}

# Build associative arrays from status.csv
# slug -> ing, sum, pts, con
declare -A ST_ING ST_SUM ST_PTS ST_CON
while IFS=, read -r slug src ing sum pts con; do
  [[ "$slug" == "slug" ]] && continue
  ST_ING["$slug"]="$ing"
  ST_SUM["$slug"]="$sum"
  ST_PTS["$slug"]="$pts"
  ST_CON["$slug"]="$con"
done < "$STATUS"

{
  echo "| 項目 | ディレクトリ名 | Ingested | Summaries | Points | Consulting |"
  echo "| --- | --- | --- | --- | --- | --- |"

  # Parse url_list.md table rows (skip header + separator)
  grep '^|' "$URL_LIST" | tail -n +3 | while IFS='|' read -r _ col_status col_title col_url col_method col_dir col_note _rest; do
    title="$(echo "$col_title" | sed 's/^ *//; s/ *$//')"
    url="$(echo "$col_url" | sed 's/^ *//; s/ *$//')"
    method="$(echo "$col_method" | sed 's/^ *//; s/ *$//')"
    slug="$(echo "$col_dir" | sed 's/^ *//; s/ *$//')"
    [[ -z "$slug" || "$title" == "" || "$title" == "項目" ]] && continue

    if [[ "$method" == "skip" ]]; then
      ing_sym="-"; sum_sym="-"; pts_sym="-"; con_sym="-"
    else
      ing_sym="${ST_ING[$slug]:-×}"
      sum_sym="${ST_SUM[$slug]:-×}"
      pts_sym="${ST_PTS[$slug]:-×}"
      con_sym="${ST_CON[$slug]:-×}"
    fi

    ing_path="ingested/$slug/"
    sum_path="summaries/$slug.md"
    pts_path="points/$slug.md"
    con_path="$(consulting_file_for_slug "$slug")"

    # Format cells
    if [[ -n "$url" ]]; then
      cell_title="[$title]($url)"
    else
      cell_title="$title"
    fi
    cell_ing="$(fmt_cell "$ing_sym" "$ing_path")"
    cell_sum="$(fmt_cell "$sum_sym" "$sum_path")"
    cell_pts="$(fmt_cell "$pts_sym" "$pts_path")"
    cell_con="$(fmt_cell "$con_sym" "$con_path")"

    echo "| $cell_title | \`$slug\` | $cell_ing | $cell_sum | $cell_pts | $cell_con |"
  done
} > "$OUT"

echo "Generated $OUT" >&2
