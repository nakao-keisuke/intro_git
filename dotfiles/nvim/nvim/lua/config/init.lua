-- 基本設定
vim.opt.number = true          -- 行番号を表示
vim.opt.termguicolors = true

-- キーマップの例（最低限）
vim.g.mapleader = " "
vim.keymap.set("n", "<leader>w", ":w<CR>")
vim.keymap.set("n", "<leader>q", ":q<CR>")
vim.keymap.set("n", "<leader>s", ":wq<CR>")
vim.keymap.set("n", "<leader>qf", ":q!<CR>")

-- 移動キーを jmik に変更
local modes = { "n", "v", "o" }
for _, mode in ipairs(modes) do
  vim.keymap.set(mode, "j", "h", { noremap = true })  -- 左
  vim.keymap.set(mode, "m", "j", { noremap = true })  -- 下
  vim.keymap.set(mode, "i", "k", { noremap = true })  -- 上
  vim.keymap.set(mode, "k", "l", { noremap = true })  -- 右
  vim.keymap.set(mode, ";", "i", { noremap = true })  -- Insert
  vim.keymap.set(mode, "h", "^", { noremap = true })  -- 非空白行頭
  vim.keymap.set(mode, "l", "$", { noremap = true })  -- 行末
  vim.keymap.set(mode, "M", "m", { noremap = true })  -- マーク
end
-- Insert モード関連の派生キーも再マップ
vim.keymap.set("n", "L", "I", { noremap = true })     -- 行頭 Insert
vim.keymap.set("n", "gl", "gi", { noremap = true })   -- 直前の Insert 位置へ

-- 行頭・行末移動の入れ替え
vim.keymap.set("n", "H", "^", { noremap = true })     -- 非空白行頭
vim.keymap.set("n", "^", "H", { noremap = true })     -- 画面上端
vim.keymap.set("n", "$", ";", { noremap = true })      -- f/t 繰り返し

-- プラグインマネージャ lazy.nvim のセットアップ
local lazypath = vim.fn.stdpath("data") .. "/lazy/lazy.nvim"
if not vim.loop.fs_stat(lazypath) then
  vim.fn.system({
    "git", "clone", "--filter=blob:none",
    "https://github.com/folke/lazy.nvim.git",
    "--branch=stable", lazypath,
  })
end
vim.opt.rtp:prepend(lazypath)

-- 残りの設定ファイルの読み込み
require("lazy").setup({
  { import = "plugins" },
})

