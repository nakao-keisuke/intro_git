return {
  "mfussenegger/nvim-jdtls",
  ft = { "java" },
  config = function()
    local jdtls = require("jdtls")
    local jdtls_path = vim.fn.exepath("jdtls")

    local project_name = vim.fn.fnamemodify(vim.fn.getcwd(), ":p:h:t")
    local workspace_dir = vim.fn.stdpath("data") .. "/jdtls-workspace/" .. project_name

    vim.api.nvim_create_autocmd("FileType", {
      pattern = "java",
      callback = function()
        jdtls.start_or_attach({
          cmd = { jdtls_path, "-data", workspace_dir },
          root_dir = require("jdtls.setup").find_root({ ".git", "mvnw", "gradlew", "pom.xml", "build.gradle" }),
          capabilities = require("cmp_nvim_lsp").default_capabilities(),
        })
      end,
    })
  end,
}
