// [EN] Renders the main settings panel in the extensions drawer
// [ZH] 渲染侧边栏扩展设置主面板
export const getSettingsHTML = (settings, t) => `
<div class="avatar-generator-settings">
    <div class="inline-drawer">
        <div class="inline-drawer-toggle inline-drawer-header">
            <b>${t('ext_title') || 'Pollinations 高级头像生成'}</b>
            <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
        </div>
        <div class="inline-drawer-content">
            <label>${t('api_key_label') || 'API Key (支持查余额):'}</label>
            <div style="display: flex; gap: 5px; margin-bottom: 5px;">
                <a href="https://enter.pollinations.ai/" target="_blank" class="menu_button" style="text-align: center; flex-grow: 1;">${t('get_api_key') || '获取 API Key'}</a>
                <button id="ag_btn_balance" class="menu_button" style="flex-grow: 1;"><i class="fa-regular fa-gem" style="color: #00bcd4;"></i> ${t('check_balance') || '查余额'}</button>
            </div>
            <textarea id="ag_poll_token" class="text_pole" placeholder="API Key 1\nAPI Key 2" style="width: 100%; height: 50px; resize: vertical; font-size: 12px; margin-bottom: 5px;">${settings.pollinationsToken || ""}</textarea>
            
            <hr style="margin: 15px 0; border-color: rgba(255,255,255,0.1);">
            
            <label style="color: #03a9f4;">${t('quick_tags_label') || '快捷标签管理 (Quick Tags):'}</label>
            <div style="display: flex; gap: 5px; margin-bottom: 5px;">
                <select id="ag_quick_tag_select" class="text_pole" style="flex-grow: 1;"></select>
                <button id="ag_tag_save_btn" class="menu_button" title="${t('btn_save') || '保存'}"><i class="fa-solid fa-floppy-disk"></i></button>
                <button id="ag_tag_delete_btn" class="menu_button" title="${t('btn_delete') || '删除'}"><i class="fa-solid fa-trash"></i></button>
            </div>
            <textarea id="ag_quick_tag_content" class="text_pole" style="width: 100%; height: 50px; resize: vertical; margin-bottom: 5px; font-size: 13px; border-left: 3px solid #03a9f4;"></textarea>
            <div style="display: flex; gap: 5px; margin-bottom: 15px;">
                <button id="ag_tag_clear_btn" class="menu_button" style="flex: 1;"><i class="fa-solid fa-eraser"></i> ${t('btn_clear') || '清空'}</button>
                <button id="ag_tag_reset_btn" class="menu_button" style="flex: 1;"><i class="fa-solid fa-rotate-left"></i> ${t('btn_reset') || '恢复默认'}</button>
            </div>

            <label style="color: #ff9800;">${t('jailbreak_label') || '魔法破甲词 (Jailbreak / 提高提取成功率):'}</label>
            <div style="display: flex; gap: 5px; margin-bottom: 5px;">
                <select id="ag_jailbreak_select" class="text_pole" style="flex-grow: 1;"></select>
                <button id="ag_jb_save_btn" class="menu_button" title="${t('btn_save') || '保存'}"><i class="fa-solid fa-floppy-disk"></i></button>
                <button id="ag_jb_delete_btn" class="menu_button" title="${t('btn_delete') || '删除'}"><i class="fa-solid fa-trash"></i></button>
            </div>
            <textarea id="ag_jailbreak_prompt" class="text_pole" style="width: 100%; height: 70px; resize: vertical; margin-bottom: 5px; font-size: 12px; border-left: 3px solid #ff9800;">${settings.jailbreakPrompt || ""}</textarea>
            <div style="display: flex; gap: 5px; margin-bottom: 15px;">
                <button id="ag_jb_clear_btn" class="menu_button" style="flex: 1;"><i class="fa-solid fa-eraser"></i> ${t('btn_clear') || '清空'}</button>
                <button id="ag_jb_reset_btn" class="menu_button" style="flex: 1;"><i class="fa-solid fa-rotate-left"></i> ${t('btn_reset') || '恢复默认'}</button>
            </div>
            
            <label style="color: #4CAF50;">${t('style_prompt_label') || '提取规则模板 (Style Prompt):'}</label>
            <div style="display: flex; gap: 5px; margin-bottom: 5px;">
                <select id="ag_prompt_preset_select" class="text_pole" style="flex-grow: 1;"></select>
                <button id="ag_prompt_save_btn" class="menu_button" title="${t('btn_save') || '保存'}"><i class="fa-solid fa-floppy-disk"></i></button>
                <button id="ag_prompt_delete_btn" class="menu_button" title="${t('btn_delete') || '删除'}"><i class="fa-solid fa-trash"></i></button>
            </div>
            <textarea id="ag_system_prompt" class="text_pole" style="width: 100%; height: 160px; resize: vertical; margin-bottom: 5px; font-size: 13px; border-left: 3px solid #4CAF50;">${settings.systemPrompt || ""}</textarea>
            <div style="display: flex; gap: 5px;">
                <button id="ag_prompt_clear_btn" class="menu_button" style="flex: 1;"><i class="fa-solid fa-eraser"></i> ${t('btn_clear') || '清空'}</button>
                <button id="ag_prompt_reset_btn" class="menu_button" style="flex: 1;"><i class="fa-solid fa-rotate-left"></i> ${t('btn_reset') || '恢复默认'}</button>
            </div>

            <hr style="margin: 15px 0; border-color: rgba(255,255,255,0.1);">
            
            <label>${t('text_model_label') || '文本大模型 (特征提取):'}</label>
            <select id="ag_prompt_model" class="text_pole"><option value="loading">${t('loading_models') || '加载中...'}</option></select>
            
            <label>${t('image_model_label') || '生图大模型 (出图画师):'}</label>
            <select id="ag_model" class="text_pole"><option value="loading">${t('loading_models') || '加载中...'}</option></select>
            
            <label>${t('resolution_label') || '分辨率 (Resolution):'}</label>
            <input type="text" id="ag_quality" class="text_pole" value="${settings.quality || ""}">

            <hr style="margin: 15px 0; border-color: rgba(255,255,255,0.1);">
            <button id="ag_btn_factory_reset" class="menu_button" style="width: 100%; background: rgba(244, 67, 54, 0.15); color: #ff5252; border: 1px solid #f44336;">
                <i class="fa-solid fa-triangle-exclamation"></i> ${t('btn_factory_reset') || '插件初始化'}
            </button>

            <div style="text-align: center; margin-top: 25px; margin-bottom: 5px; font-size: 12px; color: var(--SmartThemeBodyColor); opacity: 0.6; line-height: 1.6;">
                Reforged with ⚔️ by <a href="https://github.com/sunjichaocom/pollinations-avatar-gen-reforged" target="_blank" style="color: inherit; font-weight: bold; text-decoration: none; border-bottom: 1px dashed rgba(255,255,255,0.4);">Sun</a><br>
                <span style="font-size: 11px; opacity: 0.8;">Based on original work by <a href="https://github.com/Nidelon/pollinations-avatar-gen" target="_blank" style="color: inherit; text-decoration: none; border-bottom: 1px dashed rgba(255,255,255,0.4);">Nidelon</a></span><br>
                <span id="ag_version_info" style="font-size: 10px; opacity: 0.5; font-family: monospace; letter-spacing: 0.5px;">Loading version...</span>
            </div>
        </div>
    </div>
</div>`;

