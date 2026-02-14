#!/usr/bin/env python3
"""
extract_sources.py — El Uno Chapter Source Extractor
=====================================================
Reads a chapter manifest JSON and extracts the relevant Ra sessions
and Q'uo passages into compact research files.

Usage:
    python3 extract_sources.py ch02_manifest.json --ra-dir /path/to/project

Inputs:
    - Chapter manifest (JSON) with session lists
    - Ra Contact volumes (markdown)
    - Q'uo archive volumes (markdown)

Outputs:
    - chXX_research_ra.md    (Ra sessions organized by chapter section)
    - chXX_research_quo.md   (Q'uo passages organized by theme)
    - chXX_sources_compact.md (combined, ready for Claude writing conversations)
"""

import json
import re
import sys
import os
from pathlib import Path
from collections import defaultdict


# ─── Ra Session Extractor ────────────────────────────────────────

def find_content_boundary(lines):
    """Find where actual session content ends (before photo gallery / index)."""
    for i in range(len(lines) - 1, -1, -1):
        if lines[i].strip().startswith("R A ") or lines[i].strip().startswith("QUESTIONER"):
            # Walk forward to find the end of this response
            for j in range(i + 1, min(i + 100, len(lines))):
                if re.match(r'^\*\*\d+\.\d+\*\*', lines[j]):
                    return j
            return i + 20  # safe margin
    return len(lines)


def is_real_session_line(line):
    """Distinguish real session markers from index references.
    Real: **13.5** QUESTIONER Thank you...
    Real: **1.0** R A I am Ra...
    Index: **13.5** 29.5-6 54.7
    """
    m = re.match(r'^\*\*(\d+\.\d+)\*\*\s+(.*)', line)
    if not m:
        return False, None
    ref = m.group(1)
    rest = m.group(2).strip()
    # Real sessions start with QUESTIONER, R A, or a capital letter question
    if rest.startswith("QUESTIONER") or rest.startswith("R A"):
        return True, ref
    # Index refs typically start with numbers (other session refs)
    if re.match(r'^\d+[\.\-]', rest):
        return False, ref
    # Might be a question starting with text — check if it's substantial
    if len(rest) > 20:
        return True, ref
    return False, ref


def parse_ra_volume(filepath):
    """Parse a Ra volume into a dict of session_ref -> text."""
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    boundary = find_content_boundary(lines)
    sessions = {}
    current_ref = None
    current_lines = []

    for i, line in enumerate(lines[:boundary]):
        is_real, ref = is_real_session_line(line)
        if is_real and ref:
            # Save previous session
            if current_ref:
                sessions[current_ref] = ''.join(current_lines).strip()
            current_ref = ref
            current_lines = [line]
        elif current_ref:
            current_lines.append(line)

    # Save last session
    if current_ref:
        sessions[current_ref] = ''.join(current_lines).strip()

    return sessions


def expand_session_list(session_refs):
    """Expand ranges like '13.5-13.13' and individual refs like '1.0'."""
    expanded = []
    for ref in session_refs:
        ref = ref.strip()
        if '-' in ref and '.' in ref.split('-')[1]:
            # Range: 13.5-13.13
            parts = ref.split('-')
            start_session, start_q = parts[0].split('.')
            _, end_q = parts[1].split('.')
            for q in range(int(start_q), int(end_q) + 1):
                expanded.append(f"{start_session}.{q}")
        else:
            expanded.append(ref)
    return expanded


def extract_ra_sessions(manifest, ra_volumes, all_sessions):
    """Extract Ra sessions listed in manifest from parsed volumes."""
    needed = set()
    for tier in ['primary', 'secondary', 'tertiary']:
        refs = manifest.get('ra_sessions', {}).get(tier, [])
        needed.update(expand_session_list(refs))

    results = {}
    missing = []
    for ref in sorted(needed, key=lambda x: (int(x.split('.')[0]), int(x.split('.')[1]))):
        if ref in all_sessions:
            results[ref] = all_sessions[ref]
        else:
            missing.append(ref)

    return results, missing


def organize_by_section(manifest, extracted_sessions):
    """Organize extracted sessions by chapter section using the mapping."""
    mapping = manifest.get('ra_section_mapping', {})
    organized = defaultdict(list)

    # Track which sessions are assigned
    assigned = set()

    for section_id, section_data in mapping.items():
        for tier in ['primary', 'secondary']:
            refs = expand_session_list(section_data.get(tier, []))
            for ref in refs:
                if ref in extracted_sessions:
                    organized[section_id].append({
                        'ref': ref,
                        'text': extracted_sessions[ref],
                        'tier': tier,
                    })
                    assigned.add(ref)

    # Unassigned sessions go to "unassigned"
    for ref, text in extracted_sessions.items():
        if ref not in assigned:
            organized['_unassigned'].append({
                'ref': ref,
                'text': text,
                'tier': 'tertiary',
            })

    return organized


