# Logo Images Directory

This directory contains the theme-aware logo images for The Drive.

## Required Files

Please add the following logo image files to this directory:

1. **`logo-light.png`** - Black version of "The Drive" logo (shown in light mode)
2. **`logo-dark.png`** - White version of "The Drive" logo (shown in dark mode)

## How It Works

The logos automatically switch based on the user's theme preference:
- Light mode: Shows `logo-light.png` (black logo)
- Dark mode: Shows `logo-dark.png` (white logo)

The switching is controlled by CSS rules in `darkmode.css`.

## Recommended Image Specifications

- Format: PNG with transparency
- Height: Approximately 128-256px (will be displayed at 96px on mobile, 128px on desktop)
- Width: Proportional to maintain aspect ratio
- Background: Transparent