// [EN] Renders the plugin factory reset modal
// [ZH] 渲染插件初始化确认弹窗
export const getResetModalTemplate = (modalId, t) => `
<div id="${modalId}" class="ag-modal-overlay">
    <div class="ag-modal-box" style="max-width: 400px; text-align: center;">
        <h3 style="margin-top: 0; color: #f44336;">${t('modal_reset_title') || '确认初始化插件？'}</h3>
        <p style="font-size: 14px; color: #ccc; margin-bottom: 20px;">${t('modal_reset_desc') || '此操作将恢复所有预设和设置到默认状态。'}</p>
        <div style="display: flex; flex-direction: column; gap: 10px;">
            <button id="${modalId}-keep" class="menu_button ag-action-btn ag-btn-retry"><i class="fa-solid fa-key"></i> ${t('btn_reset_keep_key') || '保留 API Key 并初始化'}</button>
            <button id="${modalId}-full" class="menu_button" style="padding: 10px; background: #f44336; color: white; border: none; border-radius: 5px;"><i class="fa-solid fa-bomb"></i> ${t('btn_reset_full') || '彻底清空所有数据'}</button>
            <button id="${modalId}-cancel" class="menu_button ag-action-btn ag-btn-cancel"><i class="fa-solid fa-xmark"></i> ${t('modal_cancel') || '取消'}</button>
        </div>
    </div>
</div>`;

