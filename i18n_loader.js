export let translations = {};

// [EN] Base extension path definition
// [ZH] 扩展基础路径定义
const extensionName = "pollinations-avatar-gen-reforged";
const extensionFolderPath = `/scripts/extensions/third-party/${extensionName}`;

// [EN] Initialize i18n based on browser language
// [ZH] 根据浏览器语言初始化多语言包
export async function initI18n() {
    let browserLang = navigator.language.toLowerCase();
    
    // 支持的语言映射表 (映射到对应的 json 文件名)
    const languageMap = {
        'zh': 'zh-cn',    // 简中默认
        'zh-cn': 'zh-cn', // 简体中文
        'zh-tw': 'zh-tw', // 繁体中文
        'zh-hk': 'zh-tw', // 繁体中文 (香港)
        'ja': 'ja-jp',    // 日语
        'ko': 'ko-kr',    // 韩语
        'ru': 'ru-ru',    // 俄语
        'es': 'es-es',    // 西班牙语
        'en': 'en'        // 英文 (默认兜底)
    };

    // 匹配语言，如果找不到前两位的匹配，则默认使用 'en'
    let langFile = languageMap[browserLang] || languageMap[browserLang.split('-')[0]] || 'en';

    const url = `${extensionFolderPath}/i18n/${langFile}.json?t=${Date.now()}`;
    
    try {
        console.log(`[Pollinations Avatar Gen] Loading language pack / 正在尝试加载语言包: ${url}`);
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP Status / 状态码: ${response.status}`);
        }
        
        translations = await response.json();
        console.log(`[Pollinations Avatar Gen] Language pack loaded / 语言包加载成功 (${langFile})`);
    } catch (e) {
        console.error(`[Pollinations Avatar Gen] 🔴 Language pack failed to load! / 语言包加载失败！URL: ${url}`, e);
        // 如果加载失败，给一个 fallback，防止全盘崩溃
        if (langFile !== 'en') {
            console.log(`[Pollinations Avatar Gen] 尝试降级加载英文包 (Fallback to English)...`);
            try {
                const fallbackResponse = await fetch(`${extensionFolderPath}/i18n/en.json?t=${Date.now()}`);
                translations = await fallbackResponse.json();
            } catch (fallbackErr) {
                console.error(`[Pollinations Avatar Gen] 英文包也加载失败！`, fallbackErr);
            }
        }
    }
}

// [EN] Translation function, falls back to key if missing
// [ZH] 核心翻译函数，缺失时降级返回 key
export function t(key, defaultText = "") {
    return translations[key] || defaultText || key;
}