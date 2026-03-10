// [EN] Renders the main settings panel in the extensions drawer
// [ZH] 渲染侧边栏扩展设置主面板
export const getSettingsHTML = (settings, t) => `
<div class="avatar-generator-settings">
    <div class="inline-drawer">
        <div class="inline-drawer-toggle inline-drawer-header">
            <b>${t('ext_title')}</b>
            <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
        </div>
        <div class="inline-drawer-content">
            <label>${t('api_key_label')}</label>
            <div style="display: flex; gap: 5px; margin-bottom: 5px;">
                <a href="https://enter.pollinations.ai/" target="_blank" class="menu_button" style="text-align: center; flex-grow: 1;">${t('get_api_key')}</a>
                <button id="ag_btn_balance" class="menu_button" style="flex-grow: 1;">${t('check_balance')}</button>
            </div>
            <textarea id="ag_poll_token" class="text_pole" placeholder="API Key 1\nAPI Key 2" style="width: 100%; height: 50px; resize: vertical; font-size: 12px; margin-bottom: 5px;">${settings.pollinationsToken || ""}</textarea>
            
            <hr style="margin: 15px 0; border-color: rgba(255,255,255,0.1);">
            
            <label style="color: #03a9f4;">${t('quick_tags_label')}</label>
            <div style="display: flex; gap: 5px; margin-bottom: 5px;">
                <select id="ag_quick_tag_select" class="text_pole" style="flex-grow: 1;"></select>
                <button id="ag_tag_save_btn" class="menu_button" title="${t('btn_save')}"><i class="fa-solid fa-floppy-disk"></i></button>
                <button id="ag_tag_delete_btn" class="menu_button" title="${t('btn_delete')}"><i class="fa-solid fa-trash"></i></button>
            </div>
            <textarea id="ag_quick_tag_content" class="text_pole" style="width: 100%; height: 50px; resize: vertical; margin-bottom: 5px; font-size: 13px; border-left: 3px solid #03a9f4;"></textarea>
            <div style="display: flex; gap: 5px; margin-bottom: 15px;">
                <button id="ag_tag_clear_btn" class="menu_button" style="flex: 1;"><i class="fa-solid fa-eraser"></i> ${t('btn_clear')}</button>
                <button id="ag_tag_reset_btn" class="menu_button" style="flex: 1;"><i class="fa-solid fa-rotate-left"></i> ${t('btn_reset')}</button>
            </div>

            <label style="color: #ff9800;">${t('jailbreak_label')}</label>
            <div style="display: flex; gap: 5px; margin-bottom: 5px;">
                <select id="ag_jailbreak_select" class="text_pole" style="flex-grow: 1;"></select>
                <button id="ag_jb_save_btn" class="menu_button" title="${t('btn_save')}"><i class="fa-solid fa-floppy-disk"></i></button>
                <button id="ag_jb_delete_btn" class="menu_button" title="${t('btn_delete')}"><i class="fa-solid fa-trash"></i></button>
            </div>
            <textarea id="ag_jailbreak_prompt" class="text_pole" style="width: 100%; height: 70px; resize: vertical; margin-bottom: 5px; font-size: 12px; border-left: 3px solid #ff9800;">${settings.jailbreakPrompt || ""}</textarea>
            <div style="display: flex; gap: 5px; margin-bottom: 15px;">
                <button id="ag_jb_clear_btn" class="menu_button" style="flex: 1;"><i class="fa-solid fa-eraser"></i> ${t('btn_clear')}</button>
                <button id="ag_jb_reset_btn" class="menu_button" style="flex: 1;"><i class="fa-solid fa-rotate-left"></i> ${t('btn_reset')}</button>
            </div>
            
            <label style="color: #4CAF50;">${t('style_prompt_label')}</label>
            <div style="display: flex; gap: 5px; margin-bottom: 5px;">
                <select id="ag_prompt_preset_select" class="text_pole" style="flex-grow: 1;"></select>
                <button id="ag_prompt_save_btn" class="menu_button" title="${t('btn_save')}"><i class="fa-solid fa-floppy-disk"></i></button>
                <button id="ag_prompt_delete_btn" class="menu_button" title="${t('btn_delete')}"><i class="fa-solid fa-trash"></i></button>
            </div>
            <textarea id="ag_system_prompt" class="text_pole" style="width: 100%; height: 160px; resize: vertical; margin-bottom: 5px; font-size: 13px; border-left: 3px solid #4CAF50;">${settings.systemPrompt || ""}</textarea>
            <div style="display: flex; gap: 5px;">
                <button id="ag_prompt_clear_btn" class="menu_button" style="flex: 1;"><i class="fa-solid fa-eraser"></i> ${t('btn_clear')}</button>
                <button id="ag_prompt_reset_btn" class="menu_button" style="flex: 1;"><i class="fa-solid fa-rotate-left"></i> ${t('btn_reset')}</button>
            </div>

            <hr style="margin: 15px 0; border-color: rgba(255,255,255,0.1);">
            
            <label>${t('text_model_label')}</label>
            <select id="ag_prompt_model" class="text_pole"><option value="loading">${t('loading_models')}</option></select>
            
            <label>${t('image_model_label')}</label>
            <select id="ag_model" class="text_pole"><option value="loading">${t('loading_models')}</option></select>
            
            <label>${t('resolution_label')}</label>
            <input type="text" id="ag_quality" class="text_pole" value="${settings.quality || ""}">

            <hr style="margin: 15px 0; border-color: rgba(255,255,255,0.1);">
            <button id="ag_btn_factory_reset" class="menu_button" style="width: 100%; background: rgba(244, 67, 54, 0.15); color: #ff5252; border: 1px solid #f44336;">
                <i class="fa-solid fa-triangle-exclamation"></i> ${t('btn_factory_reset')}
            </button>

            <div style="text-align: center; margin-top: 25px; margin-bottom: 5px; font-size: 12px; color: var(--SmartThemeBodyColor); opacity: 0.6; line-height: 1.6;">
                Reforged with ⚔️ by <a href="https://github.com/sunjichaocom/pollinations-avatar-gen-reforged" target="_blank" style="color: inherit; font-weight: bold; text-decoration: none; border-bottom: 1px dashed rgba(255,255,255,0.4);">Sun</a><br>
                <span style="font-size: 11px; opacity: 0.8;">Based on original work by <a href="https://github.com/Nidelon/pollinations-avatar-gen" target="_blank" style="color: inherit; text-decoration: none; border-bottom: 1px dashed rgba(255,255,255,0.4);">Nidelon</a></span>
            </div>
        </div>
    </div>
</div>`;