// [EN] Renders the step 1 modal for extra prompt overrides
// [ZH] 渲染步骤 1 (额外需求定制) 弹窗
export const getOverrideModalTemplate = (modalId, tagsHtml, textModelOptions, t) => `
<div id="${modalId}" class="ag-modal-overlay">
    <div class="ag-modal-box">
        <h3 style="margin-top: 0; text-align: center; color: #4CAF50;"><i class="fa-solid fa-wand-magic-sparkles"></i> ${t('modal_extra_needs_title') || '额外定制需求'}</h3>
        
        <div style="display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 10px; max-height: 120px; overflow-y: auto; padding-right: 5px;">
            ${tagsHtml}
        </div>
        
        <div style="display: flex; justify-content: flex-end; gap: 8px; margin-bottom: 8px;">
            <button id="${modalId}-select-all" class="menu_button" style="padding: 4px 10px; font-size: 12px; background: rgba(255,255,255,0.1); border-radius: 4px;"><i class="fa-solid fa-check-double"></i> ${t('btn_select_all') || '全选'}</button>
            <button id="${modalId}-clear" class="menu_button" style="padding: 4px 10px; font-size: 12px; background: rgba(244,67,54,0.2); color: #ff5252; border-radius: 4px;"><i class="fa-solid fa-trash"></i> ${t('btn_clear_text') || '清空'}</button>
        </div>
        
        <textarea id="${modalId}-text" class="ag-textarea"></textarea>
        
        <div style="margin-top: 10px;">
            <label style="font-size: 12px; color: #aaa; margin-bottom: 4px; display: block;">${t('modal_text_model') || '文本提取模型：'}</label>
            <select id="${modalId}-text-model" class="ag-select">${textModelOptions}</select>
        </div>

        <div style="display: flex; justify-content: space-between; gap: 10px; margin-top: 20px;">
            <button id="${modalId}-cancel" class="menu_button ag-action-btn ag-btn-cancel" style="flex: 1;"><i class="fa-solid fa-xmark"></i> ${t('modal_cancel') || '取消'}</button>
            <button id="${modalId}-confirm" class="menu_button ag-action-btn ag-btn-confirm" style="flex: 1.5;">${t('modal_extract') || '提取提示词'} <i class="fa-solid fa-arrow-right"></i></button>
        </div>
    </div>
</div>`;

