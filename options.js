(function () {
  const STORAGE_KEY = "resumeAutofillCn.resumeData";
  const SAMPLE_FILE = "sample-structured-resume-cn.json";
  const CUSTOM_META_KEY = "_customFieldMeta";

  const GROUP_LABELS = {
    "基本信息": "基本信息",
    "教育经历": "教育经历",
    "求职意向": "求职意向",
    "实习经历": "实习经历",
    "项目经验": "项目经验",
    "社会实践/校内活动": "社会实践/校内活动",
    "专利发表": "专利发表",
    "论文发表": "论文发表",
    "奖励荣誉": "奖励荣誉",
    "技能/爱好": "技能/爱好",
    "家庭关系": "家庭关系",
    "自我评价": "自我评价",
  };

  const ARRAY_NAME_FIELDS = {
    "教育经历": ["学校名称", "学历", "专业名称"],
    "实习经历": ["企业名称", "职位名称"],
    "项目经验": ["项目名称", "项目职务"],
    "社会实践/校内活动": ["活动名称", "职务"],
    "专利发表": ["专利名称", "专利类型"],
    "论文发表": ["论文名称", "期刊或会议名称"],
    "奖励荣誉": ["奖励名称", "奖励级别"],
    "家庭关系": ["关系", "姓名"],
  };

  const state = {
    sampleData: null,
    resumeData: null,
    activeGroup: "",
    saveTimer: null,
    dirty: false,
    dialogTarget: "",
    focusPath: "",
  };

  const els = {};

  document.addEventListener("DOMContentLoaded", init);

  async function init() {
    els.status = document.querySelector(".status");
    els.nav = document.querySelector(".group-nav");
    els.editor = document.querySelector(".editor");
    els.fileInput = document.querySelector(".file-input");
    els.backdrop = document.querySelector(".dialog-backdrop");
    els.dialog = document.querySelector(".field-dialog");

    bindEvents();

    try {
      state.sampleData = await loadSampleData();
      const stored = await chromeStorageGet(STORAGE_KEY);
      state.resumeData = mergeResumeData(state.sampleData, stored);
      const initialTarget = readInitialTarget();
      const groupKeys = getGroupKeys();
      state.activeGroup = groupKeys.includes(initialTarget.group) ? initialTarget.group : groupKeys[0] || "";
      state.focusPath = initialTarget.path;
      render();
      setStatus("已加载资料", "ok");
      focusInitialTarget();
    } catch (error) {
      console.error("[Resume Autofill CN] options init failed", error);
      setStatus("设置页加载失败", "err");
    }
  }

  function bindEvents() {
    document.body.addEventListener("click", handleClick);
    els.editor.addEventListener("input", handleEditorInput);
    els.fileInput.addEventListener("change", handleImportFile);
    els.dialog.addEventListener("submit", handleDialogSubmit);
    els.backdrop.addEventListener("click", (event) => {
      if (event.target === els.backdrop) closeDialog();
    });
  }

  async function chromeStorageGet(key) {
    if (!chrome?.storage?.local) return undefined;
    return new Promise((resolve) => {
      chrome.storage.local.get(key, (result) => resolve(result?.[key]));
    });
  }

  async function chromeStorageSet(key, value) {
    if (!chrome?.storage?.local) return;
    return new Promise((resolve) => {
      chrome.storage.local.set({ [key]: value }, resolve);
    });
  }

  async function chromeStorageRemove(key) {
    if (!chrome?.storage?.local) return;
    return new Promise((resolve) => {
      chrome.storage.local.remove(key, resolve);
    });
  }

  async function loadSampleData() {
    const url = chrome.runtime.getURL(SAMPLE_FILE);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Cannot load ${SAMPLE_FILE}`);
    return response.json();
  }

  function render() {
    renderNav();
    renderEditor();
  }

  function readInitialTarget() {
    const params = new URLSearchParams(window.location.search);
    const path = params.get("path") || "";
    const group = params.get("group") || groupFromPath(path);
    return { group, path };
  }

  function groupFromPath(path) {
    const arrayMatch = String(path || "").match(/^(.+?)\[\d+\]/);
    if (arrayMatch) return arrayMatch[1];
    return String(path || "").split(".")[0] || "";
  }

  function focusInitialTarget() {
    const path = state.focusPath;
    if (!path) return;
    state.focusPath = "";
    setTimeout(() => revealEditorTarget(path), 0);
  }

  function revealEditorTarget(path) {
    const control = findEditorElement("data-path", path, ".field-input, .field-textarea");
    const row = findEditorElement("data-path", path, ".field-row");
    const target = row || control || findEditorElement("data-target", pathToTarget(path), ".entry-card");

    if (!target) {
      setStatus("未找到指定编辑项", "warn");
      return;
    }

    target.scrollIntoView({ block: "center", inline: "nearest" });
    target.classList.add("target-highlight");
    setTimeout(() => target.classList.remove("target-highlight"), 1800);

    if (control) {
      control.focus({ preventScroll: true });
      if (typeof control.select === "function") control.select();
    }

    setStatus("已定位到编辑项", "ok");
  }

  function findEditorElement(attr, value, selector) {
    if (!value) return null;
    return Array.from(els.editor.querySelectorAll(selector)).find((element) => element.getAttribute(attr) === value) || null;
  }

  function pathToTarget(path) {
    const arrayMatch = String(path || "").match(/^(.+\[\d+\])(?:\.|$)/);
    if (arrayMatch) return arrayMatch[1];
    return String(path || "").split(".")[0] || "";
  }

  function renderNav() {
    const keys = getGroupKeys();
    els.nav.innerHTML = keys
      .map((key) => {
        const active = key === state.activeGroup;
        const value = state.resumeData?.[key];
        const count = Array.isArray(value) ? value.length : isPlainObject(value) ? Object.keys(value).length : 0;
        return `
          <button class="nav-btn" type="button" data-action="switch-group" data-key="${escapeHtml(key)}" data-active="${active}">
            <span class="nav-name">${escapeHtml(GROUP_LABELS[key] || key)}</span>
            <span class="nav-count">${count}</span>
          </button>
        `;
      })
      .join("");
  }

  function renderEditor() {
    const groupKey = state.activeGroup;
    if (!groupKey) {
      els.editor.innerHTML = `<div class="empty">暂无资料分组</div>`;
      return;
    }

    const value = state.resumeData?.[groupKey];
    if (Array.isArray(value)) {
      renderArrayModule(groupKey, value);
    } else if (isPlainObject(value)) {
      renderObjectModule(groupKey, value);
    } else {
      els.editor.innerHTML = `<div class="empty">该分组暂不支持编辑</div>`;
    }
  }

  function renderObjectModule(groupKey, value) {
    const sampleObject = getSampleObject(groupKey);
    const fieldKeys = unique([...Object.keys(sampleObject), ...Object.keys(value)]);
    const fields = fieldKeys.map((key) => renderField(`${groupKey}.${key}`, key, value[key], key in sampleObject)).join("");

    els.editor.innerHTML = `
      <section class="module">
        ${renderModuleHeader(groupKey, `${fieldKeys.length} 个字段`, `<button class="text-btn" type="button" data-action="add-field" data-target="${escapeHtml(groupKey)}">新增字段</button>`)}
        <div class="field-grid">${fields || `<div class="empty">暂无字段</div>`}</div>
      </section>
    `;
  }

  function renderArrayModule(groupKey, entries) {
    const cards = entries
      .map((entry, index) => renderEntryCard(groupKey, entry, index))
      .join("");

    els.editor.innerHTML = `
      <section class="module">
        ${renderModuleHeader(groupKey, `${entries.length} 条记录`, `<button class="text-btn" type="button" data-action="add-entry" data-group="${escapeHtml(groupKey)}">新增条目</button>`)}
        <div class="entry-list">${cards || `<div class="empty">暂无条目</div>`}</div>
      </section>
    `;
  }

  function renderModuleHeader(groupKey, meta, actions) {
    return `
      <header class="module-header">
        <div>
          <h2 class="module-title">${escapeHtml(GROUP_LABELS[groupKey] || groupKey)}</h2>
          <p class="module-meta">${escapeHtml(meta)}</p>
        </div>
        <div class="entry-actions">${actions}</div>
      </header>
    `;
  }

  function renderEntryCard(groupKey, entry, index) {
    const sampleObject = getSampleObject(groupKey);
    const safeEntry = isPlainObject(entry) ? entry : {};
    const fieldKeys = unique([...Object.keys(sampleObject), ...Object.keys(safeEntry)]);
    const fields = fieldKeys
      .map((key) => renderField(`${groupKey}[${index}].${key}`, key, safeEntry[key], key in sampleObject))
      .join("");

    return `
      <article class="entry-card" data-target="${escapeHtml(`${groupKey}[${index}]`)}">
        <header class="entry-header">
          <h3 class="entry-title">${escapeHtml(makeEntryTitle(groupKey, index, safeEntry))}</h3>
          <div class="entry-actions">
            <button class="text-btn" type="button" data-action="add-field" data-target="${escapeHtml(`${groupKey}[${index}]`)}">新增字段</button>
            <button class="text-btn" type="button" data-action="delete-entry" data-target="${escapeHtml(`${groupKey}[${index}]`)}" data-danger="true">删除记录</button>
          </div>
        </header>
        <div class="field-grid">${fields}</div>
      </article>
    `;
  }

  function renderField(path, key, value, builtIn) {
    const text = formatValue(value);
    const wide = shouldUseTextarea(key, text);
    const control = wide
      ? `<textarea class="field-textarea" data-path="${escapeHtml(path)}" rows="4">${escapeHtml(text)}</textarea>`
      : `<input class="field-input" data-path="${escapeHtml(path)}" type="text" value="${escapeHtml(text)}" />`;
    const deleteButton = builtIn
      ? ""
      : `<button class="delete-field" type="button" data-action="delete-field" data-path="${escapeHtml(path)}">删除</button>`;

    return `
      <label class="field-row" data-wide="${wide}" data-path="${escapeHtml(path)}">
        <span class="field-head">
          <span class="field-label">${escapeHtml(key)}</span>
          ${deleteButton}
        </span>
        ${control}
      </label>
    `;
  }

  async function handleClick(event) {
    const actionEl = event.target.closest("[data-action]");
    if (!actionEl) return;
    const action = actionEl.getAttribute("data-action");

    if (action === "switch-group") {
      state.activeGroup = actionEl.getAttribute("data-key") || state.activeGroup;
      render();
    } else if (action === "save") {
      await saveNow("已保存");
    } else if (action === "import") {
      els.fileInput.click();
    } else if (action === "export") {
      exportResumeData();
    } else if (action === "reset") {
      await resetToSample();
    } else if (action === "add-field") {
      openDialog(actionEl.getAttribute("data-target") || "");
    } else if (action === "close-dialog") {
      closeDialog();
    } else if (action === "delete-field") {
      await deleteField(actionEl.getAttribute("data-path") || "");
    } else if (action === "add-entry") {
      await addEntry(actionEl.getAttribute("data-group") || "");
    } else if (action === "delete-entry") {
      await deleteEntry(actionEl.getAttribute("data-target") || "");
    }
  }

  function handleEditorInput(event) {
    const path = event.target?.getAttribute?.("data-path");
    if (!path) return;
    setValueAtPath(state.resumeData, path, event.target.value);
    scheduleSave();
  }

  async function handleImportFile(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      const json = JSON.parse(await file.text());
      state.resumeData = mergeResumeData(state.sampleData, json);
      if (!getGroupKeys().includes(state.activeGroup)) state.activeGroup = getGroupKeys()[0] || "";
      render();
      await saveNow("已导入 JSON");
    } catch (error) {
      console.error("[Resume Autofill CN] import failed", error);
      setStatus("导入失败", "err");
    }
  }

  async function handleDialogSubmit(event) {
    event.preventDefault();

    const fieldName = cleanFieldName(els.dialog.querySelector(".dialog-name").value);
    const fieldValue = els.dialog.querySelector(".dialog-value").value || "";
    const aliases = parseAliases(els.dialog.querySelector(".dialog-aliases").value);

    if (!state.dialogTarget) {
      setStatus("保存位置无效", "err");
      return;
    }
    if (!fieldName) {
      setStatus("请输入字段名", "warn");
      return;
    }

    const targetObject = ensureTargetObject(state.resumeData, state.dialogTarget);
    if (!targetObject) {
      setStatus("保存位置无效", "err");
      return;
    }

    targetObject[fieldName] = fieldValue;
    upsertCustomFieldMeta(state.resumeData, state.dialogTarget, fieldName, aliases);
    closeDialog();
    render();
    await saveNow("已保存新增字段");
  }

  async function addEntry(groupKey) {
    if (!groupKey) return;
    if (!Array.isArray(state.resumeData[groupKey])) state.resumeData[groupKey] = [];
    state.resumeData[groupKey].push(buildEntryTemplate(groupKey));
    render();
    await saveNow("已新增条目");
  }

  async function deleteEntry(target) {
    const parsed = parseArrayTarget(target);
    if (!parsed) return;
    if (!confirm("确定删除这条记录？")) return;

    const entries = state.resumeData[parsed.groupKey];
    if (!Array.isArray(entries)) return;
    entries.splice(parsed.index, 1);
    cleanupCustomMeta(state.resumeData);
    render();
    await saveNow("已删除记录");
  }

  async function deleteField(path) {
    const { target, fieldName } = splitFieldPath(path);
    if (!target || !fieldName || isBuiltInField(target, fieldName)) return;
    if (!confirm(`确定删除字段“${fieldName}”？`)) return;

    const targetObject = getTargetObject(state.resumeData, target);
    if (!targetObject || !(fieldName in targetObject)) return;
    delete targetObject[fieldName];
    cleanupCustomMeta(state.resumeData);
    render();
    await saveNow("已删除字段");
  }

  async function resetToSample() {
    if (!confirm("确定恢复样例？当前自定义字段和值会被清除。")) return;
    clearTimeout(state.saveTimer);
    state.saveTimer = null;
    state.dirty = false;
    await chromeStorageRemove(STORAGE_KEY);
    state.resumeData = cloneData(state.sampleData);
    state.activeGroup = getGroupKeys()[0] || "";
    render();
    setStatus("已恢复样例", "ok");
  }

  function exportResumeData() {
    const blob = new Blob([JSON.stringify(state.resumeData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "structured-resume-cn.json";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 500);
    setStatus("已导出 JSON", "ok");
  }

  function openDialog(target) {
    state.dialogTarget = target;
    els.backdrop.hidden = false;
    els.dialog.querySelector(".dialog-target").value = formatTarget(target);
    els.dialog.querySelector(".dialog-name").value = "";
    els.dialog.querySelector(".dialog-value").value = "";
    els.dialog.querySelector(".dialog-aliases").value = "";
    setTimeout(() => els.dialog.querySelector(".dialog-name").focus(), 0);
  }

  function closeDialog() {
    state.dialogTarget = "";
    els.backdrop.hidden = true;
  }

  function scheduleSave() {
    state.dirty = true;
    setStatus("正在保存...", "");
    clearTimeout(state.saveTimer);
    state.saveTimer = setTimeout(() => {
      saveNow("已自动保存");
    }, 350);
  }

  async function saveNow(message) {
    clearTimeout(state.saveTimer);
    state.saveTimer = null;
    try {
      await chromeStorageSet(STORAGE_KEY, state.resumeData);
      state.dirty = false;
      setStatus(message || "已保存", "ok");
    } catch (error) {
      console.error("[Resume Autofill CN] save failed", error);
      setStatus("保存失败", "err");
    }
  }

  function getGroupKeys() {
    return unique([...Object.keys(state.sampleData || {}), ...Object.keys(state.resumeData || {})]).filter(
      (key) => key !== CUSTOM_META_KEY,
    );
  }

  function getSampleObject(groupKey) {
    const sample = state.sampleData?.[groupKey];
    if (Array.isArray(sample)) return isPlainObject(sample[0]) ? sample[0] : {};
    return isPlainObject(sample) ? sample : {};
  }

  function getModuleFieldKeys(groupKey) {
    const sampleObject = getSampleObject(groupKey);
    const entries = Array.isArray(state.resumeData?.[groupKey]) ? state.resumeData[groupKey] : [];
    return unique([
      ...Object.keys(sampleObject),
      ...entries.flatMap((entry) => (isPlainObject(entry) ? Object.keys(entry) : [])),
    ]);
  }

  function buildEntryTemplate(groupKey) {
    return Object.fromEntries(getModuleFieldKeys(groupKey).map((key) => [key, ""]));
  }

  function isBuiltInField(target, fieldName) {
    const parsed = parseArrayTarget(target);
    const groupKey = parsed ? parsed.groupKey : target;
    return fieldName in getSampleObject(groupKey);
  }

  function ensureTargetObject(data, target) {
    const parsed = parseArrayTarget(target);
    if (parsed) {
      if (!Array.isArray(data[parsed.groupKey])) data[parsed.groupKey] = [];
      while (data[parsed.groupKey].length <= parsed.index) data[parsed.groupKey].push({});
      if (!isPlainObject(data[parsed.groupKey][parsed.index])) data[parsed.groupKey][parsed.index] = {};
      return data[parsed.groupKey][parsed.index];
    }

    if (!isPlainObject(data[target])) data[target] = {};
    return data[target];
  }

  function getTargetObject(data, target) {
    const parsed = parseArrayTarget(target);
    if (parsed) {
      const entries = data?.[parsed.groupKey];
      return Array.isArray(entries) && isPlainObject(entries[parsed.index]) ? entries[parsed.index] : null;
    }
    return isPlainObject(data?.[target]) ? data[target] : null;
  }

  function parseArrayTarget(target) {
    const match = String(target || "").match(/^(.+)\[(\d+)\]$/);
    if (!match) return null;
    return { groupKey: match[1], index: Number(match[2]) };
  }

  function splitFieldPath(path) {
    const match = String(path || "").match(/^(.+)\.([^.[\]]+)$/);
    if (!match) return { target: "", fieldName: "" };
    return { target: match[1], fieldName: match[2] };
  }

  function setValueAtPath(data, path, value) {
    const parts = path.replace(/\[(\d+)\]/g, ".$1").split(".");
    let cur = data;
    for (let i = 0; i < parts.length - 1; i += 1) {
      const part = parts[i];
      const nextPart = parts[i + 1];
      if (cur[part] === undefined || cur[part] === null) cur[part] = /^\d+$/.test(nextPart) ? [] : {};
      cur = cur[part];
    }
    cur[parts[parts.length - 1]] = value;
  }

  function upsertCustomFieldMeta(data, target, fieldName, aliases) {
    if (!isPlainObject(data[CUSTOM_META_KEY])) data[CUSTOM_META_KEY] = {};
    const metaPath = `${canonicalPath(target)}.${fieldName}`;
    const existing = data[CUSTOM_META_KEY][metaPath];
    const existingAliases = isPlainObject(existing) && Array.isArray(existing["匹配词"]) ? existing["匹配词"] : [];
    data[CUSTOM_META_KEY][metaPath] = {
      "匹配词": unique([fieldName, ...existingAliases, ...aliases]),
    };
  }

  function cleanupCustomMeta(data) {
    const meta = data?.[CUSTOM_META_KEY];
    if (!isPlainObject(meta)) return;

    for (const metaPath of Object.keys(meta)) {
      const parsedArray = metaPath.match(/^(.+)\[\]\.([^.[\]]+)$/);
      if (parsedArray) {
        const entries = data[parsedArray[1]];
        const exists = Array.isArray(entries) && entries.some((entry) => isPlainObject(entry) && parsedArray[2] in entry);
        if (!exists) delete meta[metaPath];
        continue;
      }

      const parsedObject = metaPath.match(/^([^.]+)\.([^.[\]]+)$/);
      if (parsedObject) {
        const object = data[parsedObject[1]];
        if (!isPlainObject(object) || !(parsedObject[2] in object)) delete meta[metaPath];
      }
    }

    if (Object.keys(meta).length === 0) delete data[CUSTOM_META_KEY];
  }

  function mergeResumeData(sample, stored) {
    const base = cloneData(sample || {});
    if (!isPlainObject(stored)) return base;

    const merged = mergeValue(base, stored);
    if (isPlainObject(stored[CUSTOM_META_KEY])) {
      merged[CUSTOM_META_KEY] = cloneData(stored[CUSTOM_META_KEY]);
    }
    return merged;
  }

  function mergeValue(base, override) {
    if (Array.isArray(base)) return mergeArrayValue(base, override);
    if (isPlainObject(base)) {
      const result = cloneData(base);
      if (!isPlainObject(override)) return result;
      for (const [key, value] of Object.entries(override)) {
        if (key === CUSTOM_META_KEY) continue;
        result[key] = key in result ? mergeValue(result[key], value) : cloneData(value);
      }
      return result;
    }
    return override === undefined ? cloneData(base) : cloneData(override);
  }

  function mergeArrayValue(base, override) {
    if (!Array.isArray(override)) return cloneData(base);
    const template = base[0];
    return override.map((entry, index) => {
      const baseEntry = base[index] !== undefined ? base[index] : template;
      return mergeValue(baseEntry, entry);
    });
  }

  function canonicalPath(path) {
    return String(path || "").replace(/\[\d+\]/g, "[]");
  }

  function formatTarget(target) {
    const parsed = parseArrayTarget(target);
    if (!parsed) return GROUP_LABELS[target] || target;
    const entry = state.resumeData?.[parsed.groupKey]?.[parsed.index];
    return `${GROUP_LABELS[parsed.groupKey] || parsed.groupKey} / ${makeEntryTitle(parsed.groupKey, parsed.index, entry)}`;
  }

  function makeEntryTitle(groupKey, index, entry) {
    const fields = ARRAY_NAME_FIELDS[groupKey] || ["姓名", "名称", "标题"];
    const parts = [];
    for (const field of fields) {
      const value = entry?.[field];
      if (value !== null && value !== undefined && value !== "") parts.push(formatValue(value));
    }
    const suffix = parts.slice(0, 2).join(" / ");
    return suffix ? `第 ${index + 1} 条 - ${suffix}` : `第 ${index + 1} 条`;
  }

  function shouldUseTextarea(key, value) {
    return (
      String(value || "").length > 80 ||
      /描述|评价|课程|技能|爱好|地址|摘要|内容|职责|说明/.test(String(key || ""))
    );
  }

  function formatValue(value) {
    if (value === null || value === undefined) return "";
    if (typeof value === "boolean") return value ? "是" : "否";
    if (Array.isArray(value)) return value.map(formatValue).filter(Boolean).join("，");
    if (isPlainObject(value)) return Object.values(value).map(formatValue).filter(Boolean).join("，");
    return String(value);
  }

  function cleanFieldName(value) {
    return String(value || "")
      .replace(/[.[\]]/g, " ")
      .replace(/\s+/g, " ")
      .replace(/^[*＊\s]+/, "")
      .replace(/[:：]$/, "")
      .trim()
      .slice(0, 40);
  }

  function parseAliases(value) {
    return unique(
      String(value || "")
        .split(/[，,、;；\n]+/)
        .map(cleanFieldName)
        .filter(Boolean),
    );
  }

  function setStatus(message, type = "") {
    els.status.dataset.type = type;
    els.status.textContent = message;
  }

  function escapeHtml(value) {
    const div = document.createElement("div");
    div.textContent = String(value ?? "");
    return div.innerHTML;
  }

  function isPlainObject(value) {
    return Object.prototype.toString.call(value) === "[object Object]";
  }

  function cloneData(value) {
    if (value === undefined) return undefined;
    return JSON.parse(JSON.stringify(value));
  }

  function unique(values) {
    return Array.from(new Set(values.filter((value) => value !== null && value !== undefined && value !== "")));
  }
})();
