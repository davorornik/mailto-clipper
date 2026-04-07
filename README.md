# Mailto Clipper

A Chrome extension that copies email addresses to your clipboard instead of opening your default mail app.

## Features

- **Click to copy** - Click any email link to copy the address
- **Badge count** - Shows number of emails found on the current page
- **Scan page** - Find all mailto links on a page in the popup
- **Dark mode** - Automatically matches your browser theme
- **Toggle intercept** - Enable/disable link interception in settings

## Installation

1. Download the latest release or zip the following files:
   - `manifest.json`
   - `src/` folder
   - `_locales/` folder
2. Navigate to `chrome://extensions`
3. Enable **Developer mode** (toggle in top right)
4. Click **Load unpacked**
5. Select the zipped extension folder

## Usage

- **Click** any `mailto:` link to copy the email address
- **Click the extension icon** to scan the current page and see all emails
- **Toggle** "Intercept mailto" to switch between copy mode and opening your mail app

## Permissions

- `clipboardWrite` - Copy emails to clipboard
- `tabs` - Update badge and scan pages
- `storage` - Save your settings
- `scripting` - Scan page content

## Localization

The extension is available in 25 European languages. Translations were AI-generated - contributions to improve accuracy are welcome.

## License

See [LICENSE](LICENSE.md)