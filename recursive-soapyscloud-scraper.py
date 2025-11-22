#!/usr/bin/env python3
"""
Recursive SoapysCloud Database Generator
Handles nested folder structures with multiple levels
"""

import json
import re
from datetime import datetime
from pathlib import Path
from urllib.parse import urljoin, unquote, quote
import sys

# Try to import requests for URL fetching
try:
    import requests
    HAS_REQUESTS = True
except ImportError:
    HAS_REQUESTS = False


class SoapysCloudCrawler:
    def __init__(self, collection='music'):
        self.collection = collection
        self.database = {
            'metadata': {
                'version': '1.0',
                'provider': 'soapyscloud',
                'generated': '',
                'totalFiles': 0,
                'totalSize': 0,
                'collections': {
                    'music': 0,
                    'videos': 0,
                    'photos': 0,
                    'interviews': 0,
                    'misc': 0
                }
            },
            'files': []
        }
        self.folder_counter = 1
        self.file_counter = 1
        self.visited_urls = set()

    def parse_directory_html(self, html_content, base_url):
        """Parse HTML directory listing and extract file/folder information"""
        items = []

        # Pattern for directory links
        link_pattern = r'<a\s+href="([^"]+)"[^>]*>([^<]+)</a>'
        matches = re.finditer(link_pattern, html_content, re.IGNORECASE)

        for match in matches:
            href = match.group(1)
            name = match.group(2).strip()

            # Skip parent directory and navigation
            if href in ['../', '../', '..', '/', '?C=N;O=D', '?C=M;O=A', '?C=S;O=A', '?C=D;O=A']:
                continue

            # Skip absolute URLs not from this domain
            if href.startswith('http') and not href.startswith(base_url):
                continue

            # Determine if folder
            is_folder = href.endswith('/')

            # Clean name
            if is_folder and name.endswith('/'):
                name = name[:-1]

            # Try to find size in nearby text
            size = 0
            try:
                # Look for size pattern after the link
                size_match = re.search(
                    rf'<a[^>]*>{re.escape(name)}[^<]*</a>\s*</td>\s*<td[^>]*>\s*([\d.]+[KMG]?)',
                    html_content,
                    re.IGNORECASE
                )
                if size_match:
                    size = self.parse_size(size_match.group(1))
            except:
                pass

            # Build full URL
            full_url = urljoin(base_url, href)

            items.append({
                'name': name,
                'href': href,
                'url': full_url,
                'is_folder': is_folder,
                'size': size
            })

        return items

    def parse_size(self, size_str):
        """Convert size string like '5.2M' to bytes"""
        if not size_str or size_str == '-':
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

    def get_mime_type(self, filename):
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
        }
        return mime_types.get(ext, 'application/octet-stream')

    def get_file_type(self, mime_type):
        """Get file type category from MIME type"""
        if mime_type.startsWith('audio/'):
            return 'audio'
        elif mime_type.startswith('video/'):
            return 'video'
        elif mime_type.startswith('image/'):
            return 'image'
        else:
            return 'document'

    def add_folder(self, name, path, parent_id):
        """Add a folder entry to the database"""
        folder_id = f"soapys-folder-{str(self.folder_counter).zfill(3)}"
        self.folder_counter += 1

        entry = {
            'id': folder_id,
            'name': name,
            'path': path,
            'collection': self.collection,
            'type': 'folder',
            'mimeType': 'application/vnd.google-apps.folder',
            'size': 0,
            'parentId': parent_id,
            'thumbnailLink': None,
            'webViewLink': None,
            'webContentLink': None,
            'modifiedTime': datetime.now().isoformat()
        }

        self.database['files'].append(entry)
        return folder_id

    def add_file(self, name, path, url, size, parent_id):
        """Add a file entry to the database"""
        mime_type = self.get_mime_type(name)
        file_type = self.get_file_type(mime_type)

        file_id = f"soapys-{str(self.file_counter).zfill(3)}"
        self.file_counter += 1

        entry = {
            'id': file_id,
            'name': name,
            'path': path,
            'collection': self.collection,
            'type': file_type,
            'mimeType': mime_type,
            'size': size,
            'parentId': parent_id,
            'thumbnailLink': None,
            'webViewLink': url,
            'webContentLink': url,
            'modifiedTime': datetime.now().isoformat()
        }

        self.database['files'].append(entry)

    def crawl_directory(self, url, parent_id, current_path, fetch_func, max_depth=10, current_depth=0):
        """
        Recursively crawl a directory

        Args:
            url: Directory URL to crawl
            parent_id: Parent folder ID in database
            current_path: Current path string (e.g., "music/album")
            fetch_func: Function to fetch HTML (for flexibility)
            max_depth: Maximum recursion depth
            current_depth: Current recursion level
        """
        if current_depth >= max_depth:
            print(f"  [!] Max depth reached at {current_path}")
            return

        if url in self.visited_urls:
            print(f"  [!] Already visited {url}")
            return

        self.visited_urls.add(url)

        print(f"{'  ' * current_depth}📂 Crawling: {url}")

        try:
            html = fetch_func(url)
            items = self.parse_directory_html(html, url)

            print(f"{'  ' * current_depth}   Found {len(items)} items")

            for item in items:
                item_path = f"{current_path}/{item['name']}"

                if item['is_folder']:
                    # Add folder to database
                    folder_id = self.add_folder(item['name'], item_path, parent_id)
                    print(f"{'  ' * current_depth}   📁 {item['name']}/")

                    # Recursively crawl subfolder
                    self.crawl_directory(
                        item['url'],
                        folder_id,
                        item_path,
                        fetch_func,
                        max_depth,
                        current_depth + 1
                    )
                else:
                    # Add file to database
                    self.add_file(item['name'], item_path, item['url'], item['size'], parent_id)
                    size_str = self.format_size(item['size'])
                    print(f"{'  ' * current_depth}   📄 {item['name']} ({size_str})")

        except Exception as e:
            print(f"{'  ' * current_depth}   [ERROR] {e}")

    def format_size(self, bytes):
        """Format bytes to human readable"""
        if bytes == 0:
            return '0 B'
        k = 1024
        sizes = ['B', 'KB', 'MB', 'GB']
        i = int(re.match(r'\d+', str(bytes // k)).group()) if bytes >= k else 0
        i = min(i, len(sizes) - 1)
        return f"{bytes / (k ** i):.2f} {sizes[i]}"

    def finalize_database(self):
        """Calculate and update metadata"""
        self.database['metadata']['generated'] = datetime.now().isoformat()
        self.database['metadata']['totalFiles'] = len(self.database['files'])
        self.database['metadata']['totalSize'] = sum(f['size'] for f in self.database['files'])

        # Count files per collection
        for col in self.database['metadata']['collections'].keys():
            self.database['metadata']['collections'][col] = len(
                [f for f in self.database['files'] if f['collection'] == col]
            )

    def save_database(self, output_file='search-db-soapyscloud.json'):
        """Save database to JSON file"""
        self.finalize_database()

        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(self.database, f, indent=2, ensure_ascii=False)

        print(f"\n✓ Database saved: {output_file}")
        print(f"  Total files: {self.database['metadata']['totalFiles']}")
        print(f"  Total size: {self.format_size(self.database['metadata']['totalSize'])}")
        print(f"  Collections: {self.database['metadata']['collections']}")


def fetch_from_url(url):
    """Fetch HTML from URL using requests"""
    if not HAS_REQUESTS:
        raise ImportError("requests library required for URL fetching. Install with: pip install requests")

    response = requests.get(url, timeout=30)
    response.raise_for_status()
    return response.text


def fetch_from_file(file_path):
    """Load HTML from local file"""
    with open(file_path, 'r', encoding='utf-8') as f:
        return f.read()


def interactive_mode():
    """Interactive CLI for building database"""
    print("=" * 60)
    print("Recursive SoapysCloud Database Generator")
    print("=" * 60)
    print()

    # Get collection
    collection = input("Enter collection name (music/videos/photos/interviews/misc) [music]: ").strip() or 'music'

    # Get crawl method
    print("\nCrawl method:")
    print("1. Fetch from URL (requires internet + requests library)")
    print("2. Parse local HTML files (manual per-directory)")
    print("3. Single directory from URL")
    print("4. Single directory from file")

    choice = input("Enter choice (1-4): ").strip()

    crawler = SoapysCloudCrawler(collection)

    if choice == '1':
        # Recursive URL crawling
        root_url = input("\nEnter root directory URL: ").strip()
        max_depth = input("Max folder depth [5]: ").strip()
        max_depth = int(max_depth) if max_depth else 5

        print(f"\n🚀 Starting recursive crawl from {root_url}")
        print(f"   Max depth: {max_depth} levels")
        print()

        crawler.crawl_directory(
            root_url,
            f"{collection}-root",
            collection,
            fetch_from_url,
            max_depth
        )

    elif choice == '2':
        # Manual per-directory HTML files
        print("\nManual crawling mode")
        print("For each directory, provide the saved HTML file")
        print("Type 'done' when finished")
        print()

        parent_stack = [{'id': f"{collection}-root", 'path': collection}]

        while True:
            print(f"\nCurrent path: {parent_stack[-1]['path']}")
            file_path = input("Enter HTML file path (or 'done'/'back'): ").strip()

            if file_path.lower() == 'done':
                break

            if file_path.lower() == 'back':
                if len(parent_stack) > 1:
                    parent_stack.pop()
                continue

            try:
                html = fetch_from_file(file_path)
                base_url = input("Enter directory URL: ").strip()

                items = crawler.parse_directory_html(html, base_url)
                parent = parent_stack[-1]

                print(f"Found {len(items)} items")

                for item in items:
                    item_path = f"{parent['path']}/{item['name']}"

                    if item['is_folder']:
                        folder_id = crawler.add_folder(item['name'], item_path, parent['id'])
                        print(f"  📁 {item['name']}/")

                        # Ask if user wants to descend
                        descend = input(f"    Crawl into '{item['name']}'? (y/n): ").lower()
                        if descend == 'y':
                            parent_stack.append({'id': folder_id, 'path': item_path})
                            break
                    else:
                        crawler.add_file(item['name'], item_path, item['url'], item['size'], parent['id'])
                        print(f"  📄 {item['name']}")

            except Exception as e:
                print(f"Error: {e}")

    elif choice == '3':
        # Single directory from URL
        url = input("\nEnter directory URL: ").strip()
        html = fetch_from_url(url)
        items = crawler.parse_directory_html(html, url)

        for item in items:
            item_path = f"{collection}/{item['name']}"
            if item['is_folder']:
                crawler.add_folder(item['name'], item_path, f"{collection}-root")
            else:
                crawler.add_file(item['name'], item_path, item['url'], item['size'], f"{collection}-root")

        print(f"Added {len(items)} items")

    elif choice == '4':
        # Single directory from file
        file_path = input("\nEnter HTML file path: ").strip()
        base_url = input("Enter directory base URL: ").strip()

        html = fetch_from_file(file_path)
        items = crawler.parse_directory_html(html, base_url)

        for item in items:
            item_path = f"{collection}/{item['name']}"
            if item['is_folder']:
                crawler.add_folder(item['name'], item_path, f"{collection}-root")
            else:
                crawler.add_file(item['name'], item_path, item['url'], item['size'], f"{collection}-root")

        print(f"Added {len(items)} items")

    # Save database
    output_file = input("\nOutput file [search-db-soapyscloud.json]: ").strip() or 'search-db-soapyscloud.json'
    crawler.save_database(output_file)


if __name__ == '__main__':
    try:
        interactive_mode()
    except KeyboardInterrupt:
        print("\n\nAborted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\nError: {e}")
        sys.exit(1)
