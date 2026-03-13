import { getContext, extension_settings } from "../../../extensions.js";
import { generateRaw, getRequestHeaders } from "../../../../script.js";
import { extensionName } from "./settings.js";
import { defaultPrompts } from "./presets.js";
import { t } from "./i18n_loader.js";
import { getOverrideModalTemplate, getConfirmPromptTemplate, getSelectImageTemplate } from "./templates.js";

// [EN] Wait for specified milliseconds / [ZH] 暂停执行指定毫秒数（防渲染卡死）
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const TOAST_TITLE = "Pollinations Avatar Gen Reforged";
const STICKY_TOAST_OPTIONS = { timeOut: 0, extendedTimeOut: 0, tapToDismiss: false, escapeHtml: false };

// [EN] Generates HTML buttons for quick tags / [ZH] 根据设置动态生成快捷标签按钮的 HTML
function generateQuickTagsHtml() {
    const tags = extension_settings[extensionName].quickTags || {};
    return Object.entries(tags).map(([name, content]) => 
        `<button class="ag-quick-tag menu_button" data-tag="${content.replace(/"/g, '&quot;')}">${name}</button>`
    ).join('');
}

// 【新增】智能 API Key 路由器 (异步检测复活版)
async function getBestApiKey() {
    const settings = extension_settings[extensionName];
    if (!settings.pollinationsToken) return "";

    const keys = settings.pollinationsToken.split(/[\n,]+/).map(k => k.trim()).filter(k => k.startsWith('sk_'));
    if (keys.length === 0) return "";
    
    if (!settings.keyBalances) settings.keyBalances = {};

    keys.forEach(k => {
        if (typeof settings.keyBalances[k] !== 'number') settings.keyBalances[k] = 1.5;
    });

    let candidateKeys = keys.filter(k => settings.keyBalances[k] > 0);

    // 如果本地缓存里所有合法的 Key 都被扣成了 <= 0，去服务器拉取最新余额验证一下（防误杀，处理周一刷新）
    if (candidateKeys.length === 0) {
        console.log("[Pollinations] 所有 Key 本地缓存已空，正在连接服务器验证最新余额...");
        await Promise.all(keys.map(async (k) => {
            try {
                const res = await fetch('https://gen.pollinations.ai/account/balance', { headers: { 'Authorization': `Bearer ${k}` } });
                if (res.ok) {
                    const data = await res.json();
                    settings.keyBalances[k] = data.balance;
                }
            } catch(e) {}
        }));
        candidateKeys = keys.filter(k => settings.keyBalances[k] > 0);
    }

    // 如果验证完发现还是全军覆没，返回 null，主程序会拦截生图
    if (candidateKeys.length === 0) {
        return null;
    }

    let maxBalance = -Infinity;
    candidateKeys.forEach(k => { if (settings.keyBalances[k] > maxBalance) maxBalance = settings.keyBalances[k]; });

    // 只挑选余额最健康的几个轮询
    const topKeys = candidateKeys.filter(k => settings.keyBalances[k] >= maxBalance - 1);

    settings.lastUsedKeyIndex = ((settings.lastUsedKeyIndex || 0) + 1) % topKeys.length;
    return topKeys[settings.lastUsedKeyIndex];
}

function deductLocalBalance(key, amount) {
    const settings = extension_settings[extensionName];
    if (settings.keyBalances && typeof settings.keyBalances[key] === 'number') {
        settings.keyBalances[key] -= amount; 
    }
}

// 【新增】调用 ST 原生接口，将图片存入角色图库 (Character Gallery)
async function saveToGallery(blob, charName) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64data = reader.result.split(',')[1];
            const filename = `Pollinations_${Date.now()}`;
            try {
                const headers = typeof getRequestHeaders === 'function' ? getRequestHeaders() : { 'Content-Type': 'application/json' };
                const res = await fetch('/api/images/upload', {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify({
                        image: base64data,
                        format: 'png',
                        ch_name: charName,
                        filename: filename
                    })
                });
                resolve(res.ok);
            } catch(e) { resolve(false); }
        };
        reader.onerror = () => resolve(false);
        reader.readAsDataURL(blob);
    });
}

