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

// ================= 新增：智能蹲点插队逻辑 (修复争宠互顶Bug) =================
function repositionPlugin() {
    let attempts = 0;
    // 【核心修复】：把状态标记移到定时器外部，只要成功一次就锁死！
    let menuMoved = false;
    let panelMoved = false;

    const timer = setInterval(() => {
        attempts++;
        // 精准寻找原生“图像生成”的菜单项和设置面板
        const nativeMenu = $('#extensionsMenu').find('[data-i18n="Image Generation"]').closest('.list-group-item');
        const nativePanel = $('#sd_container');
        
        // 寻找咱们插件自己的菜单项和设置面板
        const myMenu = $('#extensionsMenu').find(`[onclick*="${extensionName}"]`).closest('.list-group-item');
        const myPanel = $('.avatar-generator-settings');

        // 如果原生的菜单加载出来了，且还没插过队，执行插队并锁死
        if (!menuMoved && nativeMenu.length && myMenu.length) {
            myMenu.insertAfter(nativeMenu.last());
            menuMoved = true;
        }
        
        // 如果原生的面板加载出来了，且还没插过队，执行插队并锁死
        if (!panelMoved && nativePanel.length && myPanel.length) {
            myPanel.insertAfter(nativePanel);
            panelMoved = true;
        }

        // 如果两个都插队成功了，或者尝试超过20次，彻底停手
        if ((menuMoved && panelMoved) || attempts > 20) {
            clearInterval(timer);
        }
    }, 500);
}
// ==========================================================

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
    
    // [EN] Try injecting buttons when DOM is modified
    // [ZH] 监听 DOM 变化以动态注入入口按钮
    const observer = new MutationObserver(() => { injectActionRowButton(); injectIntoDropdown(); });
    observer.observe(document.body, { childList: true, subtree: true });
    
    // 启动智能插队，防止异步加载导致的乱序
    repositionPlugin();
});