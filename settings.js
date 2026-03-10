import { extension_settings } from "../../../extensions.js";
import { saveSettingsDebounced } from "../../../../script.js";
import { defaultPrompts, defaultJailbreaks, defaultQuickTags } from "./presets.js";
import { t } from "./i18n_loader.js";
import { getSettingsHTML, getResetModalTemplate } from "./templates.js";

export const extensionName = "pollinations-avatar-gen-reforged"; 
const TOAST_TITLE = "Pollinations Avatar Gen Reforged";

export const defaultSettings = {
    pollinationsToken: "", customImageUrl: "https://gen.pollinations.ai/image/", customTextUrl: "https://gen.pollinations.ai/v1/chat/completions",
    imageModel: "flux", promptModel: "openai", quality: "1024x1024",
    systemPrompt: defaultPrompts["常规默认 (Default / 通用混合)"], promptPresets: Object.assign({}, defaultPrompts),
    jailbreakPrompt: defaultJailbreaks["通用型 (数据接口伪装)"], jailbreakPresets: Object.assign({}, defaultJailbreaks),
    quickTags: Object.assign({}, defaultQuickTags)
};

// [EN] Loads settings from ST's global storage and applies defaults
// [ZH] 从 ST 全局存储加载设置并应用默认值
export function loadSettings() {
    if (!extension_settings[extensionName]) extension_settings[extensionName] = {};
    extension_settings[extensionName] = Object.assign({}, defaultSettings, extension_settings[extensionName]);
    
    if (!extension_settings[extensionName].promptPresets) extension_settings[extensionName].promptPresets = {};
    if (!extension_settings[extensionName].jailbreakPresets) extension_settings[extensionName].jailbreakPresets = {};
    if (!extension_settings[extensionName].quickTags) extension_settings[extensionName].quickTags = {};

    for (const [k, v] of Object.entries(defaultPrompts)) {
        if (!(k in extension_settings[extensionName].promptPresets)) extension_settings[extensionName].promptPresets[k] = v;
    }
    for (const [k, v] of Object.entries(defaultJailbreaks)) {
        if (!(k in extension_settings[extensionName].jailbreakPresets)) extension_settings[extensionName].jailbreakPresets[k] = v;
    }
    for (const [k, v] of Object.entries(defaultQuickTags)) {
        if (!(k in extension_settings[extensionName].quickTags)) extension_settings[extensionName].quickTags[k] = v;
    }
}

// [EN] API call to check Pollinations account balance
// [ZH] API 请求检查 Pollinations 账号余额
async function checkBalance() {
    const token = extension_settings[extensionName].pollinationsToken;
    if (!token) return toastr.warning(t('toast_need_api_key'), TOAST_TITLE);
    let loading = toastr.info(`<i class="fa-solid fa-spinner fa-spin" style="margin-right:8px;"></i>${t('toast_checking_balance')}`, TOAST_TITLE, { timeOut: 0, extendedTimeOut: 0, tapToDismiss: false, escapeHtml: false });
    try {
        const res = await fetch('https://gen.pollinations.ai/account/balance', { headers: { 'Authorization': `Bearer ${token}` } });
        if (!res.ok) throw new Error();
        const data = await res.json();
        toastr.clear(loading); toastr.success(`${t('toast_balance')} ${data.balance || 0}`, TOAST_TITLE);
    } catch (e) { toastr.clear(loading); toastr.error(t('toast_api_error'), TOAST_TITLE); }
}

// [EN] Fetches available text and image models from Pollinations APIs
// [ZH] 从 Pollinations API 动态获取可用的文本与图像大模型列表
export async function populateModelDropdowns() {
    const textSelect = $('#ag_prompt_model'); const imageSelect = $('#ag_model'); const settings = extension_settings[extensionName];
    try {
        const textRes = await fetch('https://gen.pollinations.ai/text/models');
        if (textRes.ok) {
            const textModels = await textRes.json(); textSelect.empty();
            textSelect.append(new Option(t('opt_st_current_model'), "st_current"));
            textModels.forEach(m => textSelect.append(new Option(`${m.description ? m.description.split(' - ')[0] : m.name}${m.paid_only ? ' (Paid)' : ''}`, m.name)));
            if (textSelect.find(`option[value="${settings.promptModel}"]`).length > 0) textSelect.val(settings.promptModel);
        }
        const imgRes = await fetch('https://gen.pollinations.ai/image/models');
        if (imgRes.ok) {
            const imgModels = await imgRes.json(); imageSelect.empty();
            imgModels.filter(m => !m.output_modalities || m.output_modalities.includes('image')).forEach(m => 
                imageSelect.append(new Option(`${m.description ? m.description.split(' - ')[0] : m.name}${m.paid_only ? ' (Paid)' : ''}`, m.name))
            );
            if (imageSelect.find(`option[value="${settings.imageModel}"]`).length > 0) imageSelect.val(settings.imageModel);
        }
    } catch (e) { }
}

