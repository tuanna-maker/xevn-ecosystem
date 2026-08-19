# -*- coding: utf-8 -*-
"""Render Mermaid sequenceDiagram blocks to PNG via Pillow (no mermaid-cli).

Layout rules (client PDF readability):
- Message label sits fully ABOVE the arrow (gap for Vietnamese diacritics).
- Long labels wrap; self-messages wrap to the right of the loop.
- Two-pass: measure row heights, then draw (no clipping).
"""
from __future__ import annotations

import hashlib
import re
import shutil
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent
CACHE = ROOT / "_pdf_mermaid"
FONT_REG = Path(r"C:\Windows\Fonts\segoeui.ttf")
FONT_BOLD = Path(r"C:\Windows\Fonts\segoeuib.ttf")
CACHE_VER = "v2"  # bump to invalidate old clipped PNGs


def _font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    path = FONT_BOLD if bold and FONT_BOLD.exists() else FONT_REG
    if path.exists():
        return ImageFont.truetype(str(path), size)
    return ImageFont.load_default()


def _wrap(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.ImageFont, max_w: float) -> list[str]:
    words = (text or "").split()
    if not words:
        return [""]
    lines: list[str] = []
    cur = ""
    for w in words:
        trial = (cur + " " + w).strip()
        if draw.textlength(trial, font=font) <= max_w:
            cur = trial
        else:
            if cur:
                lines.append(cur)
            # hard-break ultra-long token
            if draw.textlength(w, font=font) > max_w:
                chunk = ""
                for ch in w:
                    t2 = chunk + ch
                    if draw.textlength(t2, font=font) <= max_w:
                        chunk = t2
                    else:
                        if chunk:
                            lines.append(chunk)
                        chunk = ch
                cur = chunk
            else:
                cur = w
    if cur:
        lines.append(cur)
    return lines


def _parse(src: str) -> tuple[list[tuple[str, str]], list[dict], bool]:
    participants: list[tuple[str, str]] = []
    seen: set[str] = set()
    events: list[dict] = []
    autonumber = False

    def ensure(pid: str, label: str | None = None) -> None:
        if pid not in seen:
            seen.add(pid)
            participants.append((pid, label or pid))
        elif label:
            for i, (p, _) in enumerate(participants):
                if p == pid:
                    participants[i] = (pid, label)
                    break

    for raw in src.splitlines():
        line = raw.strip()
        if not line or line.startswith("sequenceDiagram"):
            continue
        if line == "autonumber":
            autonumber = True
            continue
        m = re.match(r"^(actor|participant)\s+(\w+)(?:\s+as\s+(.+))?$", line)
        if m:
            ensure(m.group(2), (m.group(3) or m.group(2)).strip())
            continue
        m = re.match(r"^Note\s+over\s+([^:]+):\s*(.+)$", line, flags=re.I)
        if m:
            who = [x.strip() for x in m.group(1).split(",")]
            for w in who:
                ensure(w)
            events.append({"kind": "note", "who": who, "text": m.group(2).strip()})
            continue
        if line.startswith("alt "):
            events.append({"kind": "alt", "text": line[4:].strip()})
            continue
        if line.startswith("else"):
            events.append({"kind": "else", "text": line[4:].strip() or "Khác"})
            continue
        if line == "end":
            events.append({"kind": "end"})
            continue
        m = re.match(r"^(\w+)\s*(-->>|->>|->)\s*(\w+)\s*:\s*(.+)$", line)
        if m:
            a, arrow, b, msg = m.group(1), m.group(2), m.group(3), m.group(4).strip()
            ensure(a)
            ensure(b)
            events.append(
                {
                    "kind": "msg",
                    "a": a,
                    "b": b,
                    "text": msg,
                    "dashed": arrow.startswith("--"),
                    "self": a == b,
                }
            )
            continue
    return participants, events, autonumber