async function inputOverridesUI(initialValue = "") {
    return new Promise((resolve) => {
        const modalId = "ag-override-modal-" + Date.now();
        const tagsHtml = generateQuickTagsHtml(); 
        const textModelOptions = $('#ag_prompt_model').html();
        
        $('body').append(getOverrideModalTemplate(modalId, tagsHtml, textModelOptions, t));
        
        $(`#${modalId}-text`).val(initialValue || "");
        $(`#${modalId}-text-model`).val(extension_settings[extensionName].promptModel);
        
        setTimeout(() => $(`#${modalId}`).css('opacity', '1'), 10);

        $(`#${modalId} .ag-quick-tag`).on('click', function() {
            const tag = $(this).attr('data-tag'); const textarea = document.getElementById(`${modalId}-text`);
            const startPos = textarea.selectionStart; const endPos = textarea.selectionEnd;
            textarea.value = textarea.value.substring(0, startPos) + tag + textarea.value.substring(endPos);
            textarea.focus(); textarea.selectionStart = textarea.selectionEnd = startPos + tag.length;
        });

        $(`#${modalId}-select-all`).on('click', () => { document.getElementById(`${modalId}-text`).focus(); document.getElementById(`${modalId}-text`).select(); });
        $(`#${modalId}-clear`).on('click', () => { $(`#${modalId}-text`).val('').focus(); });

        const close = async (res) => { $(`#${modalId}`).css('opacity', '0'); await sleep(200); $(`#${modalId}`).remove(); resolve(res); };
        $(`#${modalId}-cancel`).on('click', () => close(false));
        $(`#${modalId}-confirm`).on('click', () => { close({ text: $(`#${modalId}-text`).val().trim(), model: $(`#${modalId}-text-model`).val() }); });
    });
}

// [EN] Display Step 2 Modal: Prompt confirmation & Tweaking / [ZH] 弹窗 2：确认提取出的提示词并设定生图参数
async function confirmPromptUI(initialPrompt) {
    return new Promise((resolve) => {
        const modalId = "ag-prompt-modal-" + Date.now();
        const settings = extension_settings[extensionName];
        let modelOptions = ''; $('#ag_model option').each(function() { modelOptions += `<option value="${$(this).val()}">${$(this).text()}</option>`; });
        const tagsHtml = generateQuickTagsHtml(); 

        $('body').append(getConfirmPromptTemplate(modalId, modelOptions, tagsHtml, t));
        
        $(`#${modalId}-text`).val(initialPrompt || '');
        $(`#${modalId}-temp-model`).val(settings.imageModel);
        setTimeout(() => $(`#${modalId}`).css('opacity', '1'), 10);

        $(`#${modalId} .ag-quick-tag`).on('click', function() {
            const tag = $(this).attr('data-tag'); const textarea = document.getElementById(`${modalId}-text`);
            const startPos = textarea.selectionStart; const endPos = textarea.selectionEnd;
            textarea.value = textarea.value.substring(0, startPos) + tag + textarea.value.substring(endPos);
            textarea.focus(); textarea.selectionStart = textarea.selectionEnd = startPos + tag.length;
        });

        $(`#${modalId}-select-all`).on('click', () => { document.getElementById(`${modalId}-text`).focus(); document.getElementById(`${modalId}-text`).select(); });

        const close = async (res) => { $(`#${modalId}`).css('opacity', '0'); await sleep(200); $(`#${modalId}`).remove(); resolve(res); };
        $(`#${modalId}-cancel`).on('click', () => close({ action: 'cancel' }));
        $(`#${modalId}-reextract`).on('click', () => close({ action: 'reextract' }));
        $(`#${modalId}-confirm`).on('click', () => close({ action: 'confirm', text: $(`#${modalId}-text`).val().trim(), tempModel: $(`#${modalId}-temp-model`).val(), batchSize: parseInt($(`#${modalId}-batch`).val()) }));
    });
}

