local karabiner_cli = "/Library/Application Support/org.pqrs/Karabiner-Elements/bin/karabiner_cli"

vim.api.nvim_create_autocmd("VimEnter", {
  callback = function()
    vim.fn.jobstart({ karabiner_cli, "--set-variables", '{"neovim_mode": 1}' })
  end,
})

vim.api.nvim_create_autocmd("VimLeave", {
  callback = function()
    vim.fn.system({ karabiner_cli, "--set-variables", '{"neovim_mode": 0}' })
  end,
})

require("config.init")
