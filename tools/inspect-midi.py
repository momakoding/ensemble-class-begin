#!/usr/bin/env python3
"""
Inspect all notes in a MIDI file.
Usage: python3 tools/inspect-midi.py <midi-file> [--limit N] [--track N]
"""
import sys
import os

import importlib.util
_spec = importlib.util.spec_from_file_location('parse_midi', os.path.join(os.path.dirname(__file__), 'parse-midi.py'))
pm = importlib.util.module_from_spec(_spec)  # type: ignore
_spec.loader.exec_module(pm)  # type: ignore


def main() -> None:
    args = sys.argv[1:]
    limit = 9999
    track_idx = None
    files = []

    i = 0
    while i < len(args):
        if args[i] == '--limit' and i + 1 < len(args):
            limit = int(args[i + 1]); i += 2
        elif args[i] == '--track' and i + 1 < len(args):
            track_idx = int(args[i + 1]); i += 2
        else:
            files.append(args[i]); i += 1

    if not files:
        midi_dir = os.path.join(os.path.dirname(__file__), '..', 'src', 'contents', 'assets', 'midi')
        files = [os.path.join(midi_dir, f) for f in sorted(os.listdir(midi_dir)) if f.endswith('.mid')]

    for path in files:
        result = pm.parse_midi(path)
        print(f"=== {os.path.basename(path)} | BPM={result['bpm']} ===")

        tracks = result['track_data']
        if track_idx is not None:
            tracks = [tracks[track_idx]] if track_idx < len(tracks) else []

        for ti, track in enumerate(tracks):
            notes = track['notes']
            if not notes:
                continue
            print(f"  Track {ti}: {len(notes)} notes")
            print(f"  {'pitch':>5}  {'time_s':>7}  {'dur_s':>6}  {'ch':>3}")
            for n in notes[:limit]:
                print(f"  {n['note']:>5}  {n['time_s']:>7.3f}  {n['duration_s']:>6.3f}  {n['channel']:>3}")
            if len(notes) > limit:
                print(f"  ... ({len(notes) - limit} more)")
        print()


if __name__ == '__main__':
    main()
