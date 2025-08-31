# Gyazo Extension for Obsidian
This is a plugin for [Obsidian](https://obsidian.md) that saves pasted images to [Gyazo](https://gyazo.com/).

> **Note:** This plugin requires an internet connection to upload images to Gyazo. (Images will be saved as local files when offline.)

> **Note:** This plugin requires an Gyazo account.

## Usage
1. Copy an image to the clipboard.
2. Paste the image into Obsidian note as you normally would.
3. The image will be uploaded to Gyazo and will be embedded using html `<img>` tag.
   - If offline (or offline mode is on), the image will be saved as a local file.

## Settings
- Image width: The `width` attribute of the `<img>` tag.
- Show notification: Show notifications when the plugin is running.
- Gyazo Access Token: Your Gyazo access token.
  - You can get it from [here](https://gyazo.com/oauth/applications).
- Image path: The path to save the image when offline.