// [EN] Display Step 3 Modal: Select generated image / [ZH] 弹窗 3：展示生成的图片网格并选择
async function selectImageUI(newBlobs, char, pinnedBlobs = []) {
    return new Promise((resolve) => {
        const modalId = "ag-select-modal-" + Date.now();
        const allBlobs = [...pinnedBlobs, ...newBlobs];
        const urls = allBlobs.map(b => URL.createObjectURL(b));
        let selectedIndex = -1;
        let pinnedIndices = new Set(pinnedBlobs.map((_, i) => i));

        const imagesHtml = urls.map((url, idx) => `
            <div style="flex: 1 1 45%; max-width: 48%; position: relative;">
                <img src="${url}" data-idx="${idx}" class="ag-selectable-img">
                <div class="ag-pin-icon ${pinnedIndices.has(idx) ? 'pinned' : ''}" title="保留这张图" data-idx="${idx}"><i class="fa-solid fa-thumbtack"></i></div>
                <div class="ag-mag-icon" title="全屏预览"><i class="fa-solid fa-magnifying-glass"></i></div>
            </div>
        `).join('');

        $('body').append(getSelectImageTemplate(modalId, imagesHtml, allBlobs.length, t));
        setTimeout(() => $(`#${modalId}`).css('opacity', '1'), 10);

        $(`#${modalId} .ag-selectable-img`).on('click', function() { 
            $(`#${modalId} .ag-selectable-img`).removeClass('selected'); 
            $(this).addClass('selected'); 
            selectedIndex = parseInt($(this).attr('data-idx')); 
            $(`#${modalId}-error`).text(""); 
        });
        if (urls.length === 1) $(`#${modalId} .ag-selectable-img`).first().trigger('click');

        $(`#${modalId} .ag-pin-icon`).on('click', function(e) {
            e.stopPropagation();
            const idx = parseInt($(this).attr('data-idx'));
            if (pinnedIndices.has(idx)) { pinnedIndices.delete(idx); $(this).removeClass('pinned'); } 
            else { pinnedIndices.add(idx); $(this).addClass('pinned'); }
        });

        // 缩放与全屏预览逻辑
        let currentFsIndex = 0; let currentScale = 1;
        const fsPreview = $('#ag-fullscreen-preview'); const fsImg = fsPreview.find('img');
        
        const updateFs = (index) => {
            if (index < 0) index = urls.length - 1;
            if (index >= urls.length) index = 0;
            currentFsIndex = index; currentScale = 1; 
            fsImg.css('transform', `scale(${currentScale})`); fsImg.attr('src', urls[currentFsIndex]);
            $(`#${modalId} .ag-selectable-img`).removeClass('selected');
            $(`#${modalId} .ag-selectable-img[data-idx="${currentFsIndex}"]`).addClass('selected');
            selectedIndex = currentFsIndex; $(`#${modalId}-error`).text("");
        };

        $(`#${modalId} .ag-mag-icon`).on('click', function(e) { 
            e.stopPropagation(); 
            updateFs(parseInt($(this).parent().find('.ag-selectable-img').attr('data-idx')));
            fsPreview.css({ display: 'flex', opacity: 0 }).animate({ opacity: 1 }, 200); 
        });

        fsPreview.off('wheel').on('wheel', function(e) {
            e.preventDefault();
            currentScale += e.originalEvent.deltaY * -0.002;
            currentScale = Math.min(Math.max(1, currentScale), 5); 
            fsImg.css('transform', `scale(${currentScale})`);
        });

        let startX = 0, startY = 0, initialDistance = 0, initialScale = 1;
        fsPreview.off('touchstart touchmove touchend click'); 
        fsPreview.on('touchstart', e => { 
            if (e.touches.length === 1) { startX = e.touches[0].screenX; startY = e.touches[0].screenY; } 
            else if (e.touches.length === 2) { initialDistance = Math.hypot(e.touches[0].screenX - e.touches[1].screenX, e.touches[0].screenY - e.touches[1].screenY); initialScale = currentScale; }
        });
        fsPreview.on('touchmove', e => {
            if (e.touches.length === 2) {
                e.preventDefault(); 
                const currentDistance = Math.hypot(e.touches[0].screenX - e.touches[1].screenX, e.touches[0].screenY - e.touches[1].screenY);
                currentScale = Math.min(Math.max(1, initialScale * (currentDistance / initialDistance)), 5);
                fsImg.css('transform', `scale(${currentScale})`);
            }
        });
        fsPreview.on('touchend', e => {
            if (e.changedTouches.length === 1 && currentScale === 1) {
                let endX = e.changedTouches[0].screenX; let endY = e.changedTouches[0].screenY;
                if (Math.abs(endY - startY) > 100) return; 
                if (startX - endX > 50) updateFs(currentFsIndex + 1); 
                else if (endX - startX > 50) updateFs(currentFsIndex - 1); 
            }
        });
        fsPreview.on('click', function(e) {
            if (currentScale > 1) { currentScale = 1; fsImg.css('transform', `scale(${currentScale})`); return; }
            const width = $(window).width(); const clickX = e.clientX;
            if (clickX < width * 0.25) updateFs(currentFsIndex - 1);
            else if (clickX > width * 0.75) updateFs(currentFsIndex + 1);
            else fsPreview.animate({ opacity: 0 }, 200, function() { $(this).css('display', 'none'); });
        });

        const close = async (res) => { 
            if (res.action !== 'retry') { urls.forEach(url => URL.revokeObjectURL(url)); }
            $(`#${modalId}`).css('opacity', '0'); await sleep(200); $(`#${modalId}`).remove(); resolve(res); 
        };
        
        $(`#${modalId}-cancel`).on('click', () => close({ action: 'cancel' }));
        
        // 【新增：一键保存至 ST 原生角色图库】
        $(`#${modalId}-download`).on('click', async () => {
            if (selectedIndex === -1) return $(`#${modalId}-error`).text(t('error_no_selection') || '请先选择一张图片');
            
            const btn = $(`#${modalId}-download`);
            const originalHtml = btn.html();
            btn.html('<i class="fa-solid fa-spinner fa-spin"></i> 保存中...').css('pointer-events', 'none');
            
            const charName = char.avatar ? char.avatar.replace(/\.[^/.]+$/, "") : "unknown";
            const isSuccess = await saveToGallery(allBlobs[selectedIndex], charName);
            
            btn.html(originalHtml).css('pointer-events', 'auto');
            
            // 【修改点】优化了提示文案，明确提示保存的是“当前选中的图片”
            if (isSuccess) toastr.success("✅ 当前选中的图片（绿框）已成功保存至该角色的展示图库！", TOAST_TITLE);
            else toastr.error("❌ 保存图库失败", TOAST_TITLE);
        });

        $(`#${modalId}-retry`).on('click', () => {
            const savedBlobs = Array.from(pinnedIndices).map(idx => allBlobs[idx]);
            close({ action: 'retry', pinned: savedBlobs }); 
        });

        $(`#${modalId}-confirm`).on('click', () => { 
            if (selectedIndex === -1) return $(`#${modalId}-error`).text(t('error_no_selection')); 
            close({ action: 'select', index: selectedIndex, finalBlobs: allBlobs }); 
        });
    });
}