# ─── Q'uo Session Extractor ──────────────────────────────────────

def parse_quo_volume(filepath):
    """Parse a Q'uo volume into dict of date -> text."""
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    sessions = {}
    current_date = None
    current_lines = []

    for line in lines:
        m = re.match(r'^### (.+)', line)
        if m:
            # Save previous
            if current_date:
                sessions[current_date] = ''.join(current_lines).strip()
            current_date = m.group(1).strip()
            current_lines = [line]
        elif current_date:
            current_lines.append(line)

    if current_date:
        sessions[current_date] = ''.join(current_lines).strip()

    return sessions


def search_quo_by_terms(quo_sessions, search_terms, max_results=10, min_terms=2, max_chars_per=3000):
    """Search Q'uo sessions for passages containing search terms.
    
    Ranks by relevance (number of matching terms + density).
    Requires min_terms to match to filter noise.
    Returns at most max_results sessions.
    """
    candidates = []
    for date, text in quo_sessions.items():
        text_lower = text.lower()
        matching_terms = [t for t in search_terms if t.lower() in text_lower]
        
        # Require minimum number of matching terms
        if len(matching_terms) < min_terms:
            continue

        # Extract relevant paragraphs
        paragraphs = text.split('\n\n')
        relevant = []
        for para in paragraphs:
            para_lower = para.lower()
            para_matches = sum(1 for t in search_terms if t.lower() in para_lower)
            if para_matches >= 1 and len(para.strip()) > 50:
                relevant.append((para_matches, para.strip()))

        if not relevant:
            continue

        # Sort paragraphs by relevance, take top ones
        relevant.sort(key=lambda x: x[0], reverse=True)
        top_paras = [p[1] for p in relevant[:8]]
        excerpt = '\n\n'.join(top_paras)
        if len(excerpt) > max_chars_per:
            excerpt = excerpt[:max_chars_per] + "\n[... truncated]"

        # Score: number of matching terms + bonus for specific terms
        specificity_bonus = sum(2 for t in matching_terms if len(t.split()) > 1)
        score = len(matching_terms) + specificity_bonus

        candidates.append({
            'date': date,
            'matching_terms': matching_terms,
            'excerpt': excerpt,
            'score': score,
        })

    # Sort by score descending, return top N
    candidates.sort(key=lambda x: x['score'], reverse=True)
    return candidates[:max_results]


def extract_quo_by_date(quo_sessions, dates, max_chars=6000):
    """Extract specific Q'uo sessions by date."""
    results = []
    for date in dates:
        for session_date, text in quo_sessions.items():
            if date.lower() in session_date.lower():
                if len(text) > max_chars:
                    text = text[:max_chars] + "\n\n[... truncated — full session in source volume]"
                results.append({
                    'date': session_date,
                    'text': text,
                })
    return results


# ─── Output Generators ───────────────────────────────────────────

def generate_ra_research(manifest, organized, missing):
    """Generate ch02_research_ra.md."""
    ch = manifest['chapter']
    lines = []
    lines.append(f"# Ra Research — Chapter {ch}: {manifest['title']}\n")
    lines.append(f"Generated by extract_sources.py from chapter manifest.\n\n")

    if missing:
        lines.append(f"## ⚠ Sessions not found: {', '.join(missing)}\n\n")

    sections = manifest.get('sections', [])
    section_ids = [s['id'] for s in sections]

    for section in sections:
        sid = section['id']
        if sid not in organized or not organized[sid]:
            lines.append(f"## {sid} — {section['title']}\n")
            lines.append(f"*No Ra sessions mapped to this section.*\n\n")
            continue

        lines.append(f"## {sid} — {section['title']}\n")
        notes = manifest.get('ra_section_mapping', {}).get(sid, {}).get('notes', '')
        if notes:
            lines.append(f"*{notes}*\n\n")

        for entry in organized[sid]:
            lines.append(f"### {entry['ref']} [{entry['tier']}]\n")
            lines.append(f"{entry['text']}\n\n")

    # Unassigned
    if '_unassigned' in organized and organized['_unassigned']:
        lines.append("## Unassigned Sessions\n")
        lines.append("*These sessions were extracted but not mapped to a specific section.*\n\n")
        for entry in organized['_unassigned']:
            lines.append(f"### {entry['ref']} [{entry['tier']}]\n")
            lines.append(f"{entry['text']}\n\n")

    return '\n'.join(lines)


