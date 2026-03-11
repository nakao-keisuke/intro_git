local wezterm = require 'wezterm'
local act = wezterm.action

local img_counter = 0

local config = {
-- フォント
font = wezterm.font_with_fallback({
"JetBrains Mono",
"Noto Sans CJK JP",
}),
font_size = 16.0,

-- 行間（少し広げると見やすい）
line_height = 1.2,

-- ウィンドウ余白
window_padding = {
left = 10,
right = 10,
top = 10,
bottom = 10,
},

-- カラーテーマ
color_scheme = "Catppuccin Mocha",

-- ウィンドウ装飾（タイトルバーを非表示にしてリサイズのみ許可）
window_decorations = "RESIZE",

-- タブバー
enable_tab_bar = true,
use_fancy_tab_bar = false,
tab_bar_at_bottom = false,
show_new_tab_button_in_tab_bar = false,
window_frame = {
  font_size = 14.0,
},

-- タブバーの背景を透明にして背景画像を見せる
colors = {
  tab_bar = {
    background = "transparent",
  },
},

-- 背景画像
window_background_image = os.getenv("HOME") .. "/.config/wezterm/backgrounds/bg.png",

-- 背景の表示方法
window_background_image_layout = "Cover",

-- 背景の暗さ調整（文字を見やすくする）
window_background_image_hsb = {
brightness = 0.08,
},

-- GPUレンダリング
front_end = "WebGpu",

-- カーソル
default_cursor_style = "BlinkingBlock",

-- スクロールバック
scrollback_lines = 10000,

-- アクティブペインの強調表示
inactive_pane_hsb = {
  saturation = 0.7,
  brightness = 0.5,
},

-- キーバインド
keys = {
  -- 1. ペイン作成: Cmd+D で右にペイン分割
  { key = "d", mods = "CMD", action = act.SplitHorizontal { domain = "CurrentPaneDomain" } },

  -- ペイン作成: Shift+Cmd+D で縦にペイン分割
  { key = "d", mods = "CMD|SHIFT", action = act.SplitVertical { domain = "CurrentPaneDomain" } },

  -- ペインを閉じる: Cmd+W (ペインが1つならタブを閉じる)
  { key = "w", mods = "CMD", action = act.CloseCurrentPane { confirm = false } },

  -- 2. ペイン移動: Cmd+J で左ペイン、Cmd+K で右ペイン
  { key = "j", mods = "CMD", action = act.ActivatePaneDirection "Prev" },
  { key = "k", mods = "CMD", action = act.ActivatePaneDirection "Next" },

  -- 3. タブ移動: Cmd+H で左タブ、Cmd+L で右タブ
  { key = "h", mods = "CMD", action = act.ActivateTabRelative(-1) },
  { key = "l", mods = "CMD", action = act.ActivateTabRelative(1) },

  -- ペインリサイズ: Cmd+Opt+j/k/i/m でアクティブペインを広げる
  { key = "j", mods = "CMD|OPT", action = act.AdjustPaneSize { "Left", 5 } },
  { key = "k", mods = "CMD|OPT", action = act.AdjustPaneSize { "Right", 5 } },
  { key = "i", mods = "CMD|OPT", action = act.AdjustPaneSize { "Up", 5 } },
  { key = "m", mods = "CMD|OPT", action = act.AdjustPaneSize { "Down", 5 } },

  -- スクロール: Cmd+I/M で3行ずつスクロール
  { key = "i", mods = "CMD", action = act.ScrollByLine(-3) },
  { key = "m", mods = "CMD", action = act.ScrollByLine(3) },

  -- Cmd+V: 画像があれば連番で保存してパス入力、なければ通常ペースト
  { key = "v", mods = "CMD", action = wezterm.action_callback(function(window, pane)
    local dir = os.getenv("HOME") .. "/.clipboard_images"
    os.execute("mkdir -p " .. dir)
    img_counter = img_counter + 1
    local filepath = dir .. "/img_" .. img_counter .. ".png"
    local ok = os.execute("/opt/homebrew/bin/pngpaste " .. filepath .. " 2>/dev/null")
    if ok then
      pane:send_text(filepath)
    else
      img_counter = img_counter - 1
      window:perform_action(act.PasteFrom("Clipboard"), pane)
    end
  end) },

  -- カウンターリセット＆全削除: Cmd+Shift+X
  { key = "x", mods = "CMD|SHIFT", action = wezterm.action_callback(function(window, pane)
    os.execute("rm -f " .. os.getenv("HOME") .. "/.clipboard_images/*.png")
    img_counter = 0
  end) },

  -- N枚目の画像を削除: Cmd+Shift+1~9
  { key = "1", mods = "CMD|SHIFT", action = wezterm.action_callback(function(window, pane) require("image_utils").delete_nth(window, 1) end) },
  { key = "2", mods = "CMD|SHIFT", action = wezterm.action_callback(function(window, pane) require("image_utils").delete_nth(window, 2) end) },
  { key = "3", mods = "CMD|SHIFT", action = wezterm.action_callback(function(window, pane) require("image_utils").delete_nth(window, 3) end) },
  { key = "4", mods = "CMD|SHIFT", action = wezterm.action_callback(function(window, pane) require("image_utils").delete_nth(window, 4) end) },
  { key = "5", mods = "CMD|SHIFT", action = wezterm.action_callback(function(window, pane) require("image_utils").delete_nth(window, 5) end) },
  { key = "6", mods = "CMD|SHIFT", action = wezterm.action_callback(function(window, pane) require("image_utils").delete_nth(window, 6) end) },
  { key = "7", mods = "CMD|SHIFT", action = wezterm.action_callback(function(window, pane) require("image_utils").delete_nth(window, 7) end) },
  { key = "8", mods = "CMD|SHIFT", action = wezterm.action_callback(function(window, pane) require("image_utils").delete_nth(window, 8) end) },
  { key = "9", mods = "CMD|SHIFT", action = wezterm.action_callback(function(window, pane) require("image_utils").delete_nth(window, 9) end) },
},
}

-- 4. アクティブタブの強調表示
wezterm.on("format-tab-title", function(tab, tabs, panes, config, hover, max_width)
  local title = tab.active_pane.title
  if #title > max_width - 4 then
    title = string.sub(title, 1, max_width - 4) .. "…"
  end
  if tab.is_active then
    return {
      { Background = { Color = "#cba6f7" } },
      { Foreground = { Color = "#1e1e2e" } },
      { Text = " " .. title .. " " },
    }
  end
  return {
    { Background = { Color = "#313244" } },
    { Foreground = { Color = "#cdd6f4" } },
    { Text = " " .. title .. " " },
  }
end)

return config
