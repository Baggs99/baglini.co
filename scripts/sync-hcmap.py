"""Copy the generated Housing Connecticut map into the portfolio static site."""

from __future__ import annotations

import argparse
import shutil
from pathlib import Path


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path, help="Path to generated sites_map.html")
    args = parser.parse_args()

    source = args.source.resolve()
    if not source.is_file():
        raise SystemExit(f"Map not found: {source}")

    destination = Path(__file__).resolve().parents[1] / "public" / "HCMAP" / "index.html"
    destination.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(source, destination)
    print(f"Copied {source} -> {destination}")


if __name__ == "__main__":
    main()
