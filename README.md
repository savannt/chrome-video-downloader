# Chrome Video Downloader

A lightweight Chrome extension that finds videos in the current page—both in `<video>` elements and single embedded iframes—filters for the highest-resolution variants (e.g. 1080p over 720p), and downloads them automatically.

## Features
- Detects `<video>` tags and their `<source>` children.
- Parses the lone `<iframe>` on the page for video URLs.
- Alerts if multiple iframes are present or if no videos are found.
- Picks only the highest-res version of each video.
- One-click download via the toolbar button.