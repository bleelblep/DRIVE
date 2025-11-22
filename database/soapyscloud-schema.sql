-- SoapysCloud MySQL Database Schema
-- Optimized for 1,749+ files with fast searching and filtering
-- Created: 2025-11-22

-- Drop existing tables if they exist (for clean reinstalls)
DROP TABLE IF EXISTS files;
DROP TABLE IF EXISTS albums;
DROP TABLE IF EXISTS artists;
DROP TABLE IF EXISTS metadata;

-- Artists table (MOTHERLAND, SOPHIE, etc.)
CREATE TABLE artists (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    total_albums INT DEFAULT 0,
    total_tracks INT DEFAULT 0,
    total_videos INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Albums table (EPs, demos, video collections, etc.)
CREATE TABLE albums (
    id INT AUTO_INCREMENT PRIMARY KEY,
    artist_id INT,
    title VARCHAR(500) NOT NULL,
    year INT,
    type ENUM('demo', 'ep', 'album', 'single', 'video_collection', 'misc') DEFAULT 'misc',
    collection_type ENUM('music_collection', 'video_collection', 'photos', 'interviews', 'misc') DEFAULT 'misc',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE,
    INDEX idx_artist (artist_id),
    INDEX idx_type (type),
    INDEX idx_collection (collection_type),
    INDEX idx_year (year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Files table (tracks, videos, artwork, metadata files)
CREATE TABLE files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    album_id INT,
    artist_id INT,
    title VARCHAR(500) NOT NULL,
    filename VARCHAR(500) NOT NULL,
    url TEXT NOT NULL,
    format VARCHAR(50),
    file_type ENUM('audio', 'video', 'image', 'text', 'document', 'other') DEFAULT 'other',
    quality ENUM('high', 'medium', 'low') DEFAULT 'high',
    file_size BIGINT, -- in bytes, for future use
    duration INT, -- in seconds, for future use
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE,
    FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE SET NULL,
    INDEX idx_title (title(255)),
    INDEX idx_filename (filename(255)),
    INDEX idx_format (format),
    INDEX idx_file_type (file_type),
    INDEX idx_album (album_id),
    INDEX idx_artist (artist_id),
    FULLTEXT INDEX ft_search (title, filename)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Metadata table (database version, stats, etc.)
CREATE TABLE metadata (
    id INT AUTO_INCREMENT PRIMARY KEY,
    meta_key VARCHAR(100) NOT NULL UNIQUE,
    meta_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_key (meta_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert initial metadata
INSERT INTO metadata (meta_key, meta_value) VALUES
    ('database_version', '2.0.0'),
    ('source', 'https://soapyscloud.com/drive/music/'),
    ('total_files', '0'),
    ('last_updated', NOW());

-- Create view for easy file browsing with artist/album info
CREATE OR REPLACE VIEW file_details AS
SELECT
    f.id,
    f.title,
    f.filename,
    f.url,
    f.format,
    f.file_type,
    f.quality,
    f.file_size,
    f.duration,
    a.title AS album_title,
    a.year AS album_year,
    a.type AS album_type,
    a.collection_type,
    art.name AS artist_name,
    f.created_at,
    f.updated_at
FROM files f
LEFT JOIN albums a ON f.album_id = a.id
LEFT JOIN artists art ON f.artist_id = art.id;

-- Performance optimization: Analyze tables
ANALYZE TABLE artists, albums, files, metadata;
