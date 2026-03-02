# Pollinations Avatar Gen

[![Built With Pollinations.ai](https://img.shields.io/badge/Built%20with-Pollinations-8a2be2?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMjQgMTI0Ij48Y2lyY2xlIGN4PSI2MiIgY3k9IjYyIiByPSI2MiIgZmlsbD0iI2ZmZmZmZiIvPjwvc3ZnPg==&logoColor=white&labelColor=6a0dad)](https://pollinations.ai)

An extension for [SillyTavern](https://github.com/SillyTavern/SillyTavern) that generates character avatars based on their text descriptions using the [Pollinations.ai](https://pollinations.ai) API.

## ⚠️ Prerequisites (Critical Step)

**Before installing the extension**, you must install the server-side plugin `AvatarEdit`. Without it, the extension cannot save the generated images.

1. **Enable Plugins in SillyTavern**
   Open `config.yaml` in your main SillyTavern directory and ensure this line is set:
   ```yaml
   enableServerPlugins: true
   ```

2. **Install the Plugin**
   Navigate to the `plugins` folder inside your SillyTavern directory and clone the helper repository:
   ```bash
   cd plugins
   git clone https://github.com/Nidelon/SillyTavern-AvatarEdit
   ```
   *(Restart SillyTavern after installing the plugin)*.

## Installation

1. Open **[SillyTavern](https://github.com/SillyTavern/SillyTavern)**.
2. Go to the **Extensions** menu.
3. Select **"Install extension"**.
4. Paste the link to this repository:
   ```
   https://github.com/Nidelon/pollinations-avatar-gen
   ```
5. Click **Install**.

## Usage

1. Open a chat with any character.
2. Click the **More...** button (next to the character name).
3. Select **✨ Generate Avatar** from the dropdown menu.
4. Wait until the generation is complete.

<img src="assets/menu.png" width="400" alt="Usage Screenshot">

## Settings

You can configure the extension in the **Extensions -> Pollinations Avatar Gen** tab.

<img src="assets/settings.png" width="400" alt="Settings Screenshot">

*   **API Key:** Get a key at [enter.pollinations.ai](https://enter.pollinations.ai).
*   **Text Model:** The LLM used to draft the image prompt (e.g., `OpenAI`, `Qwen`).
*   **Image Model:** The AI model used to generate the avatar (e.g., `Flux`, `Turbo`).
*   **Resolution:** Output size (default `1024x1024`).

## Credits

Powered by **[pollinations.ai](https://pollinations.ai)**.

## License

MIT