// [EN] Renders the plugin factory reset modal
// [ZH] 渲染插件初始化确认弹窗
export const getResetModalTemplate = (modalId, t) => `
<div id="${modalId}" class="ag-modal-overlay">
    <div class="ag-modal-box" style="max-width: 400px; text-align: center;">
        <h3 style="margin-top: 0; color: #f44336;">${t('modal_reset_title')}</h3>
        <p style="font-size: 14px; color: #ccc; margin-bottom: 20px;">${t('modal_reset_desc')}</p>
        <div style="display: flex; flex-direction: column; gap: 10px;">
            <button id="${modalId}-keep" class="menu_button ag-btn-retry">${t('btn_reset_keep_key')}</button>
            <button id="${modalId}-full" class="menu_button" style="padding: 10px; background: #f44336; color: white; border: none; border-radius: 5px;">${t('btn_reset_full')}</button>
            <button id="${modalId}-cancel" class="menu_button ag-btn-cancel">${t('modal_cancel')}</button>
        </div>
    </div>
</div>`;

// [EN] Renders the step 1 modal for extra prompt overrides
// [ZH] 渲染步骤 1 (额外需求定制) 弹窗
export const getOverrideModalTemplate = (modalId, tagsHtml, textModelOptions, t) => `
<div id="${modalId}" class="ag-modal-overlay">
    <div class="ag-modal-box">
        <h3 style="margin-top: 0; text-align: center; color: #4CAF50;"><i class="fa-solid fa-wand-magic-sparkles"></i> ${t('modal_extra_needs_title')}</h3>
        
        <div style="display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 10px; max-height: 120px; overflow-y: auto; padding-right: 5px;">
            ${tagsHtml}
        </div>
        
        <div style="display: flex; justify-content: flex-end; gap: 8px; margin-bottom: 8px;">
            <button id="${modalId}-select-all" class="menu_button" style="padding: 4px 10px; font-size: 12px; background: rgba(255,255,255,0.1); border-radius: 4px;"><i class="fa-solid fa-check-double"></i> ${t('btn_select_all')}</button>
            <button id="${modalId}-clear" class="menu_button" style="padding: 4px 10px; font-size: 12px; background: rgba(244,67,54,0.2); color: #ff5252; border-radius: 4px;"><i class="fa-solid fa-trash"></i> ${t('btn_clear_text')}</button>
        </div>
        
        <textarea id="${modalId}-text" class="ag-textarea"></textarea>
        
        <div style="margin-top: 10px;">
            <label style="font-size: 12px; color: #aaa; margin-bottom: 4px; display: block;">${t('modal_text_model')}</label>
            <select id="${modalId}-text-model" class="ag-select">${textModelOptions}</select>
        </div>

        <div style="display: flex; justify-content: space-between; gap: 10px; margin-top: 20px;">
            <button id="${modalId}-cancel" class="menu_button ag-btn-cancel" style="flex: 1;">${t('modal_cancel')}</button>
            <button id="${modalId}-confirm" class="menu_button ag-btn-confirm" style="flex: 1.5;">${t('modal_extract')} <i class="fa-solid fa-arrow-right"></i></button>
        </div>
    </div>
</div>`;

