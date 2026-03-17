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
