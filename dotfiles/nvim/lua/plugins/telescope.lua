return {
  "nvim-telescope/telescope.nvim",
  dependencies = { "nvim-lua/plenary.nvim" },

  keys = {
    { "<leader>ff", "<cmd>Telescope find_files<CR>", desc = "ファイル検索" },
    { "<leader>fg", "<cmd>Telescope live_grep<CR>", desc = "文字列検索" },
    { "<leader>fb", "<cmd>Telescope buffers<CR>", desc = "バッファ一覧" },
  },
}
