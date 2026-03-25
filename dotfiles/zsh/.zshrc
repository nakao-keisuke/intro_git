# Java
export JAVA_HOME="/opt/homebrew/Cellar/openjdk/25.0.2/libexec/openjdk.jdk/Contents/Home"
export PATH="$JAVA_HOME/bin:$PATH"

# Homebrew (Apple Silicon / M1〜M4)
export PATH="/opt/homebrew/bin:/opt/homebrew/sbin:$PATH"

# rbenv
export PATH="$HOME/.rbenv/bin:$PATH"
eval "$(rbenv init -)"


# Added by Antigravity
export PATH="/Users/nakaokeisuke/.antigravity/antigravity/bin:$PATH"

# Android Studio
export ANDROID_HOME=$HOME/Library/Android/sdk                                
export PATH=$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools:$PATH 

# zsh-autosuggestions
source /opt/homebrew/share/zsh-autosuggestions/zsh-autosuggestions.zsh

# fzf
source <(fzf --zsh)
eval "$(zoxide init zsh)"

# aliases
alias d=z

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
