# Mailto to Clipboard

A Chrome/Firefox extension that intercepts `mailto:` links and copies email addresses to the clipboard instead of opening the default mail client.

## Features

- Click any `mailto:` link to copy the email address to clipboard
- Visual feedback shows "Copied to Clipboard!" for 2 seconds
- Handles dynamically loaded mailto links via MutationObserver
- Works on all URLs
- Manifest V3 compatible

## Installation

### Chrome / Edge / Brave

1. Navigate to `chrome://extensions`
2. Enable **Developer mode** (toggle in top right)
3. Click **Load unpacked**
4. Select the `mailto-clipper` folder

### Firefox

1. Navigate to `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on...**
3. Select the `manifest.json` file

## Usage

Simply click any `mailto:` link on any webpage. The email address will be copied to your clipboard, and you'll see a confirmation message.

## Permissions

- `clipboardWrite` - Required to write to the system clipboard