def generate_quo_research(manifest, date_results, search_results):
    """Generate ch02_research_quo.md."""
    ch = manifest['chapter']
    lines = []
    lines.append(f"# Q'uo Research — Chapter {ch}: {manifest['title']}\n")
    lines.append("Q'uo is a complementary source for understanding Ra's teachings.\n")
    lines.append("Q'uo NEVER appears in the final text. This informs writing depth.\n\n")

    if date_results:
        lines.append("## Specific Sessions (by date)\n\n")
        for r in date_results:
            lines.append(f"### {r['date']}\n")
            # Limit to ~3000 chars per session
            text = r['text']
            if len(text) > 3000:
                text = text[:3000] + "\n[... truncated — full session available in source volume]"
            lines.append(f"{text}\n\n")

    if search_results:
        lines.append("## Thematic Passages (by search terms)\n\n")
        for r in search_results:
            terms_str = ', '.join(r['matching_terms'])
            lines.append(f"### {r['date']} — matches: {terms_str}\n")
            lines.append(f"{r['excerpt']}\n\n")

    return '\n'.join(lines)


def generate_compact_combined(manifest, ra_text, quo_text):
    """Generate a combined compact file with stats."""
    ch = manifest['chapter']
    lines = []
    lines.append(f"# Source Research — Chapter {ch}: {manifest['title']}\n")
    lines.append(f"Combined research file for writing conversations.\n\n")

    # Stats
    ra_words = len(ra_text.split())
    quo_words = len(quo_text.split())
    total_words = ra_words + quo_words
    total_tokens_est = int(total_words * 1.3)

    lines.append(f"## Stats\n")
    lines.append(f"- Ra research: ~{ra_words:,} words (~{int(ra_words * 1.3):,} tokens)\n")
    lines.append(f"- Q'uo research: ~{quo_words:,} words (~{int(quo_words * 1.3):,} tokens)\n")
    lines.append(f"- Total: ~{total_words:,} words (~{total_tokens_est:,} tokens)\n\n")

    lines.append("---\n\n")
    lines.append(ra_text)
    lines.append("\n---\n\n")
    lines.append(quo_text)

    return '\n'.join(lines)


