return {
  "nvim-neo-tree/neo-tree.nvim",
  branch = "v3.x",
  dependencies = {
    "nvim-lua/plenary.nvim",
    "nvim-tree/nvim-web-devicons",
    "MunifTanjim/nui.nvim",
  },

  opts = {
    filesystem = {
      follow_current_file = { enabled = true },
      filtered_items = {
        hide_dotfiles = false,
        hide_gitignored = false,
      },
    },
    window = {
      width = 30,
      mappings = {
        -- デフォルトの i と m を無効化（移動キーとして使うため）
        ["i"] = "none",
        ["m"] = "none",
      },
    },
    default_component_configs = {
      icon = {
        folder_closed = "",
        folder_open = "",
        folder_empty = "",
      },
      git_status = {
        symbols = {
          added = "",
          modified = "",
          deleted = "✖",
          renamed = "󰁕",
          untracked = "",
        },
      },
    },
  },

  keys = {
    { "<leader>r", "<cmd>Neotree focus<CR>", desc = "ファイルツリーを開く" },
    { "<leader>e", "<cmd>Neotree toggle<CR>", desc = "ファイルツリーの表示/非表示" },
  },
}
