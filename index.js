import { getContext, extension_settings } from "../../../extensions.js";
import { saveSettingsDebounced } from "../../../../script.js";

const extensionName = "pollinations-avatar-gen";

const defaultSettings = {
    pollinationsToken: "", 
    customImageUrl: "https://gen.pollinations.ai/image/",
    customTextUrl: "https://gen.pollinations.ai/v1/chat/completions",
    imageModel: "flux",
    promptModel: "openai",
    quality: "1024x1024"
};

function loadSettings() {
    if (!extension_settings[extensionName]) {
        extension_settings[extensionName] = {};
    }
    extension_settings[extensionName] = Object.assign({}, defaultSettings, extension_settings[extensionName]);
}

async function getVisualPrompt(char) {
    const settings = extension_settings[extensionName];
    
    let apiUrl = settings.customTextUrl;
    if (apiUrl.includes("/text/") && apiUrl.includes("pollinations.ai")) {
        apiUrl = "https://gen.pollinations.ai/v1/chat/completions";
    }
    
    const systemPrompt = `You are an expert prompt engineer for text-to-image AI models like Flux, Stable Diffusion, and Midjourney.
Your task is to analyze the provided character profile and write a highly detailed visual prompt.
Focus STRICTLY on visual elements: subject description (gender, age, facial features, hair style/color, eye color, body type), clothing, accessories, pose, expression, lighting (e.g., cinematic lighting, soft volumetric light), environment/background, and art style (e.g., digital painting, masterpiece, 8k resolution, highly detailed, photorealistic).
CRITICAL: Ensure the character is perfectly framed and centered. Describe a portrait or medium shot where the head and shoulders are fully visible in the frame.
Format the output as a comma-separated list of keywords and short descriptive phrases.
DO NOT include abstract personality traits (e.g., 'kind', 'brave') or the character's name.
DO NOT wrap the output in quotes or add conversational filler. Output ONLY the raw prompt text.`;

    const userPrompt = `Character profile:\nDescription: ${char.description.slice(0, 1500)}\nPersonality: ${char.personality.slice(0, 1000)}\n\nGenerate the visual prompt:`;

    const requestBody = {
        model: settings.promptModel || "openai",
        messages:[
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
        ]
    };

    const headers = { "Content-Type": "application/json" };
    if (settings.pollinationsToken) {
        headers["Authorization"] = `Bearer ${settings.pollinationsToken.trim()}`;
    }

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) return null; 

        const data = await response.json();
        if (data.choices && data.choices.length > 0) {
            return data.choices[0].message.content.trim().replace(/^["']|["']$/g, '').slice(0, 1500);
        }
        return null;
    } catch (e) { 
        return null; 
    }
}

async function convertBlobToPng(blob) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(blob);
        
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            
            canvas.toBlob((pngBlob) => {
                URL.revokeObjectURL(url);
                if (pngBlob) resolve(pngBlob);
                else reject(new Error("Canvas conversion failed"));
            }, 'image/png');
        };
        
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("Image loading failed"));
        };
        
        img.src = url;
    });
}

async function runAvatarGeneration(targetId = null) {
    const context = getContext();
    const charId = targetId ?? context.characterId;
    const chars = context.characters;
    
    if (!chars || !chars[charId]) {
        return toastr.error("Failed to retrieve character data. Please try again.", "Pollinations Avatar Gen");
    }
    const char = chars[charId];
    const settings = extension_settings[extensionName];

    toastr.info("Crafting visual prompt...", "Pollinations Avatar Gen");
    
    let visualPrompt = await getVisualPrompt(char);
    
    if (!visualPrompt) {
        visualPrompt = `Portrait of a character, centered perfectly, head and shoulders in frame, highly detailed, digital art, masterpiece, 8k resolution, cinematic lighting`;
    }

    const seed = Math.floor(Math.random() * 2147483647);
    const [width, height] = settings.quality.split('x');

    let imageUrl = `${settings.customImageUrl}${encodeURIComponent(visualPrompt)}?model=${settings.imageModel}&width=${width}&height=${height}&seed=${seed}&nologo=true`;
    if (settings.pollinationsToken) imageUrl += `&key=${settings.pollinationsToken.trim()}`;

    toastr.info("Drawing image...", "Pollinations Avatar Gen");
    try {
        const response = await fetch(imageUrl);
        
        if (!response.ok) throw new Error(`Image API returned status ${response.status}`);
        
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const errJson = await response.json();
            throw new Error(errJson.error?.message || "Received JSON instead of an image.");
        }
        
        const rawBlob = await response.blob();
        const pngBlob = await convertBlobToPng(rawBlob);

        const formData = new FormData();
        formData.append("avatar", pngBlob, "avatar.png");
        formData.append("avatar_url", char.avatar);
        
        $.ajax({
            url: `/api/plugins/avataredit/edit-avatar`,
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: async function() {
                toastr.success("Avatar updated successfully!", "Pollinations Avatar Gen");
                
                const safeAvatarName = encodeURIComponent(char.avatar);
                const thumbUrl = `/thumbnail?type=avatar&file=${safeAvatarName}&t=${Date.now()}`;
                
                try {
                    await fetch(`/thumbnail?type=avatar&file=${safeAvatarName}`, { method: 'GET', cache: 'reload' });
                } catch (e) {}

                $('img').each(function() {
                    const currentSrc = $(this).attr('src');
                    if (currentSrc && currentSrc.includes(safeAvatarName)) {
                        $(this).attr('src', thumbUrl);
                    }
                });
            },
            error: function() { 
                toastr.error("Failed to save avatar on the server.", "Pollinations Avatar Gen"); 
            }
        });

    } catch (e) { 
        toastr.error("API error or image conversion failed.", "Pollinations Avatar Gen"); 
    }
}

