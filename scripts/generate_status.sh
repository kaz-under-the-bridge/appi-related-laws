#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

CSV_OUT="docs/status.csv"
MD_OUT="docs/status.md"

# Gather candidate slugs from url_list.md and existing directories
collect_slugs() {
  {
    # Extract directory names from url_list.md
    if [[ -f "docs/url_list.md" ]]; then
      grep "^|" docs/url_list.md | grep -v "^| KB Status" | grep -v "^| ---" | while read -r line; do
        # Parse table row: | KB Status | Title | URL | Method | DirectoryName | Note |
        IFS='|' read -ra parts <<< "$line"
        if [[ ${#parts[@]} -ge 6 ]]; then
          dir_name=$(echo "${parts[5]}" | xargs)  # trim whitespace
          if [[ -n "$dir_name" && "$dir_name" != "ディレクトリ名" && "$dir_name" != "一般財団法人から入手" ]]; then
            echo "$dir_name"
          fi
        fi
      done
    fi
    # Also check existing directories
    if [[ -d ingested ]]; then ls -1 ingested; fi
    if [[ -d sources ]]; then ls -1 sources; fi
    if [[ -d summaries ]]; then ls -1 summaries | sed 's/\.md$//'; fi
    if [[ -d points ]]; then ls -1 points | sed 's/\.md$//'; fi
  } 2>/dev/null | grep -v '^$' | sort -u
}

exists_glob() {
  local pattern="$1"
  shopt -s nullglob
  local matches=( $pattern )
  shopt -u nullglob
  if (( ${#matches[@]} > 0 )); then
    return 0
  else
    return 1
  fi
}

# Detect skipped ingest (ingested/<slug>/data.json contains "skipped_reason" or url_list.md has skip method)
is_skipped() {
  local slug="$1"
  local jf="ingested/$slug/data.json"

  # Check if data.json contains skipped_reason
  if [[ -f "$jf" ]] && grep -q '"skipped_reason"' "$jf"; then
    return 0
  fi

  # Check if url_list.md has skip method for this slug
  if [[ -f "docs/url_list.md" ]]; then
    local found=0
    while read -r line; do
      IFS='|' read -ra parts <<< "$line"
      if [[ ${#parts[@]} -ge 6 ]]; then
        dir_name=$(echo "${parts[5]}" | xargs)
        method=$(echo "${parts[4]}" | xargs)
        if [[ "$dir_name" == "$slug" && "$method" == "skip" ]]; then
          found=1
          break
        fi
      fi
    done < <(grep "^|" docs/url_list.md | grep -v "^| KB Status" | grep -v "^| ---")

    if [[ $found -eq 1 ]]; then
      return 0
    fi
  fi

  return 1
}

mark() {
  if [[ "$1" == "1" ]]; then echo "◯"; else echo "×"; fi
}

# Map slugs to consulting control files when naming differs
consulting_file_for_slug() {
  local slug="$1"
  local candidate="consulting/controls-${slug}.md"
  if [[ -f "$candidate" ]]; then
    echo "$candidate"; return 0
  fi
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

main() {
  mkdir -p docs

  # CSV header
  echo "slug,source,ingested,summary,points,consulting" > "$CSV_OUT"

  # MD header
  {
    echo "| slug | source | ingested | summary | points | consulting |"
    echo "| --- | --- | --- | --- | --- | --- |"
  } > "$MD_OUT"

  collect_slugs | while read -r slug; do
    [[ -z "$slug" ]] && continue

    # source step: content.* or metadata.md exists
    src_ok=0
    if [[ -f "sources/$slug/metadata.md" ]]; then src_ok=1; else
      if exists_glob "sources/$slug/content.*"; then src_ok=1; fi
    fi

    # ingested step
    ing_ok=0
    if [[ -f "ingested/$slug/data.json" ]]; then ing_ok=1; fi

    # summary step
    sum_ok=0
    if [[ -f "summaries/$slug.md" ]]; then sum_ok=1; fi

    # points step
    pts_ok=0
    if [[ -f "points/$slug.md" ]]; then pts_ok=1; fi

    # consulting step
    con_ok=0
    cf="$(consulting_file_for_slug "$slug")"
    if [[ -n "$cf" && -f "$cf" ]]; then con_ok=1; fi

    # Symbols
    if is_skipped "$slug"; then
      src_sym="-"
      ing_sym="-"
      sum_sym="-"
      pts_sym="-"
      con_sym="-"
    else
      src_sym="$(mark $src_ok)"
      ing_sym="$(mark $ing_ok)"
      sum_sym="$(mark $sum_ok)"
      pts_sym="$(mark $pts_ok)"
      con_sym="$(mark $con_ok)"
    fi

    # Emit CSV
    echo "$slug,$src_sym,$ing_sym,$sum_sym,$pts_sym,$con_sym" >> "$CSV_OUT"

    # Emit Markdown
    echo "| $slug | $src_sym | $ing_sym | $sum_sym | $pts_sym | $con_sym |" >> "$MD_OUT"
  done
}

main "$@"
