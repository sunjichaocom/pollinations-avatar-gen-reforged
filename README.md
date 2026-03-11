# Pollinations Avatar Gen - Reforged ⚔️

[**简体中文**](README_zh.md) | English

[![Built With Pollinations.ai](https://img.shields.io/badge/Built%20with-Pollinations-8a2be2?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMjQgMTI0Ij48Y2lyY2xlIGN4PSI2MiIgY3k9IjYyIiByPSI2MiIgZmlsbD0iI2ZmZmZmZiIvPjwvc3ZnPg==&logoColor=white&labelColor=6a0dad)](https://pollinations.ai)

> **Acknowledgment**: This is a heavily upgraded, "Reforged" version of the original [Pollinations Avatar Gen](https://github.com/Nidelon/pollinations-avatar-gen) created by **Nidelon**. Huge thanks to the original author for the brilliant foundational concept and the backend saving plugin!

An advanced extension for [SillyTavern](https://github.com/SillyTavern/SillyTavern) that generates character avatars based on their text descriptions using the [Pollinations.ai](https://pollinations.ai) API. 

---

## ✨ What's New in the Reforged Version?

* **🌍 Full i18n Support**: Auto-detects browser language. Currently supports English, Simplified/Traditional Chinese, Japanese, Korean, Russian, and Spanish.
* **🛠️ Robust State Machine Workflow**: Completely overhauled the generation process. No more lost prompts on failure! Safely navigate back and forth between "Extract -> Tweak -> Generate" steps.
* **🎯 Dual UI Entry Points**: Launch via a quick button on the character action row OR from the classic dropdown menu.
* **📚 Prompt Presets & Jailbreak Management**: Save, delete, and switch between your favorite visual styles (e.g., Anime, Realistic, 2.5D) and prompt jailbreaks directly from the settings panel.
* **🏷️ Quick Tags**: Insert custom visual tags (like "cinematic lighting", "high resolution") with a single click during the prompt generation phase. Fully manageable in settings.
* **🖼️ Image Gallery & Magnifier**: Generate up to 5 images at once, preview them in a grid, use the magnifier for a fullscreen view, and select the best one.
* **💰 Balance Check**: Check your Pollen balance directly from the UI.

---

## ⚠️ Prerequisites (Critical Step)

**Before installing the extension**, you must install the server-side plugin `AvatarEdit`. Without it, the extension cannot save the generated images to your server.

1. **Enable Plugins in SillyTavern**
   Open `config.yaml` in your main SillyTavern directory and ensure this line is set:

       enableServerPlugins: true

2. **Install the Server Plugin**
   Navigate to the `plugins` folder inside your SillyTavern directory and clone the helper repository:

       cd plugins
       git clone https://github.com/Nidelon/SillyTavern-AvatarEdit

   *(Restart SillyTavern completely after installing the plugin).*

---

## 📥 Installation

1. Open **[SillyTavern](https://github.com/SillyTavern/SillyTavern)**.
2. Go to the **Extensions** menu (the block icon at the top).
3. Select **"Install extension"**.
4. Paste the link to this repository:

       https://github.com/sunjichaocom/pollinations-avatar-gen-reforged

5. Click **Install**.

---

## 🚀 Usage & Workflow

1. Open a chat with any character.
2. Click the new **Portrait Button** on the top action row, OR click **More...** and select **Deep Custom Avatar** from the dropdown menu.
   <br>
   <img src="assets/menu.png" width="300" alt="Entry Point">

3. Follow the intuitive on-screen workflow: 
   
   **Step 1: Extra Customization Needs**
   Select your quick tags and extraction model. You can even use your currently active SillyTavern Chat Model (Current API) for extraction!
   <br>
   <img src="assets/extra_needs.png" width="350" alt="Extra Needs"> &nbsp; <img src="assets/extra_needs_current.png" width="350" alt="Current Model Override">

   **Step 2: Confirm Visual Prompt**
   Tweak the extracted prompt, select your preferred image generation model, and set the batch size.
   <br>
   <img src="assets/confirm.png" width="400" alt="Confirm Prompt">

   **Step 3: Gallery Selection**
   Once generated, preview all candidates in a grid. Click the magnifier to view them in full resolution, select your favorite, and hit Confirm to save!
   <br>
   <img src="assets/gallery.png" width="400" alt="Gallery Selection">

---

## ⚙️ Settings

You can fully configure the extension in the **Extensions -> Pollinations Avatar Gen** tab.
Here you can manage your API key, check your balance, select AI models, and fully customize your Style Prompts, Jailbreaks, and Quick Tags.

<img src="assets/settings.png" width="400" alt="Settings Panel">

---

## 📜 Credits & License

* Original concept and backend plugin by [Nidelon](https://github.com/Nidelon).
* Reforged frontend architecture, state machine, and UI overhaul by **Sun**.
* Powered by **[pollinations.ai](https://pollinations.ai)**.
* Released under the **MIT License**.