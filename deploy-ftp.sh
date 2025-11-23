#!/bin/bash

# FTP Deployment Script for froge.host
# This script uploads your site to froge.host via FTP

# Configuration - UPDATE THESE VALUES
FTP_HOST="ftp.froge.host"  # Your FTP hostname (get from DirectAdmin)
FTP_USER="your-username"    # Your FTP username
FTP_PASS="your-password"    # Your FTP password (or use .netrc for security)
REMOTE_DIR="/public_html"   # Remote directory (usually /public_html or /domains/yourdomain.com/public_html)

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=====================================${NC}"
echo -e "${YELLOW}  DRIVE - FTP Deployment Script${NC}"
echo -e "${YELLOW}=====================================${NC}"
echo ""

# Check if lftp is installed
if ! command -v lftp &> /dev/null; then
    echo -e "${RED}Error: lftp is not installed${NC}"
    echo "Install it with:"
    echo "  Ubuntu/Debian: sudo apt-get install lftp"
    echo "  macOS: brew install lftp"
    echo "  Arch: sudo pacman -S lftp"
    exit 1
fi

# Build CSS before deployment
echo -e "${GREEN}Step 1: Building production CSS...${NC}"
npm run build:css
if [ $? -ne 0 ]; then
    echo -e "${RED}Error: CSS build failed${NC}"
    exit 1
fi
echo ""

# Confirmation
echo -e "${YELLOW}Ready to deploy to:${NC}"
echo "  Host: $FTP_HOST"
echo "  User: $FTP_USER"
echo "  Remote: $REMOTE_DIR"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 0
fi

# Deploy using lftp
echo -e "${GREEN}Step 2: Uploading files via FTP...${NC}"

lftp -c "
set ftp:list-options -a;
set ssl:verify-certificate no;
open ftp://$FTP_USER:$FTP_PASS@$FTP_HOST;
lcd $PWD;
cd $REMOTE_DIR;
mirror --reverse --delete --verbose --exclude .git/ --exclude .github/ --exclude node_modules/ --exclude .gitignore --exclude .gitattributes --exclude deploy-ftp.sh --exclude deploy-ftp-secure.sh --exclude README*.md --exclude CLOUD_PROVIDER_SWITCHING.md --exclude SMOOTH_PAGE_TRANSITIONS_GUIDE.md --exclude API_SECURITY.md --exclude package.json --exclude package-lock.json --exclude tailwind.config.js --exclude src/;
bye;
"

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}=====================================${NC}"
    echo -e "${GREEN}  Deployment Complete!${NC}"
    echo -e "${GREEN}=====================================${NC}"
    echo ""
    echo "Your site should now be live at your domain."
else
    echo ""
    echo -e "${RED}=====================================${NC}"
    echo -e "${RED}  Deployment Failed${NC}"
    echo -e "${RED}=====================================${NC}"
    exit 1
fi
