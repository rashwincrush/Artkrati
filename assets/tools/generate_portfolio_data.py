#!/usr/bin/env python3
import os, json, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]  # .../Migrate to html
IMG_ROOT = ROOT / 'images' / 'Portfolio'
ALBUMS_DIR = IMG_ROOT / 'Albums'
PROJECTS_DIR = IMG_ROOT / 'Projects'
COMMERCIAL_DIR = IMG_ROOT / 'Commercial '
OUT_DIR = ROOT / 'assets' / 'data'
OUT_FILE = OUT_DIR / 'portfolio-data.json'

IMAGE_EXTS = {'.jpg','.jpeg','.png','.webp','.JPG','.JPEG','.PNG','.WEBP'}
VIDEO_EXTS = {'.mov','.mp4','.MOV','.MP4'}

def to_rel(p: Path) -> str:
    return str(p.relative_to(ROOT)).replace('\\','/')

def list_media(folder: Path):
    imgs, vids = [], []
    if not folder.exists():
        return imgs, vids
    for root, _, files in os.walk(folder):
        for f in sorted(files):
            ext = os.path.splitext(f)[1]
            full = Path(root) / f
            if ext in IMAGE_EXTS:
                imgs.append(to_rel(full))
            elif ext in VIDEO_EXTS:
                vids.append(to_rel(full))
    return imgs, vids

def pick_cover(paths):
    if not paths:
        return ''
    # Prefer jpg/png over others by simple ordering
    def key(p):
        name = Path(p).name.lower()
        # weight by extension first
        ext = Path(p).suffix.lower()
        weight = {'jpg':0,'jpeg':0,'png':1,'webp':2}.get(ext.lstrip('.'),3)
        return (weight, name)
    return sorted(paths, key=key)[0]

def scan_albums():
    albums = []
    if not ALBUMS_DIR.exists():
        return albums
    for entry in sorted(ALBUMS_DIR.iterdir()):
        if entry.is_dir():
            imgs, _ = list_media(entry)
            if not imgs:
                continue
            slug = entry.name.strip().lower().replace(' ','-')
            albums.append({
                'slug': slug,
                'title': entry.name,
                'cover': pick_cover(imgs),
                'images': [{'src': p, 'alt': Path(p).stem} for p in imgs]
            })
    return albums

def scan_projects(base: Path, type_hint: str):
    projects = []
    if not base.exists():
        return projects
    for entry in sorted(base.iterdir()):
        if entry.is_dir():
            imgs, _ = list_media(entry)
            if not imgs:
                # allow projects with only videos? Skip for gallery purposes
                continue
            slug = entry.name.strip().lower().replace(' ','-')
            projects.append({
                'slug': slug,
                'title': entry.name,
                'type': type_hint,
                'location': '',
                'year': '',
                'cover': pick_cover(imgs),
                'images': [{'src': p, 'alt': Path(p).stem, 'room': None} for p in imgs]
            })
    return projects

def main():
    albums = scan_albums()
    projects_res = scan_projects(PROJECTS_DIR, 'residential')
    projects_com = scan_projects(COMMERCIAL_DIR, 'commercial')
    data = {
        'projects': projects_res + projects_com,
        'albums': albums
    }
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    with open(OUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f'Wrote {OUT_FILE} with {len(data["projects"])} projects and {len(data["albums"])} albums')

if __name__ == '__main__':
    main()