// [EN] Renders the step 2 modal for prompt confirmation
// [ZH] 渲染步骤 2 (提示词确认与生图设置) 弹窗
export const getConfirmPromptTemplate = (modalId, modelOptions, tagsHtml, t) => `
<div id="${modalId}" class="ag-modal-overlay">
    <div class="ag-modal-box">
        <h3 style="margin-top: 0; text-align: center;">📝 ${t('modal_confirm_title')}</h3>
        
        <div style="display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 10px; max-height: 120px; overflow-y: auto; padding-right: 5px;">
            ${tagsHtml}
        </div>
        
        <div style="display: flex; justify-content: flex-end; margin-bottom: 8px;">
            <button id="${modalId}-select-all" class="menu_button" style="padding: 4px 10px; font-size: 12px; background: rgba(255,255,255,0.1); border-radius: 4px;"><i class="fa-solid fa-check-double"></i> ${t('btn_select_all')}</button>
        </div>
        
        <textarea id="${modalId}-text" class="ag-textarea"></textarea>
        
        <div style="margin-top: 10px;">
            <label style="font-size: 12px; color: #aaa; margin-bottom: 4px; display: block;">${t('modal_temp_model')}</label>
            <select id="${modalId}-temp-model" class="ag-select">${modelOptions}</select>
        </div>
        
        <div style="margin-top: 10px;">
            <label style="font-size: 12px; color: #aaa; margin-bottom: 4px; display: block;">${t('modal_batch_size')}</label>
            <select id="${modalId}-batch" class="ag-select">
                ${[1,2,3,4,5].map(n => `<option value="${n}" ${n===5?'selected':''}>${n} 张</option>`).join('')}
            </select>
        </div>
        
        <div style="display: flex; justify-content: space-between; gap: 8px; margin-top: 20px;">
            <button id="${modalId}-cancel" class="menu_button ag-btn-cancel" style="flex: 1;">${t('modal_cancel')}</button>
            <button id="${modalId}-reextract" class="menu_button ag-btn-retry" style="flex: 1;">${t('modal_reextract')}</button>
            <button id="${modalId}-confirm" class="menu_button ag-btn-confirm" style="flex: 1.5;">🚀 ${t('modal_start_gen')}</button>
        </div>
    </div>
</div>`;

// [EN] Renders the step 3 modal for image selection
// [ZH] 渲染步骤 3 (生成结果选图) 弹窗
export const getSelectImageTemplate = (modalId, imagesHtml, count, t) => `
<div id="${modalId}" class="ag-modal-overlay">
    <div class="ag-modal-box" style="max-width: 600px;">
        <h3 style="margin-top: 0; text-align: center;">🖼️ ${t('modal_gallery_title')} (${count})</h3>
        
        <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; max-height: 45vh; overflow-y: auto; padding: 5px;">
            ${imagesHtml}
        </div>
        
        <div id="${modalId}-error" style="text-align: center; color: #ff5252; height: 20px; margin-top: 5px; font-weight: bold;"></div>
        <div style="display: flex; justify-content: space-between; gap: 8px; margin-top: 10px; flex-wrap: wrap;">
            <button id="${modalId}-cancel" class="menu_button ag-btn-cancel" style="flex: 1; min-width: 25%;">${t('modal_cancel')}</button>
            <button id="${modalId}-retry" class="menu_button ag-btn-retry" style="flex: 1; min-width: 30%;">🔙 ${t('modal_retry')}</button>
            <button id="${modalId}-confirm" class="menu_button ag-btn-confirm" style="flex: 1.5; min-width: 30%;">✅ ${t('modal_confirm_replace')}</button>
        </div>
    </div>
</div>`;