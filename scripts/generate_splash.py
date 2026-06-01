#!/usr/bin/env python3
"""
Rebuild splash PNGs with:
  - Medallion centred in the upper-half of the canvas
  - Title "Abelhas Nativas do Brasil" drawn fresh (correct contrast per theme)
  - "by Michel Rodrigues" anchored at the footer

Usage:
    python3 scripts/generate_splash.py
"""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "assets" / "images"
ORIGINAL = Path("/Users/michelrodrigues/Downloads/design_handoff_icon_splash/export")

CANVAS_W, CANVAS_H = 900, 1180

# Medallion rows in original PNGs (same for light and dark)
MEDALLION_TOP    = 147
MEDALLION_BOTTOM = 734

# Title layout (recreated with PIL so we control colour)
TITLE_LINE1 = "Abelhas Nativas"
TITLE_LINE2 = "do Brasil"
TITLE_FONT_SIZE  = 72    # matches original visual weight
TITLE_GAP        = 10    # px between the two lines

# Credit
CREDIT_TEXT      = "by Michel Rodrigues"
CREDIT_FONT_SIZE = 28
FOOTER_MARGIN    = 60    # px from bottom edge

# Brand colours (from src/constants/theme.ts)
DARK_GREEN  = (44,  62,  53,  255)   # #2C3E35 — onPrimary light
LIGHT_GREY  = (168, 181, 168, 255)   # #A8B5A8 — icon colour dark


def load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    candidates = [
        "/System/Library/Fonts/SFNS.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
    ]
    for path in candidates:
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            continue
    return ImageFont.load_default()


def centred_x(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.FreeTypeFont) -> int:
    bbox = draw.textbbox((0, 0), text, font=font)
    return (CANVAS_W - (bbox[2] - bbox[0])) // 2


def text_height(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.FreeTypeFont) -> int:
    bbox = draw.textbbox((0, 0), text, font=font)
    return bbox[3] - bbox[1]


def rebuild_splash(
    medallion_src: Path,
    dst_path: Path,
    title_colour: tuple,
    credit_colour: tuple,
) -> None:
    src = Image.open(medallion_src).convert("RGBA")

    # ── Extract medallion block ───────────────────────────────────────────────
    medallion = src.crop((0, MEDALLION_TOP, CANVAS_W, MEDALLION_BOTTOM))
    medallion_h = MEDALLION_BOTTOM - MEDALLION_TOP  # ~587 px

    # ── Fonts ─────────────────────────────────────────────────────────────────
    title_font  = load_font(TITLE_FONT_SIZE,  bold=True)
    credit_font = load_font(CREDIT_FONT_SIZE, bold=False)

    # ── Measure title block ───────────────────────────────────────────────────
    dummy_draw = ImageDraw.Draw(Image.new("RGBA", (1, 1)))
    line1_h = text_height(dummy_draw, TITLE_LINE1, title_font)
    line2_h = text_height(dummy_draw, TITLE_LINE2, title_font)
    title_block_h = line1_h + TITLE_GAP + line2_h

    MEDALLION_TITLE_GAP = 40   # px between medallion bottom and title top

    total_content_h = medallion_h + MEDALLION_TITLE_GAP + title_block_h
    footer_area     = CREDIT_FONT_SIZE + FOOTER_MARGIN + 20

    # Centre the content block in the remaining space (above footer)
    available_h = CANVAS_H - footer_area
    content_top = max(0, (available_h - total_content_h) // 2)

    # ── Build canvas ──────────────────────────────────────────────────────────
    out  = Image.new("RGBA", (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(out)

    # Paste medallion
    out.paste(medallion, (0, content_top), medallion)

    # Draw title lines
    title_y = content_top + medallion_h + MEDALLION_TITLE_GAP
    for line, lh in [(TITLE_LINE1, line1_h), (TITLE_LINE2, line2_h)]:
        x = centred_x(draw, line, title_font)
        draw.text((x, title_y), line, font=title_font, fill=title_colour)
        title_y += lh + TITLE_GAP

    # Draw footer credit
    credit_h = text_height(draw, CREDIT_TEXT, credit_font)
    credit_x = centred_x(draw, CREDIT_TEXT, credit_font)
    credit_y = CANVAS_H - FOOTER_MARGIN - credit_h
    draw.text((credit_x, credit_y), CREDIT_TEXT, font=credit_font, fill=credit_colour)

    out.save(dst_path, "PNG")
    print(f"Saved {dst_path.relative_to(ROOT)}")


if __name__ == "__main__":
    # Light splash — title in dark green, credit in dark green
    rebuild_splash(
        medallion_src  = ORIGINAL / "splash-icon-light.png",
        dst_path       = ASSETS   / "splash-icon-light.png",
        title_colour   = DARK_GREEN,
        credit_colour  = DARK_GREEN,
    )

    # Dark splash — title in light grey, credit in light grey
    rebuild_splash(
        medallion_src  = ORIGINAL / "splash-icon-dark.png",
        dst_path       = ASSETS   / "splash-icon-dark.png",
        title_colour   = LIGHT_GREY,
        credit_colour  = LIGHT_GREY,
    )

    print("\nDone. Run `npx expo prebuild --clean` then `npm run ios` / `npm run android`.")
