#!/usr/bin/env python3
"""
Parse MIDI files and output note data for chart generation.
Usage: python3 tools/parse-midi.py <midi-file> [--json]
"""
import struct
import sys
import json
import os


def read_vlq(data: bytes, pos: int) -> tuple[int, int]:
    val = 0
    while True:
        b = data[pos]
        pos += 1
        val = (val << 7) | (b & 0x7F)
        if not (b & 0x80):
            break
    return val, pos


def parse_midi(path: str) -> dict:
    with open(path, 'rb') as f:
        data = f.read()

    if data[:4] != b'MThd':
        raise ValueError('Not a MIDI file')

    hlen = struct.unpack('>I', data[4:8])[0]
    fmt = struct.unpack('>H', data[8:10])[0]
    ntrk = struct.unpack('>H', data[10:12])[0]
    division = struct.unpack('>H', data[12:14])[0]

    pos = 8 + hlen
    tracks = []

    for _ in range(ntrk):
        if pos >= len(data) or data[pos:pos+4] != b'MTrk':
            break
        tlen = struct.unpack('>I', data[pos+4:pos+8])[0]
        track_data = data[pos+8:pos+8+tlen]

        i = 0
        current_tick = 0
        tempo = 500000  # default 120 BPM
        notes_on: dict[tuple[int, int], int] = {}  # (note, channel) -> start_tick
        events = []
        last_status = 0

        while i < len(track_data):
            delta, i = read_vlq(track_data, i)
            current_tick += delta

            if i >= len(track_data):
                break

            status = track_data[i]

            if status == 0xFF:  # meta event
                i += 1
                meta_type = track_data[i]; i += 1
                meta_len, i = read_vlq(track_data, i)
                if meta_type == 0x51 and meta_len == 3:
                    tempo = int.from_bytes(track_data[i:i+3], 'big')
                    events.append({'type': 'tempo', 'tick': current_tick, 'tempo': tempo, 'bpm': round(60000000 / tempo, 2)})
                i += meta_len

            elif status in (0xF0, 0xF7):  # sysex
                i += 1
                slen, i = read_vlq(track_data, i)
                i += slen

            else:
                if status & 0x80:
                    last_status = status
                    i += 1
                else:
                    status = last_status  # running status

                event_type = (status >> 4) & 0xF
                channel = status & 0xF

                if event_type == 0x9:  # note on
                    note = track_data[i]; i += 1
                    vel = track_data[i]; i += 1
                    if vel > 0:
                        notes_on[(note, channel)] = current_tick
                    else:  # vel=0 treated as note off
                        start = notes_on.pop((note, channel), current_tick)
                        events.append({'type': 'note', 'tick': start, 'duration_ticks': current_tick - start,
                                       'note': note, 'channel': channel, 'velocity': vel})
                elif event_type == 0x8:  # note off
                    note = track_data[i]; i += 1
                    vel = track_data[i]; i += 1
                    start = notes_on.pop((note, channel), current_tick)
                    events.append({'type': 'note', 'tick': start, 'duration_ticks': current_tick - start,
                                   'note': note, 'channel': channel, 'velocity': vel})
                elif event_type in (0xA, 0xB, 0xE):
                    i += 2
                elif event_type in (0xC, 0xD):
                    i += 1
                else:
                    i += 1

        notes = [e for e in events if e['type'] == 'note']
        notes.sort(key=lambda n: n['tick'])
        tracks.append({'notes': notes, 'tempo_events': [e for e in events if e['type'] == 'tempo']})

        pos += 8 + tlen

    # Convert ticks to seconds using first tempo (assumes constant tempo for simplicity)
    first_tempo = 500000
    for track in tracks:
        if track['tempo_events']:
            first_tempo = track['tempo_events'][0]['tempo']
            break

    ticks_per_second = (1_000_000 / first_tempo) * division
    bpm = round(60_000_000 / first_tempo, 2)

    for track in tracks:
        for note in track['notes']:
            note['time_s'] = round(note['tick'] / ticks_per_second, 4)
            note['duration_s'] = round(note['duration_ticks'] / ticks_per_second, 4)

    channels_used = set()
    for track in tracks:
        for note in track['notes']:
            channels_used.add(note['channel'])

    return {
        'format': fmt,
        'tracks': ntrk,
        'division': division,
        'bpm': bpm,
        'channels': sorted(channels_used),
        'track_data': tracks,
    }


def summarize(path: str) -> None:
    result = parse_midi(path)
    print(f"File: {os.path.basename(path)}")
    print(f"  Format: {result['format']}, Tracks: {result['tracks']}, Division: {result['division']}")
    print(f"  BPM: {result['bpm']}, Channels used: {result['channels']}")
    for i, track in enumerate(result['track_data']):
        notes = track['notes']
        if not notes:
            continue
        channels = sorted(set(n['channel'] for n in notes))
        print(f"  Track {i}: {len(notes)} notes, channels {channels}")
        print(f"    First 5: {[(n['note'], round(n['time_s'],2), n['channel']) for n in notes[:5]]}")
        if notes:
            last = notes[-1]
            print(f"    Last note at: {last['time_s']}s (tick {last['tick']}), total duration ~{round(last['time_s'] + last['duration_s'], 2)}s")


if __name__ == '__main__':
    args = sys.argv[1:]
    as_json = '--json' in args
    files = [a for a in args if not a.startswith('--')]

    if not files:
        midi_dir = os.path.join(os.path.dirname(__file__), '..', 'src', 'contents', 'assets', 'midi')
        files = [os.path.join(midi_dir, f) for f in sorted(os.listdir(midi_dir)) if f.endswith('.mid')]

    for path in files:
        if as_json:
            print(json.dumps(parse_midi(path), indent=2))
        else:
            summarize(path)
            print()