def render_sequence_png(src: str, out_path: Path) -> Path:
    participants, events, autonumber = _parse(src)
    if not participants:
        participants = [("HT", "Hệ thống")]

    font = _font(15)
    font_sm = _font(13)
    font_b = _font(14, bold=True)
    line_h = 18  # text line height (diacritics)

    n = max(len(participants), 1)
    # Wider columns so Vietnamese messages fit between lifelines
    col_w = max(180, min(260, 1100 // n))
    left = 56
    top = 40
    header_h = 44
    width = left * 2 + col_w * n
    # pad right for self-message text
    width = max(width, left + col_w * n + 220)

    # Probe draw for measuring
    probe = Image.new("RGB", (10, 10), (255, 255, 255))
    pdraw = ImageDraw.Draw(probe)

    centers: dict[str, int] = {}
    for i, (pid, _) in enumerate(participants):
        centers[pid] = left + col_w * i + col_w // 2

    # Precompute row layouts
    rows: list[dict] = []
    step = 0
    for ev in events:
        kind = ev["kind"]
        if kind in ("alt", "else"):
            label = f"[{kind}] {ev['text']}"
            lines = _wrap(pdraw, label, font_sm, width - left * 2 - 24)
            h = 12 + line_h * len(lines) + 10
            rows.append({"kind": kind, "lines": lines, "h": h})
            continue
        if kind == "end":
            rows.append({"kind": "end", "h": 14})
            continue
        if kind == "note":
            who = ev["who"]
            xs = [centers[w] for w in who if w in centers] or [left + col_w // 2]
            x0, x1 = min(xs) - 60, max(xs) + 60
            max_w = max(x1 - x0 - 20, 120)
            lines = _wrap(pdraw, ev["text"], font_sm, max_w)
            h = 14 + line_h * len(lines) + 14
            rows.append({"kind": "note", "lines": lines, "x0": x0, "x1": x1, "h": h})
            continue
        if kind == "msg":
            text = ev["text"]
            if autonumber:
                step += 1
                text = f"{step}. {text}"
            a, b = ev["a"], ev["b"]
            xa, xb = centers.get(a, left), centers.get(b, left + col_w)
            self_msg = bool(ev.get("self") or a == b)
            if self_msg:
                max_w = max(width - xa - 70, 140)
                lines = _wrap(pdraw, text, font, max_w)
                # loop height + text block
                loop_h = 28
                text_h = line_h * len(lines)
                h = max(loop_h, text_h) + 28  # padding above/below
                rows.append(
                    {
                        "kind": "msg",
                        "self": True,
                        "xa": xa,
                        "lines": lines,
                        "h": h,
                        "dashed": False,
                    }
                )
            else:
                span = abs(xb - xa)
                max_w = max(span - 24, 100)
                lines = _wrap(pdraw, text, font, max_w)
                text_h = line_h * len(lines)
                # text above arrow + gap + arrow + bottom pad
                h = 10 + text_h + 8 + 4 + 16
                rows.append(
                    {
                        "kind": "msg",
                        "self": False,
                        "xa": xa,
                        "xb": xb,
                        "lines": lines,
                        "h": h,
                        "dashed": bool(ev.get("dashed")),
                    }
                )

    height = top + header_h + 24 + sum(r["h"] for r in rows) + 36
    height = max(height, 200)

    img = Image.new("RGB", (width, height), (255, 255, 255))
    draw = ImageDraw.Draw(img)

    # Headers + lifelines
    for i, (pid, label) in enumerate(participants):
        cx = centers[pid]
        box_w = min(col_w - 20, max(100, int(draw.textlength(label, font=font_b) + 28)))
        x0, y0 = cx - box_w // 2, top
        x1, y1 = cx + box_w // 2, top + header_h - 4
        draw.rounded_rectangle([x0, y0, x1, y1], radius=6, outline=(30, 64, 175), width=2, fill=(232, 238, 252))
        # wrap header if needed
        hlines = _wrap(draw, label, font_b, box_w - 12)
        ty = y0 + (y1 - y0) / 2 - (line_h * (len(hlines) - 1)) / 2
        for ln in hlines[:2]:
            draw.text((cx, ty), ln, font=font_b, fill=(15, 23, 42), anchor="mm")
            ty += line_h
        draw.line([(cx, y1 + 2), (cx, height - 16)], fill=(180, 190, 200), width=1)

    y = top + header_h + 16
    alt_depth = 0

    for r in rows:
        kind = r["kind"]
        if kind in ("alt", "else"):
            if kind == "alt":
                alt_depth += 1
            x0 = left - 8 + max(alt_depth - 1, 0) * 6
            x1 = width - left + 8
            draw.rectangle([x0, y, x1, y + r["h"] - 4], outline=(234, 179, 8), width=1, fill=(254, 249, 195))
            ty = y + 8
            for ln in r["lines"]:
                draw.text((x0 + 10, ty), ln, font=font_sm, fill=(113, 63, 18))
                ty += line_h
            y += r["h"]
            continue
        if kind == "end":
            if alt_depth:
                alt_depth -= 1
            y += r["h"]
            continue
        if kind == "note":
            x0, x1 = r["x0"], r["x1"]
            draw.rounded_rectangle(
                [x0, y, x1, y + r["h"] - 6],
                radius=4,
                outline=(100, 116, 139),
                width=1,
                fill=(248, 250, 252),
            )
            ty = y + 8
            for ln in r["lines"]:
                draw.text((x0 + 10, ty), ln, font=font_sm, fill=(51, 65, 85))
                ty += line_h
            y += r["h"]
            continue
        if kind == "msg":
            if r["self"]:
                xa = r["xa"]
                # text first (top), then loop below text bottom
                ty = y + 6
                for ln in r["lines"]:
                    draw.text((xa + 52, ty), ln, font=font, fill=(15, 23, 42))
                    ty += line_h
                loop_top = y + 4
                loop_bot = y + r["h"] - 18
                draw.line([(xa, loop_top), (xa + 44, loop_top), (xa + 44, loop_bot), (xa, loop_bot)], fill=(30, 64, 175), width=2)
                draw.polygon(
                    [(xa, loop_bot), (xa + 8, loop_bot - 5), (xa + 8, loop_bot + 5)],
                    fill=(30, 64, 175),
                )
                y += r["h"]
                continue

            xa, xb = r["xa"], r["xb"]
            lines = r["lines"]
            text_h = line_h * len(lines)
            # label block above arrow
            label_top = y + 6
            mid = (xa + xb) / 2
            for i, ln in enumerate(lines):
                tw = draw.textlength(ln, font=font)
                # white pad behind each line
                ly = label_top + i * line_h
                draw.rectangle(
                    [mid - tw / 2 - 6, ly - 2, mid + tw / 2 + 6, ly + line_h - 2],
                    fill=(255, 255, 255),
                )
                draw.text((mid, ly + line_h / 2 - 1), ln, font=font, fill=(15, 23, 42), anchor="mm")

            # arrow well below last text line (diacritic clearance)
            y_line = label_top + text_h + 10
            if r["dashed"]:
                x = xa
                step_x = 9
                direction = 1 if xb > xa else -1
                while (direction > 0 and x < xb) or (direction < 0 and x > xb):
                    x2 = x + direction * 5
                    if (direction > 0 and x2 > xb) or (direction < 0 and x2 < xb):
                        x2 = xb
                    draw.line([(x, y_line), (x2, y_line)], fill=(30, 64, 175), width=2)
                    x += direction * step_x
            else:
                draw.line([(xa, y_line), (xb, y_line)], fill=(30, 64, 175), width=2)
            if xb >= xa:
                draw.polygon([(xb, y_line), (xb - 9, y_line - 5), (xb - 9, y_line + 5)], fill=(30, 64, 175))
            else:
                draw.polygon([(xb, y_line), (xb + 9, y_line - 5), (xb + 9, y_line + 5)], fill=(30, 64, 175))
            y += r["h"]

    out_path.parent.mkdir(parents=True, exist_ok=True)
    img.save(out_path, format="PNG")
    return out_path


def cache_key(src: str) -> str:
    return hashlib.sha1((CACHE_VER + "\n" + src).encode("utf-8")).hexdigest()[:16]


def clear_old_cache() -> None:
    """Remove legacy v1 seq_*.png so PDF rebuild cannot pick clipped images."""
    if not CACHE.exists():
        return
    for p in CACHE.glob("seq_*.png"):
        # keep only current ver keys — wipe all for safety on rebuild
        try:
            p.unlink()
        except OSError:
            pass


def ensure_diagram_png(src: str, *, force: bool = False) -> Path:
    CACHE.mkdir(parents=True, exist_ok=True)
    key = cache_key(src)
    out = CACHE / f"seq_{key}.png"
    if force or not out.exists():
        render_sequence_png(src, out)
    return out
