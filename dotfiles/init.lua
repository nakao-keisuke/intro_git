-- Ctrl + D でモニター切替
-- ・別モニターの「現在表示されているSpaceのウィンドウ」のうち
--   最後に使われたものへフォーカス
-- ・カーソルもそのモニターへ移動
-- ・ウィンドウは移動しない

-- カーソルエフェクト（キラキラ）
local effectCanvases = {}
local effectTimers = {}

local function cleanupEffects()
    for _, t in ipairs(effectTimers) do t:stop() end
    for _, c in ipairs(effectCanvases) do c:delete() end
    effectCanvases = {}
    effectTimers = {}
end

local function cursorEffect()
    cleanupEffects()

    local pos = hs.mouse.getAbsolutePosition()

    -- キラキラ粒子を放射状に飛ばす
    local sparkleCount = 8
    local sparkles = {}
    for i = 1, sparkleCount do
        local angle = (2 * math.pi / sparkleCount) * i + math.random() * 0.5
        local dist = 15 + math.random() * 10  -- 初期距離
        local speed = 80 + math.random() * 60 -- 飛ぶ速度
        local size = 4 + math.random() * 5
        local hueShift = math.random() * 0.3

        local s = hs.canvas.new({
            x = pos.x - size / 2 + math.cos(angle) * dist,
            y = pos.y - size / 2 + math.sin(angle) * dist,
            w = size, h = size
        })
        -- 十字の輝き（星型）
        s[1] = {
            type = "circle", action = "fill",
            fillColor = {
                red = 0.5 + hueShift,
                green = 0.85,
                blue = 1.0,
                alpha = 1.0
            }
        }
        s:show()
        table.insert(effectCanvases, s)
        table.insert(sparkles, {
            canvas = s, angle = angle, dist = dist,
            speed = speed, size = size, baseX = pos.x, baseY = pos.y
        })
    end

    -- アニメーション（5フレーム、合計 ~0.3秒）
    local totalFrames = 5
    local frameInterval = 0.05
    local frame = 0

    local function animateFrame()
        frame = frame + 1
        if frame > totalFrames then
            cleanupEffects()
            return
        end

        local progress = frame / totalFrames  -- 0→1

        -- 粒子を外側に飛ばしながらフェードアウト
        for _, sp in ipairs(sparkles) do
            pcall(function()
                sp.dist = sp.dist + sp.speed * frameInterval
                local newSize = sp.size * (1 - progress * 0.7)
                local nx = sp.baseX - newSize / 2 + math.cos(sp.angle) * sp.dist
                local ny = sp.baseY - newSize / 2 + math.sin(sp.angle) * sp.dist
                sp.canvas:frame({ x = nx, y = ny, w = newSize, h = newSize })
                sp.canvas[1].fillColor = {
                    red = sp.canvas[1].fillColor.red,
                    green = 0.85, blue = 1.0,
                    alpha = 1.0 * (1 - progress)
                }
            end)
        end

        local t = hs.timer.doAfter(frameInterval, animateFrame)
        table.insert(effectTimers, t)
    end

    local t = hs.timer.doAfter(frameInterval, animateFrame)
    table.insert(effectTimers, t)
end


local function focusWindowOnNextScreen()

    local currentWindow = hs.window.focusedWindow()
    if not currentWindow then return end

    local currentScreen = currentWindow:screen()
    local nextScreen = currentScreen:next()

    local targetWindow = nil

    -- orderedWindows は「最近使った順」
    for _, win in ipairs(hs.window.orderedWindows()) do
        if win:isVisible()
        and win:screen() == nextScreen
        and win:application():isRunning() then
            targetWindow = win
            break
        end
    end

    if targetWindow then
        targetWindow:focus()

        -- カーソルをモニター中央へ
        local frame = nextScreen:frame()
        hs.mouse.setAbsolutePosition({
            x = frame.x + frame.w / 2,
            y = frame.y + frame.h / 2
        })

        -- エフェクト
        cursorEffect()
    end
end

hs.hotkey.bind({"cmd"}, ";", focusWindowOnNextScreen)
