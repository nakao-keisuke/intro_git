-- ~/.config/nvim/lua/plugins/nvim-tree.lua

return {
  "nvim-tree/nvim-tree.lua",
  dependencies = { "nvim-tree/nvim-web-devicons" },
  
  opts = {
    view = { 
      width = 30,
      centralize_selection = true, 
    },
    update_focused_file = { 
      enable = true, 
    },
    renderer = { group_empty = true },
    filters = { dotfiles = false, git_ignored = false },
  },
  
  config = function(_, opts)
    require("nvim-tree").setup(opts)
    
    vim.keymap.set("n", "<leader>r", ":NvimTreeFocus<CR>", { desc = "ファイルツリーを開く" })
    vim.keymap.set("n", "<leader>e", ":NvimTreeToggle<CR>", { desc = "ファイルツリーの表示/非表示" })
  end,
}

