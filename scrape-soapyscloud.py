#!/usr/bin/env python3
"""
SoapysCloud Database Generator
Scrapes directory listings and generates search-db-soapyscloud.json
"""

import json
import re
from datetime import datetime
from pathlib import Path
from urllib.parse import urljoin, unquote
import sys

def parse_directory_listing(html_content, base_url):
    """
    Parse HTML directory listing and extract file information
    Supports common Apache/nginx directory listing formats
    """
    files = []

    # Common patterns for directory listings
    # Apache: <a href="file.mp3">file.mp3</a>
    # nginx: <a href="file.mp3">file.mp3</a>
    link_pattern = r'<a\s+href="([^"]+)"[^>]*>([^<]+)</a>(?:\s+</td><td[^>]*>)?(?:\s*(\d{2}-[A-Za-z]{3}-\d{4}\s+\d{2}:\d{2}))?(?:\s+</td><td[^>]*>)?(?:\s*(-|[\d.]+[KMG]?))?'

    matches = re.finditer(link_pattern, html_content, re.IGNORECASE)

    for match in matches:
        href = match.group(1)
        name = match.group(2).strip()
        date_str = match.group(3) if len(match.groups()) >= 3 else None
        size_str = match.group(4) if len(match.groups()) >= 4 else None

        # Skip parent directory links
        if href in ['../', '../', '..', '/']:
            continue

        # Skip absolute URLs or protocol-relative URLs
        if href.startswith('http') or href.startswith('//'):
            continue

        # Determine if it's a folder
        is_folder = href.endswith('/')

        # Clean up the name
        if is_folder and name.endswith('/'):
            name = name[:-1]

        # Parse size
        size = 0
        if size_str and size_str != '-':
            size = parse_size(size_str)

        # Build full URL
        full_url = urljoin(base_url, href)

        files.append({
            'name': unquote(name),
            'href': href,
            'url': full_url,
            'is_folder': is_folder,
            'size': size,
            'date': date_str
        })

    return files

def parse_size(size_str):
    """Convert size string like '5.2M' to bytes"""
    size_str = size_str.strip()
    if size_str == '-' or not size_str:
        return 0

    multipliers = {'K': 1024, 'M': 1024**2, 'G': 1024**3}
    match = re.match(r'([\d.]+)([KMG])?', size_str, re.IGNORECASE)

    if match:
        num = float(match.group(1))
        unit = match.group(2)
        if unit:
            return int(num * multipliers[unit.upper()])
        return int(num)

    return 0

def get_mime_type(filename):
    """Get MIME type from filename"""
    ext = Path(filename).suffix.lower()

    mime_types = {
        '.mp3': 'audio/mpeg',
        '.wav': 'audio/wav',
        '.flac': 'audio/flac',
        '.m4a': 'audio/mp4',
        '.ogg': 'audio/ogg',
        '.mp4': 'video/mp4',
        '.mkv': 'video/x-matroska',
        '.avi': 'video/x-msvideo',
        '.mov': 'video/quicktime',
        '.webm': 'video/webm',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.pdf': 'application/pdf',
        '.txt': 'text/plain',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    }

    return mime_types.get(ext, 'application/octet-stream')

def get_file_type(mime_type):
    """Get file type from MIME type"""
    if mime_type.startswith('audio/'):
        return 'audio'
    elif mime_type.startswith('video/'):
        return 'video'
    elif mime_type.startswith('image/'):
        return 'image'
    else:
        return 'document'

def detect_collection(path):
    """Detect which collection a file belongs to"""
    path_lower = path.lower()

    if any(x in path_lower for x in ['music', 'audio', 'songs', 'tracks', 'albums']):
        return 'music'
    elif any(x in path_lower for x in ['video', 'movies', 'clips']):
        return 'videos'
    elif any(x in path_lower for x in ['photo', 'pictures', 'images', 'pics']):
        return 'photos'
    elif any(x in path_lower for x in ['interview']):
        return 'interviews'
    else:
        return 'misc'