// [EN] Fetch visual prompt from selected LLM / [ZH] 调用文本模型提取画面提示词
async function getVisualPrompt(char, userOverrides, textModel) {
    const settings = extension_settings[extensionName];
    const jbText = (settings.jailbreakPrompt || "").trim();
    const sysText = (settings.systemPrompt || defaultPrompts["常规默认 (Default / 通用混合)"]).trim();
    const finalSystemPrompt = jbText ? `${jbText}\n\n---\n\n${sysText}` : sysText;

    let userPrompt = `Character profile:\nDescription: ${char.description || ''}\nPersonality: ${char.personality || ''}\n`;
    if (userOverrides) userPrompt += `\n-----------------------------------\n[CRITICAL USER OVERRIDES / MANDATORY REQUIREMENTS]\n${userOverrides}\n-----------------------------------\nINSTRUCTIONS: \nGenerate the visual prompt based on the Character profile above. HOWEVER, you MUST strictly apply the [CRITICAL USER OVERRIDES]. If any detail contradicts the overrides, the overrides take absolute priority.\n`;
    userPrompt += `\nGenerate the visual prompt (OUTPUT ONLY TAGS):`;

    if (textModel === "st_current") {
        try {
            if (typeof generateRaw !== 'function') return { error: t('err_st_version_low') };
            const query = `[SYSTEM INSTRUCTION]\n${finalSystemPrompt}\n\n[USER INPUT]\n${userPrompt}`;
            
            const otherPluginName = 'st-image-auto-generation';
            let wasOtherPluginEnabled = false;
            if (extension_settings[otherPluginName] && extension_settings[otherPluginName].promptInjection) {
                wasOtherPluginEnabled = extension_settings[otherPluginName].promptInjection.enabled;
                extension_settings[otherPluginName].promptInjection.enabled = false;
            }

            const result = await generateRaw(query);

            if (extension_settings[otherPluginName] && extension_settings[otherPluginName].promptInjection) {
                extension_settings[otherPluginName].promptInjection.enabled = wasOtherPluginEnabled;
            }

            if (!result || typeof result !== 'string') return { error: t('err_st_no_return') };

            let cleanResult = result.trim();
            const picMatch = cleanResult.match(/<pic[^>]*\sprompt="([^"]*)"[^>]*?>/i);
            if (picMatch) cleanResult = picMatch[1];
            return { text: cleanResult.replace(/^["']|["']$/g, '') };
        } catch (e) { return { error: t('err_st_exception') + e.message }; }
    }

    let apiUrl = settings.customTextUrl;
    if (apiUrl.includes("/text/") && apiUrl.includes("pollinations.ai")) apiUrl = "https://gen.pollinations.ai/v1/chat/completions";
    const requestBody = { model: textModel || "openai", messages:[ { role: "system", content: finalSystemPrompt }, { role: "user", content: userPrompt } ] };
    
    const headers = { "Content-Type": "application/json" };
    
    const selectedKey = await getBestApiKey();
    if (selectedKey === null) return { error: "当前所有 API Key 的余额均已耗尽，请补充新 Key 或等待刷新。" };
    
    if (selectedKey) headers["Authorization"] = `Bearer ${selectedKey}`;

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 40000); 
        const response = await fetch(apiUrl, { method: "POST", headers: headers, body: JSON.stringify(requestBody), signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) {
            if (response.status === 401 || response.status === 403 || response.status === 429) {
                if (selectedKey) deductLocalBalance(selectedKey, 9999);
            }
            return { error: t('err_server_http') + response.status + ")" }; 
        }

        const data = await response.json();
        if (data.choices && data.choices.length > 0) {
            if (selectedKey) deductLocalBalance(selectedKey, 1);
            
            const rawContent = data.choices[0].message.content.trim();
            const checkContent = rawContent.toLowerCase();
            if (checkContent.startsWith("i'm sorry") || checkContent.startsWith("sorry") || checkContent.includes("cannot fulfill") || checkContent.includes("as an ai") || checkContent.includes("抱歉") || checkContent.includes("无法满足")) {
                return { error: t('err_censorship') };
            }
            return { text: rawContent.replace(/^["']|["']$/g, '') };
        }
        return { error: t('err_api_empty') };
    } catch (e) { return { error: t('err_timeout') }; }
}

// [EN] Fetch multiple images concurrently / [ZH] 并发请求生成多张图片
async function fetchMultipleImages(prompt, count, tempModel) {
    const settings = extension_settings[extensionName];
    const [width, height] = settings.quality.split('x');
    const promises = [];
    
    const selectedKey = await getBestApiKey();
    if (selectedKey === null) return null;

    const tokenStr = selectedKey ? `&key=${selectedKey}` : '';

    for (let i = 0; i < count; i++) {
        const seed = Math.floor(Math.random() * 2147483647);
        let imageUrl = `${settings.customImageUrl}${encodeURIComponent(prompt)}?model=${tempModel}&width=${width}&height=${height}&seed=${seed}&nologo=true${tokenStr}`;
        promises.push(
            fetch(imageUrl).then(async response => {
                if (!response.ok) throw new Error(`Status ${response.status}`);
                if (response.headers.get("content-type")?.includes("application/json")) throw new Error("Received JSON");
                return await response.blob();
            }).catch(e => { return null; })
        );
    }
    const results = await Promise.all(promises);
    const validResults = results.filter(b => b !== null);
    
    // 生图成功后，按生成成功的张数假扣费
    if (selectedKey && validResults.length > 0) {
        deductLocalBalance(selectedKey, validResults.length);
    }
    
    return validResults; 
}

// [EN] Convert remote Blob to local PNG Canvas / [ZH] 转换图像格式以供保存
async function convertBlobToPng(blob) {
    return new Promise((resolve, reject) => {
        const img = new Image(); const url = URL.createObjectURL(blob);
        img.onload = () => {
            const canvas = document.createElement('canvas'); canvas.width = img.width; canvas.height = img.height;
            const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0);
            canvas.toBlob((pngBlob) => { URL.revokeObjectURL(url); if (pngBlob) resolve(pngBlob); else reject(new Error("Canvas failed")); }, 'image/png');
        };
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Image load failed")); }; img.src = url;
    });
}

// [EN] Upload Avatar to ST server / [ZH] 将生成的头像保存替换至 ST 服务器
async function saveAvatarToServer(rawBlob, char) {
    return new Promise(async (resolve) => {
        try {
            const pngBlob = await convertBlobToPng(rawBlob);
            const formData = new FormData(); formData.append("avatar", pngBlob, "avatar.png"); formData.append("avatar_url", char.avatar);
            $.ajax({
                url: `/api/plugins/avataredit/edit-avatar`, type: 'POST', data: formData, processData: false, contentType: false,
                success: async function() {
                    const safeAvatarName = encodeURIComponent(char.avatar);
                    const thumbUrl = `/thumbnail?type=avatar&file=${safeAvatarName}&t=${Date.now()}`;
                    try { await fetch(`/thumbnail?type=avatar&file=${safeAvatarName}`, { method: 'GET', cache: 'reload' }); } catch (e) {}
                    $('img').each(function() { if ($(this).attr('src')?.includes(safeAvatarName)) $(this).attr('src', thumbUrl); });
                    resolve(true);
                },
                error: function() { resolve(false); }
            });
        } catch (e) { resolve(false); }
    });
}

// [EN] Core Workflow State Machine / [ZH] 插件主流程核心状态机
export async function runAvatarGeneration(targetId = null) {
    try {
        const context = getContext(); const charId = targetId ?? context.characterId; const chars = context.characters;
        if (!chars || !chars[charId]) return toastr.error(t('err_failed'), TOAST_TITLE);
        const char = chars[charId];

        let userOverrides = ""; let currentVisualPrompt = ""; let needNewPrompt = true;
        let globalPinnedBlobs = []; 

        while (true) {
            if (needNewPrompt) {
                const overrideResult = await inputOverridesUI(userOverrides);
                if (!overrideResult) return toastr.info(t('toast_cancelled'), TOAST_TITLE); 
                
                userOverrides = overrideResult.text;
                const selectedTextModel = overrideResult.model;
                
                let loadingToast = toastr.info(`<i class="fa-solid fa-spinner fa-spin" style="margin-right:8px;"></i>${t('toast_extracting')}`, TOAST_TITLE, STICKY_TOAST_OPTIONS);
                let promptResult = await getVisualPrompt(char, userOverrides, selectedTextModel); 
                toastr.clear(loadingToast); 
                
                if (promptResult.error) { toastr.error(promptResult.error, TOAST_TITLE); currentVisualPrompt = `1girl, masterpiece, best quality`; } 
                else { currentVisualPrompt = promptResult.text; }
                needNewPrompt = false; 
            }

            const confirmResult = await confirmPromptUI(currentVisualPrompt);
            if (confirmResult.action === 'cancel') return;
            if (confirmResult.action === 'reextract') { needNewPrompt = true; continue; }
            currentVisualPrompt = confirmResult.text;

            let loadingToast = toastr.info(`<i class="fa-solid fa-circle-notch fa-spin" style="margin-right:8px;"></i>${t('toast_generating')}`, TOAST_TITLE, STICKY_TOAST_OPTIONS);
            let blobs = await fetchMultipleImages(currentVisualPrompt, confirmResult.batchSize, confirmResult.tempModel); 
            toastr.clear(loadingToast); 
            
            if (blobs === null) { toastr.error("当前所有 API Key 的余额均已耗尽，请补充新 Key 或等待刷新。", TOAST_TITLE); return; }
            if (blobs.length === 0) { toastr.error(t('toast_gen_failed'), TOAST_TITLE); continue; }

            const selection = await selectImageUI(blobs, char, globalPinnedBlobs);
            if (selection.action === 'cancel') return;
            if (selection.action === 'retry') { 
                globalPinnedBlobs = selection.pinned; 
                continue; 
            } 
            if (selection.action === 'select') {
                loadingToast = toastr.info(`<i class="fa-solid fa-cog fa-spin" style="margin-right:8px;"></i>${t('toast_saving')}`, TOAST_TITLE, STICKY_TOAST_OPTIONS);
                const isSuccess = await saveAvatarToServer(selection.finalBlobs[selection.index], char); 
                toastr.clear(loadingToast); 
                if (isSuccess) toastr.success(t('toast_avatar_success'), TOAST_TITLE); 
                else toastr.error(t('toast_save_failed'), TOAST_TITLE);
                return;
            }
        }
    } catch (error) { toastr.error(t('toast_sys_error'), TOAST_TITLE); }
}