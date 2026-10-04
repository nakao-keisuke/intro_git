-- 大西配列（Karabiner の Challenge プロファイル）使用時に、
-- Normal/Visual/Operator-pending のキー操作を QWERTY の物理位置へ戻す。
-- Insert モードと : / で始まるコマンドライン入力は大西配列のまま。
local M = {}

local KARABINER_JSON = vim.fn.expand("~/.config/karabiner/karabiner.json")
local PROFILE = "Challenge"

-- Karabiner の key_code -> { 通常, Shift 時 }（US 配列前提）
local punct = {
  semicolon = { ";", ":" },
  comma = { ",", "<" },
  period = { ".", ">" },
  slash = { "/", "?" },
  hyphen = { "-", "_" },
}

local function chars(key_code)
  if punct[key_code] then
    return punct[key_code][1], punct[key_code][2]
  end
  if #key_code == 1 then
    return key_code, key_code:upper()
  end
end

local function esc(c)
  return (c == ";" or c == "," or c == "\\") and "\\" .. c or c
end

-- simple_modifications（物理キー p -> 出力 o）を { 出力(通常,Shift), 物理キーの QWERTY 文字(通常,Shift) } の一覧にする
local function pairs_of(simple_modifications)
  local list = {}
  for _, m in ipairs(simple_modifications or {}) do
    local p, o = m.from and m.from.key_code, m.to and m.to[1] and m.to[1].key_code
    local p1, p2 = chars(p or "")
    local o1, o2 = chars(o or "")
    if p1 and o1 then
      table.insert(list, { o1 = o1, o2 = o2, p1 = p1, p2 = p2 })
    end
  end
  return list
end

-- langmap（出力 o -> 物理キーの QWERTY 文字）
function M.build_langmap(simple_modifications)
  local entries = {}
  for _, e in ipairs(pairs_of(simple_modifications)) do
    table.insert(entries, esc(e.o1) .. esc(e.p1))
    table.insert(entries, esc(e.o2) .. esc(e.p2))
  end
  return table.concat(entries, ",")
end

-- langmap は Ctrl+キーを翻訳しないので、<C-出力> -> <C-物理キー> を明示的にマップする
-- （<C-i>/<C-m>/<C-h>/<C-j> は Tab/CR/BS/NL と区別できないので左辺には使わない）
local no_lhs = { i = true, m = true, h = true, j = true }
local ctrl_lhs = {}

local function set_ctrl_maps(simple_modifications)
  for _, lhs in ipairs(ctrl_lhs) do pcall(vim.keymap.del, { "n", "x", "o" }, lhs) end
  ctrl_lhs = {}
  for _, e in ipairs(simple_modifications and pairs_of(simple_modifications) or {}) do
    if e.p1:match("%l") and e.o1 ~= e.p1 and not no_lhs[e.o1] then
      local lhs = "<C-" .. e.o1 .. ">"
      vim.keymap.set({ "n", "x", "o" }, lhs, "<C-" .. e.p1 .. ">", { noremap = true })
      table.insert(ctrl_lhs, lhs)
    end
  end
end

local function selected_profile()
  local f = io.open(KARABINER_JSON, "r")
  if not f then return nil end
  local ok, data = pcall(vim.json.decode, f:read("*a"))
  f:close()
  if not ok then return nil end
  for _, p in ipairs(data.profiles or {}) do
    if p.selected then return p end
  end
end

-- f/t/F/T/r の対象文字は langmap で翻訳させず、見えている文字のまま使う
local function set_char_arg_maps(enable)
  for _, k in ipairs({ "f", "t", "F", "T", "r" }) do
    if enable then
      vim.keymap.set({ "n", "x", "o" }, k, function()
        return k .. vim.fn.getcharstr()
      end, { expr = true, noremap = true })
    else
      pcall(vim.keymap.del, { "n", "x", "o" }, k)
    end
  end
end

function M.apply()
  local p = selected_profile()
  if p and p.name == PROFILE then
    vim.o.langmap = M.build_langmap(p.simple_modifications)
    set_char_arg_maps(true)
    set_ctrl_maps(p.simple_modifications)
  else
    vim.o.langmap = ""
    set_char_arg_maps(false)
    set_ctrl_maps(nil)
  end
end

function M.setup()
  M.apply()
  -- Karabiner のプロファイルを切り替えた後に戻ってきたら再判定
  vim.api.nvim_create_autocmd("FocusGained", { callback = M.apply })
end

return M
