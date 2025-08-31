/*!
 * obsidian-gyazo v0.0.1
 * Copyright Go Kamoda
 * Released under the MIT license
 *
 * Date: 2025-03-28
 */

var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);


// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => GyazoPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");

// src/i18n.ts
var en = {
  settings: {
    imageWidth: {
      name: "Image width",
      desc: "Set the width of pasted images, can be a pixel value (e.g. 500px), percentage (e.g. 100%) or auto"
    },
    showNotice: {
      name: "Show notification",
      desc: "Show notification when pasting images"
    },
    gyazoAccessToken: {
      name: "Gyazo Access Token",
      desc: "Get access token from https://gyazo.com/oauth/applications"
    },
    imagePath: {
      name: "Image Path",
      desc: "Directory to save images when offline"
    }
  },
  statusBar: {
    enabled: "Gyazo: enabled"
  },
  notice: {
    imagePasted: "Image pasted successfully",
    imageSaving: "Saving image to gyazo",
    imageSavedOnLocal: "Saved locally."
  }
};
function getTranslations() {
  return en;
}

// src/types.ts
var DEFAULT_SETTINGS = {
  imageWidth: "auto",
  imagePath: "attachments",
  showNotice: true,
  gyazoAccessToken: "",
};

// src/settings.ts
var import_obsidian = require("obsidian");
var GyazoSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    const i18n = this.plugin.i18n;
    containerEl.empty();
    new import_obsidian.Setting(containerEl).setName(i18n.settings.imageWidth.name).setDesc(i18n.settings.imageWidth.desc).addText((text) => text.setPlaceholder("auto").setValue(this.plugin.settings.imageWidth).onChange(async (value) => {
      this.plugin.settings.imageWidth = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian.Setting(containerEl).setName(i18n.settings.imagePath.name).setDesc(i18n.settings.imagePath.desc).addText((text) => text.setPlaceholder("attachments dir").setValue(this.plugin.settings.imagePath).onChange(async (value) => {
      this.plugin.settings.imagePath = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian.Setting(containerEl).setName(i18n.settings.showNotice.name).setDesc(i18n.settings.showNotice.desc).addToggle((toggle) => toggle.setValue(this.plugin.settings.showNotice).onChange(async (value) => {
      this.plugin.settings.showNotice = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian.Setting(containerEl).setName(i18n.settings.gyazoAccessToken.name).setDesc(i18n.settings.gyazoAccessToken.desc).addText((text) => text.setPlaceholder("token").setValue(this.plugin.settings.gyazoAccessToken).onChange(async (value) => {
      this.plugin.settings.gyazoAccessToken = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian.Setting(containerEl).setName("Offline Mode").setDesc("Set offline mode to save images to local storage").addToggle((toggle) => toggle.setValue(this.plugin.settings.offlineMode).onChange(async (value) => {
      this.plugin.settings.offlineMode = value;
      await this.plugin.saveSettings();
    }));
  }
};

// src/utils.ts
function getFileExtension(mimeType) {
  const mimeToExt = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
  };
  return mimeToExt[mimeType] || "png";
}
function createHtmlImgTag(src, imageWidth) {
  return `<img src="${src}" width="${imageWidth}">`;
}

let gyazoUploader = class {
  constructor(app, settings) {
    this.app = app;
    this.settings = settings;
  }
  async uploadImage(image_blob, filename) {
    let formData = new FormData();
    // Append the image file to the FormData object with the appropriate Content-Disposition
    formData.append('imagedata', new Blob([image_blob], {
      filename: filename, // Specify the desired filename
    }));
    formData.append("access_token", this.settings.gyazoAccessToken);

    try {
      let response = await fetch("https://upload.gyazo.com/api/upload", {
        method: "POST",
        body: formData,
      });
      let json = await response.json();
      return json.url;
    } catch (error) {
      return -1
    }
  }
}

// src/main.ts
let GyazoPlugin = class extends import_obsidian.Plugin {
  async onload() {
    await this.loadSettings();
    this.i18n = getTranslations();
    this.gyazo_uploader = new gyazoUploader(this.app, this.settings);
    this.registerEvent(
      this.app.workspace.on("editor-paste", this.handlePaste.bind(this))
    );
    this.settingTab = new GyazoSettingTab(this.app, this);
    this.addSettingTab(this.settingTab);
  }
  onunload() {
  }
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }


  async handlePaste(evt, editor, view) {
    var _a, _b, _c;
    if (!((_a = evt.clipboardData) == null ? void 0 : _a.files.length)) {
      return;
    }
    evt.preventDefault();
    const file = evt.clipboardData.files[0];
    if (!file.type.startsWith("image/")) {
      return;
    }
    const activeFile = view.file;
    if (!activeFile) {
      return;
    }
    const timestamp = (/* @__PURE__ */ new Date()).getTime();
    const fileName = `image_${timestamp}.${getFileExtension(file.type)}`;
    
    const buffer = await file.arrayBuffer();

    if (this.settings.showNotice & this.settings.offlineMode) {
      new import_obsidian.Notice(`${this.i18n.notice.imageSaving}`);
    }else if (! this.settings.offlineMode){
      new import_obsidian.Notice("Offline Mode");
    }

    let url = -1
    if (! this.settings.offlineMode) {
      url = await this.gyazo_uploader.uploadImage(buffer, fileName);
    }
    if (url == -1){
      let imagePath = "";
      let imageDir = "";
      const basePath = ((_b = activeFile.parent) == null ? void 0 : _b.path) || "";
      const customPath = this.settings.imagePath.trim();
      const normalizedCustomPath = customPath.startsWith("/") ? customPath.substring(1) : customPath;
      if (normalizedCustomPath.startsWith("./") || normalizedCustomPath.startsWith("../")) {
        imageDir = (0, import_obsidian.normalizePath)(`${basePath}/${normalizedCustomPath}`);
      } else {
        imageDir = (0, import_obsidian.normalizePath)(normalizedCustomPath);
      }
      if (!await this.app.vault.adapter.exists(imageDir)) {
        await this.app.vault.createFolder(imageDir);
      }
      imagePath = `${imageDir}/${fileName}`;

      if (this.settings.showNotice) {
        new import_obsidian.Notice(`${this.i18n.notice.imageSavedOnLocal}`);
      }
      await this.app.vault.createBinary(imagePath, buffer);
      url = fileName
    }

    const imgTag = createHtmlImgTag(
      url,
      this.settings.imageWidth,
    );
    editor.replaceSelection(imgTag);
    if (this.settings.showNotice) {
      new import_obsidian.Notice(`${this.i18n.notice.imagePasted}`);
    }
  }
};

/* nosourcemap */