# ─── Main ─────────────────────────────────────────────────────────

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 extract-sources.py <manifest.json> [options]")
        print("")
        print("Options:")
        print("  --sources-dir <path>  Directory containing Ra and Q'uo volume files")
        print("                        (default: ../sources relative to manifest)")
        print("  --chapter-dir <path>  Output directory for research files")
        print("                        (default: same directory as manifest)")
        sys.exit(1)

    manifest_path = sys.argv[1]
    manifest_dir = os.path.dirname(os.path.abspath(manifest_path))

    # Parse optional args
    sources_dir = None
    chapter_dir = None
    i = 2
    while i < len(sys.argv):
        if sys.argv[i] == '--sources-dir' and i + 1 < len(sys.argv):
            sources_dir = sys.argv[i + 1]
            i += 2
        elif sys.argv[i] == '--chapter-dir' and i + 1 < len(sys.argv):
            chapter_dir = sys.argv[i + 1]
            i += 2
        # Backwards compat
        elif sys.argv[i] == '--ra-dir' and i + 1 < len(sys.argv):
            sources_dir = sys.argv[i + 1]
            i += 2
        elif sys.argv[i] == '--output' and i + 1 < len(sys.argv):
            chapter_dir = sys.argv[i + 1]
            i += 2
        else:
            i += 1

    # Defaults: sources in workspace/sources/, chapter_dir = manifest's dir
    # From chapters/chNN/manifest.json, sources is at ../../sources
    if sources_dir is None:
        # Try ../../sources (standard layout: workspace/chapters/chNN/ → workspace/sources/)
        candidate = os.path.join(manifest_dir, '..', '..', 'sources')
        if os.path.isdir(candidate):
            sources_dir = candidate
        else:
            # Try ../sources (flat layout)
            candidate = os.path.join(manifest_dir, '..', 'sources')
            if os.path.isdir(candidate):
                sources_dir = candidate
            else:
                sources_dir = manifest_dir  # last resort
    if chapter_dir is None:
        chapter_dir = manifest_dir

    # Load manifest
    with open(manifest_path, 'r') as f:
        manifest = json.load(f)

    ch_num = manifest['chapter']
    ch_str = str(ch_num).zfill(2)
    print(f"[extract] Chapter {ch_num}: {manifest['title']}")
    print(f"[extract] Sources dir: {sources_dir}")
    print(f"[extract] Chapter dir: {chapter_dir}")

    # ─── Parse Ra volumes ───
    ra_vol1 = os.path.join(sources_dir, 'the_ra_contact_volume_1.md')
    ra_vol2 = os.path.join(sources_dir, 'the_ra_contact_volume_2.md')

    all_ra_sessions = {}
    for vol_path in [ra_vol1, ra_vol2]:
        if os.path.exists(vol_path):
            print(f"[extract] Parsing {os.path.basename(vol_path)}...")
            sessions = parse_ra_volume(vol_path)
            all_ra_sessions.update(sessions)
            print(f"  → {len(sessions)} sessions found")
        else:
            print(f"[warn] {vol_path} not found, skipping")

    # ─── Extract Ra sessions ───
    extracted, missing = extract_ra_sessions(manifest, None, all_ra_sessions)
    print(f"[extract] Ra sessions extracted: {len(extracted)}, missing: {len(missing)}")
    if missing:
        print(f"  → Missing: {', '.join(missing)}")

    organized = organize_by_section(manifest, extracted)

    ra_text = generate_ra_research(manifest, organized, missing)

    # ─── Parse Q'uo volumes ───
    quo_volumes = {
        'volume_09': os.path.join(sources_dir, 'll_research_archive_volume_09.md'),
        'volume_10': os.path.join(sources_dir, 'll_research_archive_volume_10.md'),
        'volume_11': os.path.join(sources_dir, 'll_research_archive_volume_11.md'),
    }

    all_quo_sessions = {}
    for vol_key, vol_path in quo_volumes.items():
        if os.path.exists(vol_path):
            print(f"[extract] Parsing {os.path.basename(vol_path)}...")
            sessions = parse_quo_volume(vol_path)
            all_quo_sessions.update(sessions)
            print(f"  → {len(sessions)} sessions found")

    # ─── Extract Q'uo sessions ───
    quo_config = manifest.get('quo_sessions', {})
    date_results = []
    search_results = []

    for vol_key, vol_data in quo_config.items():
        # By date
        dates = vol_data.get('dates', [])
        if dates:
            date_results.extend(extract_quo_by_date(all_quo_sessions, dates))

        # By search terms
        terms = vol_data.get('search_terms', [])
        if terms:
            min_t = vol_data.get('min_terms', 2)
            max_r = vol_data.get('max_results', 10)
            results = search_quo_by_terms(all_quo_sessions, terms,
                                          max_results=max_r, min_terms=min_t)
            search_results.extend(results)

    # Deduplicate Q'uo results by date
    seen_dates = set()
    deduped_search = []
    for r in search_results:
        if r['date'] not in seen_dates:
            # Also skip dates already covered by date_results
            if not any(d['date'] == r['date'] for d in date_results):
                deduped_search.append(r)
                seen_dates.add(r['date'])
    search_results = deduped_search

    print(f"[extract] Q'uo: {len(date_results)} date matches, {len(search_results)} term matches (deduped)")

    quo_text = generate_quo_research(manifest, date_results, search_results)

    # ─── Write outputs ───
    os.makedirs(chapter_dir, exist_ok=True)

    ra_path = os.path.join(chapter_dir, 'research-ra.md')
    with open(ra_path, 'w', encoding='utf-8') as f:
        f.write(ra_text)
    ra_size = os.path.getsize(ra_path)
    print(f"[output] {ra_path} ({ra_size:,} bytes)")

    quo_path = os.path.join(chapter_dir, 'research-quo.md')
    with open(quo_path, 'w', encoding='utf-8') as f:
        f.write(quo_text)
    quo_size = os.path.getsize(quo_path)
    print(f"[output] {quo_path} ({quo_size:,} bytes)")

    # ─── Summary ───
    total_bytes = ra_size + quo_size
    total_tokens_est = int(total_bytes / 4)  # rough bytes-to-tokens
    print(f"\n[summary]")
    print(f"  Ra:      {ra_size:>10,} bytes  (~{int(ra_size/4):,} tokens)")
    print(f"  Q'uo:    {quo_size:>10,} bytes  (~{int(quo_size/4):,} tokens)")
    print(f"  Total:   {total_bytes:>10,} bytes  (~{total_tokens_est:,} tokens)")
    print(f"  Compare: ~7,200,000 bytes for full volumes (~1,800,000 tokens)")
    print(f"  Reduction: {(1 - total_bytes/7200000)*100:.1f}%")


if __name__ == '__main__':
    main()
