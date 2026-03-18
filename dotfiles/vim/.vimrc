autocmd VimEnter * silent! call system('/Library/Application\ Support/org.pqrs/Karabiner-Elements/bin/karabiner_cli --set-variables ''{"neovim_mode": 1}''')
autocmd VimLeave * silent! call system('/Library/Application\ Support/org.pqrs/Karabiner-Elements/bin/karabiner_cli --set-variables ''{"neovim_mode": 0}''')

" LeaderキーをSpaceに
let mapleader=" "

" 保存
nnoremap <leader>w :w<CR>

" 終了
nnoremap <leader>q :q<CR>

" 保存して終了
nnoremap <leader>s :wq<CR>

" 強制終了
nnoremap <leader>qf :q!<CR>

" 移動キーを jmik に変更
noremap j h
noremap m j
noremap i k
noremap k l
noremap ; i
noremap h ^
noremap l $
noremap M m

" Insert モード関連の派生キー
nnoremap L I
nnoremap gl gi

" 行頭・行末移動の入れ替え
nnoremap H ^
nnoremap ^ H
nnoremap $ ;