def build_database_from_files(file_list, collection='music', parent_path=''):
    """Build database structure from file list"""
    database_files = []
    folder_counter = 1
    file_counter = 1

    for item in file_list:
        # Calculate path
        if parent_path:
            item_path = f"{parent_path}/{item['name']}"
        else:
            item_path = item['name']

        if item['is_folder']:
            # Create folder entry
            entry = {
                'id': f"soapys-folder-{str(folder_counter).zfill(3)}",
                'name': item['name'],
                'path': f"{collection}/{item_path}",
                'collection': collection,
                'type': 'folder',
                'mimeType': 'application/vnd.google-apps.folder',
                'size': 0,
                'parentId': f"{collection}-root",
                'thumbnailLink': None,
                'webViewLink': None,
                'webContentLink': None,
                'modifiedTime': datetime.now().isoformat()
            }
            folder_counter += 1
        else:
            # Create file entry
            mime_type = get_mime_type(item['name'])
            file_type = get_file_type(mime_type)

            entry = {
                'id': f"soapys-{str(file_counter).zfill(3)}",
                'name': item['name'],
                'path': f"{collection}/{item_path}",
                'collection': collection,
                'type': file_type,
                'mimeType': mime_type,
                'size': item['size'],
                'parentId': f"{collection}-root",
                'thumbnailLink': None,
                'webViewLink': item['url'],
                'webContentLink': item['url'],
                'modifiedTime': datetime.now().isoformat()
            }
            file_counter += 1

        database_files.append(entry)

    return database_files

def generate_database(files):
    """Generate complete database JSON"""
    # Calculate metadata
    total_size = sum(f['size'] for f in files)
    collections = {}

    for f in files:
        collection = f['collection']
        collections[collection] = collections.get(collection, 0) + 1

    # Ensure all collections are present
    for col in ['music', 'videos', 'photos', 'interviews', 'misc']:
        if col not in collections:
            collections[col] = 0

    database = {
        'metadata': {
            'version': '1.0',
            'provider': 'soapyscloud',
            'generated': datetime.now().isoformat(),
            'totalFiles': len(files),
            'totalSize': total_size,
            'collections': collections
        },
        'files': files
    }

    return database

def main():
    print("SoapysCloud Database Generator")
    print("=" * 50)
    print()

    # Get input method
    print("Choose input method:")
    print("1. Scrape from URL (requires requests & BeautifulSoup)")
    print("2. Parse saved HTML file")
    choice = input("Enter choice (1 or 2): ").strip()

    if choice == '1':
        url = input("Enter the directory listing URL: ").strip()
        try:
            import requests
            response = requests.get(url)
            html_content = response.text
            base_url = url
        except ImportError:
            print("Error: 'requests' library not installed. Install with: pip install requests")
            sys.exit(1)
        except Exception as e:
            print(f"Error fetching URL: {e}")
            sys.exit(1)

    elif choice == '2':
        file_path = input("Enter path to HTML file: ").strip()
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                html_content = f.read()
            base_url = input("Enter the base URL for files: ").strip()
        except Exception as e:
            print(f"Error reading file: {e}")
            sys.exit(1)
    else:
        print("Invalid choice")
        sys.exit(1)

    # Parse files
    print("\nParsing directory listing...")
    files = parse_directory_listing(html_content, base_url)
    print(f"Found {len(files)} items")

    # Get collection
    collection = input("\nEnter collection name (music/videos/photos/interviews/misc): ").strip() or 'music'

    # Build database
    print("\nBuilding database...")
    db_files = build_database_from_files(files, collection)
    database = generate_database(db_files)

    # Save to file
    output_file = 'search-db-soapyscloud.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(database, f, indent=2, ensure_ascii=False)

    print(f"\n✓ Database generated: {output_file}")
    print(f"  Total files: {database['metadata']['totalFiles']}")
    print(f"  Total size: {database['metadata']['totalSize']:,} bytes")
    print(f"  Collections: {database['metadata']['collections']}")
    print("\nDone!")

if __name__ == '__main__':
    main()