// [EN] Renders the step 2 modal for prompt confirmation
// [ZH] 渲染步骤 2 (提示词确认与生图设置) 弹窗
export const getConfirmPromptTemplate = (modalId, modelOptions, tagsHtml, t) => `
<div id="${modalId}" class="ag-modal-overlay">
    <div class="ag-modal-box">
        <h3 style="margin-top: 0; text-align: center;">📝 ${t('modal_confirm_title') || '确认绘画提示词'}</h3>
        
        <div style="display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 10px; max-height: 120px; overflow-y: auto; padding-right: 5px;">
            ${tagsHtml}
        </div>
        
        <div style="display: flex; justify-content: flex-end; margin-bottom: 8px;">
            <button id="${modalId}-select-all" class="menu_button" style="padding: 4px 10px; font-size: 12px; background: rgba(255,255,255,0.1); border-radius: 4px;"><i class="fa-solid fa-check-double"></i> ${t('btn_select_all') || '全选'}</button>
        </div>
        
        <textarea id="${modalId}-text" class="ag-textarea"></textarea>
        
        <div style="margin-top: 10px;">
            <label style="font-size: 12px; color: #aaa; margin-bottom: 4px; display: block;">${t('modal_temp_model') || '临时生图模型：'}</label>
            <select id="${modalId}-temp-model" class="ag-select">${modelOptions}</select>
        </div>
        
        <div style="margin-top: 10px;">
            <label style="font-size: 12px; color: #aaa; margin-bottom: 4px; display: block;">${t('modal_batch_size') || '生成数量：'}</label>
            <select id="${modalId}-batch" class="ag-select">
                ${[1,2,3,4,5].map(n => `<option value="${n}" ${n===5?'selected':''}>${n} 张</option>`).join('')}
            </select>
        </div>
        
        <div style="display: flex; justify-content: space-between; gap: 8px; margin-top: 20px;">
            <button id="${modalId}-cancel" class="menu_button ag-action-btn ag-btn-cancel" style="flex: 1;"><i class="fa-solid fa-xmark"></i> ${t('modal_cancel') || '取消'}</button>
            <button id="${modalId}-reextract" class="menu_button ag-action-btn ag-btn-retry" style="flex: 1;"><i class="fa-solid fa-rotate-left"></i> ${t('modal_reextract') || '重新提取'}</button>
            <button id="${modalId}-confirm" class="menu_button ag-action-btn ag-btn-confirm" style="flex: 1.5;"><i class="fa-solid fa-rocket"></i> ${t('modal_start_gen') || '开始生图'}</button>
        </div>
    </div>
</div>`;

// [EN] Renders the step 3 modal for image selection
// [ZH] 渲染步骤 3 (生成结果选图) 弹窗
export const getSelectImageTemplate = (modalId, imagesHtml, count, t) => `
<div id="${modalId}" class="ag-modal-overlay">
    <div class="ag-modal-box" style="max-width: 600px; padding-bottom: 10px;">
        <h3 style="margin-top: 0; text-align: center; flex-shrink: 0;">🖼️ ${t('modal_gallery_title') || '成功生成，请选择'} (${count})</h3>
        
        <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; overflow-y: auto; padding: 5px; flex-grow: 1;">
            ${imagesHtml}
        </div>
        
        <div id="${modalId}-error" style="text-align: center; color: #ff5252; min-height: 20px; margin-top: 5px; font-weight: bold; flex-shrink: 0;"></div>
        
        <div class="ag-action-grid">
            <button id="${modalId}-cancel" class="menu_button ag-action-btn ag-btn-cancel"><i class="fa-solid fa-xmark"></i> ${t('modal_cancel') || '取消'}</button>
            <button id="${modalId}-download" class="menu_button ag-action-btn ag-btn-save" title="保存当前选中的图片（绿框）到角色图库"><i class="fa-solid fa-floppy-disk"></i> 存入图库</button>
            <button id="${modalId}-retry" class="menu_button ag-action-btn ag-btn-retry"><i class="fa-solid fa-rotate-left"></i> ${t('modal_retry') || '重改提示词'}</button>
            <button id="${modalId}-confirm" class="menu_button ag-action-btn ag-btn-confirm"><i class="fa-solid fa-check"></i> ${t('modal_confirm_replace') || '确定替换'}</button>
        </div>
    </div>
</div>`;