// [EN] Refreshes UI dropdowns and re-injects text values for tags and presets
// [ZH] 刷新下拉菜单 UI，并确保文本框能正确回显选中项的数据
function refreshPresetDropdowns() {
    const settings = extension_settings[extensionName];
    
    // 1. 风格模板 (Style) 同步
    const sysSelect = $("#ag_prompt_preset_select").empty();
    for (const key in settings.promptPresets) sysSelect.append(new Option(key, key));
    let sysMatched = Object.keys(settings.promptPresets).find(k => settings.promptPresets[k] === settings.systemPrompt);
    sysSelect.val(sysMatched || Object.keys(settings.promptPresets)[0]);
    // 强制更新对应文本框
    $("#ag_system_prompt").val(settings.systemPrompt || "");

    // 2. 破甲词 (Jailbreak) 同步
    const jbSelect = $("#ag_jailbreak_select").empty();
    for (const key in settings.jailbreakPresets) jbSelect.append(new Option(key, key));
    let jbMatched = Object.keys(settings.jailbreakPresets).find(k => settings.jailbreakPresets[k] === settings.jailbreakPrompt);
    jbSelect.val(jbMatched || Object.keys(settings.jailbreakPresets)[0]);
    // 强制更新对应文本框
    $("#ag_jailbreak_prompt").val(settings.jailbreakPrompt || "");

    // 3. 快捷标签 (Quick Tags) 同步
    const tagSelect = $("#ag_quick_tag_select").empty();
    for (const key in settings.quickTags) tagSelect.append(new Option(key, key));
    tagSelect.val(Object.keys(settings.quickTags)[0]);
    // 强制更新对应文本框
    $("#ag_quick_tag_content").val(settings.quickTags[Object.keys(settings.quickTags)[0]] || "");
}

