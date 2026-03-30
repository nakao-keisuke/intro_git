
# zsh-autosuggestions
source /opt/homebrew/share/zsh-autosuggestions/zsh-autosuggestions.zsh

# fzf
source <(fzf --zsh)
eval "$(zoxide init zsh)"

# cargo
export PATH="$HOME/.cargo/bin:$PATH"

# uv tools
export PATH="$HOME/.local/bin:$PATH"

# aliases
alias d=z
alias ls="eza --icons --git"
alias ll="eza -l --icons --git"
alias la="eza -la --icons --git"
alias tree="eza --tree --icons"
alias rg="rg --smart-case"

# karabiner neovim_mode wrapper
_karabiner_cli="/Library/Application Support/org.pqrs/Karabiner-Elements/bin/karabiner_cli"

# yazi (karabiner + cwd sync)
function yazi() {
  local tmp="$(mktemp -t "yazi-cwd.XXXXXX")" cwd
  command yazi "$@" --cwd-file="$tmp"

  "$_karabiner_cli" --set-variables '{"neovim_mode": 0}'

  if cwd="$(command cat -- "$tmp")" && [ -n "$cwd" ] && [ "$cwd" != "$PWD" ]; then
    builtin cd -- "$cwd"
  fi
  rm -f -- "$tmp"
}

# lazygit (karabiner)
function lazygit() {
  "$_karabiner_cli" --set-variables '{"neovim_mode": 1}'
  command lazygit "$@"
  "$_karabiner_cli" --set-variables '{"neovim_mode": 0}'
}

# lazysql (karabiner)
function lazysql() {
  "$_karabiner_cli" --set-variables '{"neovim_mode": 1}'
  command lazysql "$@"
  "$_karabiner_cli" --set-variables '{"neovim_mode": 0}'
}

# vi-mongo (karabiner)
function vi-mongo() {
  "$_karabiner_cli" --set-variables '{"neovim_mode": 1}'
  command vi-mongo "$@"
  "$_karabiner_cli" --set-variables '{"neovim_mode": 0}'
}

export PATH="$HOME/go/bin:$PATH"

export DOCKER_HOST=unix:///Users/kn/.colima/default/docker.sock
