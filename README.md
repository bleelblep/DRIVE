# DRIVE

## About The Website

**The Drive** is a comprehensive digital archive dedicated to preserving the artistry, legacy, and creative vision of SOPHIE—a groundbreaking electronic music artist, producer, and DJ who redefined modern pop music.

This fan-maintained website provides a centralized collection of SOPHIE's work, including:

- **Music**: Demos, collaborations, instrumentals, unreleased tracks, and remakes
- **Videos**: Music videos, live performances, DJ sets, and behind-the-scenes content
- **Photos**: Press photos, performance shots, promotional images, and archival photography
- **Interviews**: Audio interviews, podcasts, written features, and Q&A sessions
- **Miscellaneous**: Artwork, documents, ephemera, and other archival materials

The archive connects to Google Drive to dynamically load and display content, featuring a modern interface with dark mode support, smooth page transitions, and real-time statistics tracking.

### Key Features

- **Dynamic Content Loading**: Files are pulled from Google Drive in real-time
- **Dark Mode**: Toggle between light and dark themes
- **Smooth Transitions**: Elegant page transitions for better user experience
- **Statistics Tracking**: View archive size, file counts, and collection metrics
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

### Live Demo

🔗 Visit the website at: [bleelblep.github.io/DRIVE](https://bleelblep.github.io/DRIVE)

## Technical Documentation

For developers and contributors, detailed technical documentation is available:

- **[froge.host Migration Guide](FROGE_HOST_MIGRATION_GUIDE.md)** - Complete guide for migrating from GitHub Pages to froge.host with DirectAdmin
- **[Cloud Provider Switching Guide](CLOUD_PROVIDER_SWITCHING.md)** - How to seamlessly switch between Google Drive and SoapysCloud (or add new providers) for bandwidth management and redundancy
- **[Smooth Page Transitions Guide](SMOOTH_PAGE_TRANSITIONS_GUIDE.md)** - Learn how the elegant page transitions work, including FLIP technique, View Transitions API, and shared element transitions
- **[API Security Documentation](API_SECURITY.md)** - Important security information about Google Drive API key management, restrictions, and best practices
- **[Tailwind CSS Setup](README-TAILWIND.md)** - How to work with the self-hosted Tailwind CSS build system

## Quick Start

### For Visitors

Simply open `index.html` in a web browser or visit the deployed website to explore the collections.

### For Developers

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/DRIVE.git
   cd DRIVE
   ```

2. **Install dependencies** (for CSS development):
   ```bash
   npm install
   ```

3. **Watch for CSS changes** (during development):
   ```bash
   npm run watch:css
   ```

4. **Build CSS for production**:
   ```bash
   npm run build:css
   ```

## Project Structure

```
DRIVE/
├── index.html                          # Homepage with collections overview
├── about.html                          # About page
├── music.html                          # Music collection
├── videos.html                         # Videos collection
├── photos.html                         # Photos collection
├── interviews.html                     # Interviews collection
├── misc.html                           # Miscellaneous collection
├── stats.html                          # Statistics updater page
├── build-search-db.html                # Database builder (provider-aware)
├── provider-config.js                  # Cloud provider configuration ⚡ EDIT HERE TO SWITCH
├── provider-adapter.js                 # Provider abstraction layer
├── search-db-googledrive.json          # Google Drive database
├── search-db-soapyscloud.json          # SoapysCloud database
├── soapyscloud-database-template.json  # Template for SoapysCloud entries
├── darkmode.css                        # Dark mode styles
├── transitions.css                     # Page transition animations
├── darkmode.js                         # Dark mode toggle logic
├── dist/                               # Built CSS files
│   └── styles.css                      # Compiled Tailwind CSS
├── images/                             # Website images and logos
└── docs/                               # Technical documentation
    ├── CLOUD_PROVIDER_SWITCHING.md
    ├── SMOOTH_PAGE_TRANSITIONS_GUIDE.md
    ├── API_SECURITY.md
    └── README-TAILWIND.md
```

## How It Works

The website uses a **multi-provider architecture** that supports both Google Drive and SoapysCloud for content delivery. This allows seamless switching between providers when needed (e.g., when bandwidth limits are reached).

- **Google Drive** (default) - Dynamically fetches content via Google Drive API
- **SoapysCloud** - Serves content from static database files
- **Provider Switching** - Change providers with a single line of configuration

Each collection page (Music, Videos, Photos, etc.) queries the active provider and renders files with appropriate previews and download links. The frontend remains identical regardless of which provider is active.

### Content Management

Files are organized in Google Drive folders that mirror the website structure:
- Each collection has a dedicated folder
- Files are automatically discovered and displayed
- Metadata is cached for performance
- Statistics are generated from folder contents

### Security

The Google Drive API key is restricted to:
- Specific domains (HTTP referrer restrictions)
- Read-only access to Google Drive API
- No write or administrative permissions

For more details, see [API_SECURITY.md](API_SECURITY.md).

## Contributing

This is a community project. Contributions are welcome!

### Ways to Contribute

- **Add Content**: Share SOPHIE materials to be included in the archive
- **Fix Bugs**: Report issues or submit pull requests
- **Improve Design**: Suggest UI/UX improvements
- **Documentation**: Help improve these docs
- **Spread the Word**: Share the archive with other fans

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to your branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Technologies Used

- **HTML5** - Semantic markup
- **Tailwind CSS** - Utility-first CSS framework
- **JavaScript (Vanilla)** - No frameworks, pure JS
- **Google Drive API** - Content storage and delivery
- **CSS Transitions** - Smooth animations
- **View Transitions API** - Modern page transitions

## Browser Support

- Chrome/Edge 111+ (full support including View Transitions)
- Firefox 100+ (graceful degradation for transitions)
- Safari 15+ (graceful degradation for transitions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

This is an unofficial fan-maintained archive created to preserve and celebrate SOPHIE's artistic legacy. All materials are property of their respective copyright holders.

We encourage everyone to support official releases, streams, and purchases whenever possible.

## Acknowledgments

- **SOPHIE** - For the incredible music and art
- **The Community** - For preserving and sharing these materials
- **Contributors** - Everyone who has helped build and maintain this archive

## Contact

For questions, suggestions, or to contribute materials:
- Open an issue on GitHub
- Contact the maintainers
- Join the community discussions

---

**Made with 💜 by the community**

*This archive exists to preserve SOPHIE's legacy for future generations.*