// [EN] Mounts the configuration UI inside the SillyTavern extension settings
// [ZH] 在 SillyTavern 侧边栏的扩展设置中挂载配置面板 UI
export function addSettingsUI() {
    $(".avatar-generator-settings").remove();
    const settings = extension_settings[extensionName];
    
    // HTML 渲染时已通过 templates.js 注入了初始 value
    const html = getSettingsHTML(settings, t);
    $("#extensions_settings").append(html);
    
    $("#ag_poll_token").on("input", function() { settings.pollinationsToken = $(this).val(); saveSettingsDebounced(); });
    $("#ag_prompt_model").on("change", function() { settings.promptModel = $(this).val(); saveSettingsDebounced(); });
    $("#ag_model").on("change", function() { settings.imageModel = $(this).val(); saveSettingsDebounced(); });
    $("#ag_quality").on("input", function() { settings.quality = $(this).val(); saveSettingsDebounced(); });
    $("#ag_btn_balance").on("click", checkBalance);

    // 渲染完 DOM 后，强制跑一遍同步逻辑，确保万无一失
    refreshPresetDropdowns();

    // [EN] Quick Tags Management Events / [ZH] 快捷标签管理事件绑定
    $("#ag_quick_tag_content").on("input", function() { const currentKey = $("#ag_quick_tag_select").val(); if (currentKey) { settings.quickTags[currentKey] = $(this).val(); saveSettingsDebounced(); } });
    $("#ag_quick_tag_select").on("change", function() { $("#ag_quick_tag_content").val(settings.quickTags[$(this).val()] || ""); });
    $("#ag_tag_save_btn").on("click", function() { const name = prompt(t('prompt_new_tag'), t('prompt_default_tag')); if (name && name.trim() !== "") { settings.quickTags[name.trim()] = $("#ag_quick_tag_content").val(); saveSettingsDebounced(); refreshPresetDropdowns(); $("#ag_quick_tag_select").val(name.trim()); toastr.success(t('toast_save_success'), TOAST_TITLE); } });
    $("#ag_tag_delete_btn").on("click", function() { const key = $("#ag_quick_tag_select").val(); if (defaultQuickTags[key]) return toastr.error(t('toast_delete_sys_error'), TOAST_TITLE); if (confirm(t('confirm_delete'))) { delete settings.quickTags[key]; saveSettingsDebounced(); refreshPresetDropdowns(); } });
    $("#ag_tag_clear_btn").on("click", function() { $("#ag_quick_tag_content").val("").trigger("input"); });
    $("#ag_tag_reset_btn").on("click", function() { settings.quickTags = Object.assign({}, defaultQuickTags); saveSettingsDebounced(); refreshPresetDropdowns(); toastr.success(t('toast_reset_quick_tags_success'), TOAST_TITLE); });

    // [EN] Jailbreak Prompt Management Events / [ZH] 破甲词管理事件绑定
    $("#ag_jailbreak_prompt").on("input", function() { settings.jailbreakPrompt = $(this).val(); saveSettingsDebounced(); });
    $("#ag_jailbreak_select").on("change", function() { if (settings.jailbreakPresets[$(this).val()] !== undefined) { $("#ag_jailbreak_prompt").val(settings.jailbreakPresets[$(this).val()]); settings.jailbreakPrompt = settings.jailbreakPresets[$(this).val()]; saveSettingsDebounced(); } });
    $("#ag_jb_save_btn").on("click", function() { const name = prompt(t('prompt_new_template'), t('prompt_default_jailbreak')); if (name && name.trim() !== "") { settings.jailbreakPresets[name.trim()] = $("#ag_jailbreak_prompt").val(); saveSettingsDebounced(); refreshPresetDropdowns(); $("#ag_jailbreak_select").val(name.trim()); toastr.success(t('toast_save_success'), TOAST_TITLE); } });
    $("#ag_jb_delete_btn").on("click", function() { const key = $("#ag_jailbreak_select").val(); if (defaultJailbreaks[key]) return toastr.error(t('toast_delete_sys_error'), TOAST_TITLE); if (confirm(t('confirm_delete'))) { delete settings.jailbreakPresets[key]; saveSettingsDebounced(); refreshPresetDropdowns(); $("#ag_jailbreak_prompt").val(settings.jailbreakPresets[Object.keys(settings.jailbreakPresets)[0]]); settings.jailbreakPrompt = $("#ag_jailbreak_prompt").val(); } });
    $("#ag_jb_clear_btn").on("click", function() { $("#ag_jailbreak_prompt").val(""); settings.jailbreakPrompt = ""; saveSettingsDebounced(); });
    $("#ag_jb_reset_btn").on("click", function() { $("#ag_jailbreak_prompt").val(defaultJailbreaks["通用型 (数据接口伪装)"]); settings.jailbreakPrompt = defaultJailbreaks["通用型 (数据接口伪装)"]; saveSettingsDebounced(); refreshPresetDropdowns(); });

    // [EN] Style Prompt Management Events / [ZH] 风格模板管理事件绑定
    $("#ag_system_prompt").on("input", function() { settings.systemPrompt = $(this).val(); saveSettingsDebounced(); });
    $("#ag_prompt_preset_select").on("change", function() { if (settings.promptPresets[$(this).val()]) { $("#ag_system_prompt").val(settings.promptPresets[$(this).val()]); settings.systemPrompt = settings.promptPresets[$(this).val()]; saveSettingsDebounced(); } });
    $("#ag_prompt_save_btn").on("click", function() { const name = prompt(t('prompt_new_template'), t('prompt_default_style')); if (name && name.trim() !== "") { settings.promptPresets[name.trim()] = $("#ag_system_prompt").val(); saveSettingsDebounced(); refreshPresetDropdowns(); $("#ag_prompt_preset_select").val(name.trim()); toastr.success(t('toast_save_success'), TOAST_TITLE); } });
    $("#ag_prompt_delete_btn").on("click", function() { const key = $("#ag_prompt_preset_select").val(); if (defaultPrompts[key]) return toastr.error(t('toast_delete_sys_error'), TOAST_TITLE); if (confirm(t('confirm_delete'))) { delete settings.promptPresets[key]; saveSettingsDebounced(); refreshPresetDropdowns(); $("#ag_system_prompt").val(settings.promptPresets[Object.keys(settings.promptPresets)[0]]); settings.systemPrompt = $("#ag_system_prompt").val(); } });
    $("#ag_prompt_clear_btn").on("click", function() { $("#ag_system_prompt").val(""); settings.systemPrompt = ""; saveSettingsDebounced(); });
    $("#ag_prompt_reset_btn").on("click", function() { $("#ag_system_prompt").val(defaultPrompts["常规默认 (Default / 通用混合)"]); settings.systemPrompt = defaultPrompts["常规默认 (Default / 通用混合)"]; saveSettingsDebounced(); refreshPresetDropdowns(); });

    // [EN] Factory Reset Plugin Events / [ZH] 插件重置初始化事件绑定
    $("#ag_btn_factory_reset").on("click", function() {
        const modalId = "ag-reset-modal-" + Date.now();
        $('body').append(getResetModalTemplate(modalId, t));
        setTimeout(() => $(`#${modalId}`).css('opacity', '1'), 10);
        const close = async () => { $(`#${modalId}`).css('opacity', '0'); await new Promise(r => setTimeout(r, 200)); $(`#${modalId}`).remove(); };
        $(`#${modalId}-cancel`).on('click', close);
        $(`#${modalId}-keep`).on('click', async () => {
            const token = extension_settings[extensionName].pollinationsToken;
            // 彻底清空设置，仅保留 token
            extension_settings[extensionName] = { pollinationsToken: token };
            saveSettingsDebounced(); loadSettings(); addSettingsUI(); 
            toastr.success(t('toast_reset_success'), TOAST_TITLE); await close();
        });
        $(`#${modalId}-full`).on('click', async () => {
            // 彻底清空全部设置
            extension_settings[extensionName] = {};
            saveSettingsDebounced(); loadSettings(); addSettingsUI();
            toastr.success(t('toast_reset_success'), TOAST_TITLE); await close();
        });
    });

    populateModelDropdowns();
}