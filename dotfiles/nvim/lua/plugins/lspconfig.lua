return {
  "neovim/nvim-lspconfig",

  config = function()
    local capabilities = require("cmp_nvim_lsp").default_capabilities()

    vim.lsp.config("lua_ls", {
      capabilities = capabilities,
      settings = {
        Lua = {
          diagnostics = { globals = { "vim" } },
        },
      },
    })
    vim.lsp.enable("lua_ls")

    vim.lsp.config("vtsls", {
      capabilities = capabilities,
    })
    vim.lsp.enable("vtsls")

    -- キーマップ
    vim.api.nvim_create_autocmd("LspAttach", {
      callback = function(args)
        local buf = args.buf
        local map = function(key, fn, desc)
          vim.keymap.set("n", key, fn, { buffer = buf, desc = desc })
        end
        map("<leader>d", vim.lsp.buf.definition, "定義へジャンプ")
        map("gr", vim.lsp.buf.references, "参照一覧")
        map("K", vim.lsp.buf.hover, "ホバー情報")
        map("<leader>ca", vim.lsp.buf.code_action, "コードアクション")
        map("<leader>rn", vim.lsp.buf.rename, "リネーム")
      end,
    })
  end,
}