function injectIntoDropdown() {
    const dropdown = document.getElementById('char-management-dropdown');
    if (dropdown && !dropdown.querySelector('.avatar-gen-option')) {
        const option = document.createElement('option');
        option.value = 'generate-avatar';
        option.className = 'avatar-gen-option';
        option.innerText = '✨ Generate Avatar';
        dropdown.appendChild(option);
        
        $(dropdown).on('change', function() {
            if (this.value === 'generate-avatar') {
                this.value = ''; 
                runAvatarGeneration();
            }
        });
    }
}

async function populateModelDropdowns() {
    const textSelect = $('#ag_prompt_model');
    const imageSelect = $('#ag_model');
    const settings = extension_settings[extensionName];

    try {
        const textRes = await fetch('https://gen.pollinations.ai/text/models');
        if (textRes.ok) {
            const textModels = await textRes.json();
            textSelect.empty();
            textModels.forEach(m => {
                const isPaid = m.paid_only ? ' (Paid)' : '';
                const cleanName = m.description ? m.description.split(' - ')[0] : m.name;
                textSelect.append(new Option(`${cleanName}${isPaid}`, m.name));
            });
            if (textSelect.find(`option[value="${settings.promptModel}"]`).length > 0) {
                textSelect.val(settings.promptModel);
            } else {
                textSelect.val('openai');
                settings.promptModel = 'openai';
                saveSettingsDebounced();
            }
        }

        const imgRes = await fetch('https://gen.pollinations.ai/image/models');
        if (imgRes.ok) {
            const imgModels = await imgRes.json();
            imageSelect.empty();
            
            imgModels.filter(m => !m.output_modalities || m.output_modalities.includes('image')).forEach(m => {
                const isPaid = m.paid_only ? ' (Paid)' : '';
                const cleanName = m.description ? m.description.split(' - ')[0] : m.name;
                imageSelect.append(new Option(`${cleanName}${isPaid}`, m.name));
            });
            if (imageSelect.find(`option[value="${settings.imageModel}"]`).length > 0) {
                imageSelect.val(settings.imageModel);
            } else {
                imageSelect.val('flux');
                settings.imageModel = 'flux';
                saveSettingsDebounced();
            }
        }
    } catch (e) {
        if (textSelect.children().length === 0 || textSelect.val() === 'loading') {
            textSelect.empty().append(new Option(settings.promptModel, settings.promptModel));
        }
        if (imageSelect.children().length === 0 || imageSelect.val() === 'loading') {
            imageSelect.empty().append(new Option(settings.imageModel, settings.imageModel));
        }
    }
}

function addSettingsUI() {
    $(".avatar-generator-settings").remove();
    const settings = extension_settings[extensionName];
    
    const html = `
    <div class="avatar-generator-settings">
        <div class="inline-drawer">
            <div class="inline-drawer-toggle inline-drawer-header">
                <b>Pollinations Avatar Gen</b>
                <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
            </div>
            <div class="inline-drawer-content">
                <label>API Key (Pollinations):</label>
                <div style="display: flex; gap: 5px; margin-bottom: 5px;">
                    <a href="https://enter.pollinations.ai/" target="_blank" class="menu_button" style="text-align: center; flex-grow: 1;">Get API Key</a>
                </div>
                <input type="password" id="ag_poll_token" class="text_pole" value="${settings.pollinationsToken}" placeholder="Paste your API Key here">
                
                <label>Text Model (for prompt drafting):</label>
                <select id="ag_prompt_model" class="text_pole">
                    <option value="loading">Loading models...</option>
                </select>
                
                <label>Image Model:</label>
                <select id="ag_model" class="text_pole">
                    <option value="loading">Loading models...</option>
                </select>
                
                <label>Resolution:</label>
                <input type="text" id="ag_quality" class="text_pole" value="${settings.quality}" placeholder="e.g. 1024x1024">
            </div>
        </div>
    </div>`;
    
    $("#extensions_settings").append(html);
    
    $("#ag_poll_token").on("input", function() { settings.pollinationsToken = $(this).val(); saveSettingsDebounced(); });
    $("#ag_prompt_model").on("change", function() { settings.promptModel = $(this).val(); saveSettingsDebounced(); });
    $("#ag_model").on("change", function() { settings.imageModel = $(this).val(); saveSettingsDebounced(); });
    $("#ag_quality").on("input", function() { settings.quality = $(this).val(); saveSettingsDebounced(); });

    populateModelDropdowns();
}

jQuery(() => {
    loadSettings();
    addSettingsUI();
    
    setInterval(() => {
        injectIntoDropdown();
    }, 1000);
});
