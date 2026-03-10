import { getContext } from "../../../extensions.js";
import { loadSettings, addSettingsUI, extensionName } from "./settings.js";
import { runAvatarGeneration } from "./workflow.js";
import { initI18n, t } from "./i18n_loader.js";

// [EN] Retrieve plugin directory dynamically
// [ZH] 动态构建插件文件夹的基础路径
const extensionFolderPath = `/scripts/extensions/third-party/${extensionName}`;

// [EN] Injects the main stylesheet dynamically
// [ZH] 动态注入样式表
function injectStyleSheet() {
    const basePath = `${extensionFolderPath}/style.css`; 
    if (!$(`link[href="${basePath}"]`).length) $('head').append(`<link rel="stylesheet" href="${basePath}">`);
}

// [EN] Entrance 1: Injects generation button next to export button
// [ZH] 入口 1：快捷按钮注入 (角色卡上方的操作栏)
function injectActionRowButton() {
    const exportBtn = $('#export_button');
    if (exportBtn.length && !$('#ag_generate_btn').length) {
        const btnHtml = `
            <div id="ag_generate_btn" class="menu_button" title="${t('btn_generate')}">
                <i class="fa-solid fa-image-portrait"></i>
            </div>
        `;
        $(btnHtml).insertBefore(exportBtn);
        $('#ag_generate_btn').off('click').on('click', function(e) {
            e.stopPropagation();
            runAvatarGeneration();
        });
    }
}

// [EN] Entrance 2: Injects generation option in character dropdown
// [ZH] 入口 2：下拉菜单注入 (角色管理下拉框)
function injectIntoDropdown() {
    const dropdown = document.getElementById('char-management-dropdown');
    if (dropdown && !dropdown.querySelector('.avatar-gen-option')) {
        const option = document.createElement('option');
        option.value = 'generate-avatar'; 
        option.className = 'avatar-gen-option'; 
        option.innerText = t('btn_generate'); 
        
        dropdown.appendChild(option);
        
        $(dropdown).off('change.ag').on('change.ag', function() {
            if (this.value === 'generate-avatar') { 
                this.value = ''; 
                runAvatarGeneration(); 
            }
        });
    }
}

jQuery(async () => {
    // [EN] Initialize language pack based on browser config
    // [ZH] 初始化语言包
    await initI18n();
    
    // [EN] Inject CSS and mount global fullscreen preview DOM
    // [ZH] 注入 CSS 和 全屏预览的全局 DOM
    injectStyleSheet();
    $('body').append(`<div id="ag-fullscreen-preview"><img src="" /></div>`);
    $('#ag-fullscreen-preview').on('click', function() { $(this).fadeOut(200); });
    
    // [EN] Load internal config and mount UI panel
    // [ZH] 加载设置并渲染侧边栏面板
    loadSettings();
    addSettingsUI();
    
    // [EN] Bind unified timer to monitor and inject dual entry points continuously
    // [ZH] 将双入口合并到一个定时器中循环检测挂载，以应对 ST 界面重绘
    setInterval(() => {
        injectActionRowButton();
        injectIntoDropdown();
    }, 1000);
});