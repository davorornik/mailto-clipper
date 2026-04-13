# Mailto Clipper

A browser extension that copies email addresses to your clipboard instead of opening your default mail app.

## Download

- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/mailto-clipper/)
- [Chrome](https://chromewebstore.google.com/detail/mailto-clipper/hlnmglnhjpmdlfehfhlhfabeofdcckaa?hl=en&authuser=0)

## Features

- **Click to copy** - Click any email link to copy the address
- **Badge count** - Shows number of emails found on the current page
- **Scan page** - Find all mailto links on a page in the popup
- **Dark mode** - Automatically matches your browser theme
- **Toggle intercept** - Enable/disable link interception in settings

## Installation

### From browser stores

Download from [Firefox](https://addons.mozilla.org/en-US/firefox/addon/mailto-clipper/) or [Chrome](https://chromewebstore.google.com/detail/mailto-clipper/hlnmglnhjpmdlfehfhlhfabeofdcckaa?hl=en&authuser=0) add-on stores.

### From source

| Step | Firefox | Chrome |
| --- | --- | --- |
| 1 | Download latest release or zip manifest.json, src/, _locales/ | Same |
| 2 | Navigate to about:addons | Navigate to chrome://extensions |
| 3 | Click the gear icon | Enable Developer mode |
| 4 | Click Debug Add-ons | Click Load unpacked |
| 5 | Click Load Temporary Add-on and select the folder | Select the zipped extension folder |

## Usage

- **Click** any `mailto:` link to copy the email address
- **Click the extension icon** to scan the current page and see all emails
- **Toggle** "Intercept mailto" to switch between copy mode and opening your mail app

## Permissions

- `activeTab` - Access the currently active tab to scan for email addresses
- `scripting` - Execute JavaScript to extract mailto links from pages
- `storage` - Save your settings across sessions
- `<all_urls>` (host_permissions) - Run content scripts on all web pages to detect mailto links

## Localization

The extension is available in 25 European languages. Translations were AI-generated - contributions to improve accuracy are welcome.

## License

See [LICENSE](LICENSE.md)
