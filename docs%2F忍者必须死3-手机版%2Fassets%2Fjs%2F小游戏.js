/*
 * 快乐是种天赋 - 小游戏脚本
 * 忍者必须死3 玩家自制页面
 * 包含：抽卡模拟器
 * 说明：不使用 ES6 模块，普通 script，代码风格简单清晰，适合新手理解
 */

window.addEventListener('DOMContentLoaded', function () {

    /* ===================================================
     * 第一部分：抽卡模拟器
     * =================================================== */

    // 抽卡奖池（带稀有度、奖励内容、角色图片）
    // img: 角色立绘路径；reward: 抽到时显示的奖励文字；type: 资源类型（用于累计统计）
    var POOL = {
        SSR: [
            { name: '苍牙', reward: '苍牙 ×1', type: 'ssr', img: '../assets/images/苍牙.WEBP' },
            { name: '琳',   reward: '琳 ×1',   type: 'ssr', img: '../assets/images/琳WEBP.WEBP' },
            { name: '伊鹤', reward: '伊鹤 ×1', type: 'ssr', img: '../assets/images/伊鹤.WEBP' },
            { name: '洛青', reward: '洛青 ×1', type: 'ssr', img: '../assets/images/洛青.WEBP' },
            { name: '银枭', reward: '银枭 ×1', type: 'ssr', img: '../assets/images/银枭.WEBP' },
            { name: '卫鲤', reward: '卫鲤 ×1', type: 'ssr', img: '../assets/images/卫鲤.WEBP' },
            { name: '兮兰', reward: '兮兰 ×1', type: 'ssr', img: '../assets/images/兮兰.WEBP' },
            { name: '紫原', reward: '紫原 ×1', type: 'ssr', img: '../assets/images/紫原.WEBP' },
            { name: '隼白', reward: '隼白 ×1', type: 'ssr', img: '../assets/images/隼白.WEBP' },
            { name: '剑客：血影', reward: '血影 ×1', type: 'ssr', img: '../assets/images/血影.WEBP' },
            { name: '小黑',   reward: '小黑 ×1',   type: 'ssr', img: '../assets/images/小黑.WEBP' },
            { name: '阿力',   reward: '阿力 ×1',   type: 'ssr', img: '../assets/images/阿力.WEBP' },
            { name: '小椒',   reward: '小椒 ×1',   type: 'ssr', img: '../assets/images/小椒.WEBP' },
            { name: '老板娘', reward: '老板娘 ×1', type: 'ssr', img: '../assets/images/老板娘.WEBP' }
        ],
        SR: [
            { name: '角色碎片', reward: '角色碎片 ×5', type: 'frag', amount: 5 }
        ],
        R: [
            { name: '忍者碎片', reward: '忍者碎片 ×5', type: 'frag', amount: 5 },
            { name: '勾玉',     reward: '勾玉 ×30',   type: 'jade', amount: 30 },
            { name: '金币包',   reward: '金币 ×500',  type: 'coin', amount: 500 }
        ],
        // UR「牢」：极低概率独立稀有度
        UR: [
            { name: '牢牙',   reward: 'UR·牢牙 ×1',   type: 'ur', img: '../assets/images/牢牙.png' },
            { name: '牢琳',   reward: 'UR·牢琳 ×1',   type: 'ur', img: '../assets/images/牢琳.png' },
            { name: '牢青',   reward: 'UR·牢青 ×1',   type: 'ur', img: '../assets/images/牢青.png' },
            { name: '牢枭',   reward: 'UR·牢枭 ×1',   type: 'ur', img: '../assets/images/牢枭.jpg' },
            { name: '牢原',   reward: 'UR·牢原 ×1',   type: 'ur', img: '../assets/images/牢原.jpg' },
            { name: '牢黑',   reward: 'UR·牢黑 ×1',   type: 'ur', img: '../assets/images/牢黑.jpg' },
            { name: '牢力',   reward: 'UR·牢力 ×1',   type: 'ur', img: '../assets/images/牢力.png' },
            { name: '牢椒',   reward: 'UR·牢椒 ×1',   type: 'ur', img: '../assets/images/牢椒.png' },
            { name: '牢板娘', reward: 'UR·牢板娘 ×1', type: 'ur', img: '../assets/images/牢板娘.jpg' }
        ]
    };

    // 概率配置
    var PROB_UR  = 0.002;         // UR 基础概率 0.2%（牢忍者）
    var PROB_SSR = 0.012;         // SSR 基础概率 1.2%
    var PROB_SR  = 0.10;          // SR 概率 10%
    var PITY_MAX = 60;            // 60 抽硬保底（必出SSR或以上）
    var SOFT_PITY = 50;           // 50 抽开始软保底，每抽概率递增
    var SOFT_PITY_STEP = 0.04;    // 软保底每抽概率+4%

    // 抽卡状态
    var gachaCount = 0;     // 已抽总次数
    var pityCounter = 0;    // 距离上次出 SSR 的次数（达到 60 必出 SSR）
    var history = [];       // 抽卡历史记录
    var animating = false;  // 是否正在播放抽卡动画（防止重复点击）

    // 资源累计统计
    var inventory = { ssr: 0, sr: 0, frag: 0, jade: 0, coin: 0, ur: 0 };

    // 定向选择目标：null=无定向，{pool:'SSR'|'UR', idx:索引}
    var targetChar = null;

    /* ===== 状态保存/恢复（localStorage） ===== */
    function saveState() {
        try {
            localStorage.setItem('gachaState', JSON.stringify({
                gachaCount: gachaCount,
                pityCounter: pityCounter,
                inventory: inventory,
                history: history.slice(0, 50), // 最多保存50条
                targetChar: targetChar
            }));
        } catch (e) {}
    }

    function loadState() {
        try {
            var saved = localStorage.getItem('gachaState');
            if (!saved) return;
            var s = JSON.parse(saved);
            if (typeof s.gachaCount === 'number') gachaCount = s.gachaCount;
            if (typeof s.pityCounter === 'number') pityCounter = s.pityCounter;
            if (s.inventory) inventory = s.inventory;
            if (Array.isArray(s.history)) history = s.history;
            if (s.targetChar) targetChar = s.targetChar;
        } catch (e) {}
    }

    // 页面加载时恢复状态
    loadState();

    // 获取音频元素
    var audioGacha = document.getElementById('audioGacha'); // 抽卡背景音
    var audioGold  = document.getElementById('audioGold');  // 出金音效

    // 播放出金音效（SSR/UR）
    function playGoldSound() {
        if (audioGold) {
            audioGold.currentTime = 0;
            audioGold.play();
        }
    }

    // 获取 DOM 元素
    var gachaCard     = document.getElementById('gachaCard');
    var gachaName       = document.getElementById('gachaName');
    var gachaRarity     = document.getElementById('gachaRarity');
    var gachaReward     = document.getElementById('gachaReward');
    var gachaImg        = document.getElementById('gachaImg');
    var gachaImgWrap    = document.getElementById('gachaImgWrap');
    var gachaPlaceholder = document.getElementById('gachaPlaceholder');
    var gachaHiddenTag  = document.getElementById('gachaHiddenTag');
    var gachaCountEl    = document.getElementById('gachaCount');
    var pityNumEl       = document.getElementById('pityNum');
    var pityBarEl       = document.getElementById('pityBar');
    var historyList     = document.getElementById('historyList');
    var invSSREl        = document.getElementById('invSSR');
    var invUREl         = document.getElementById('invUR');
    var invSREl         = document.getElementById('invSR');
    var invFragEl       = document.getElementById('invFrag');
    var invJadeEl       = document.getElementById('invJade');
    var invCoinEl       = document.getElementById('invCoin');
    var btnSingle       = document.getElementById('btnSingle');
    var btnTen          = document.getElementById('btnTen');

    // 结果展示层 DOM
    var resultOverlay   = document.getElementById('gachaResultOverlay');
    var resultGrid      = document.getElementById('gachaResultGrid');
    var resultHint      = document.getElementById('gachaResultHint');

    // 抽卡券 DOM
    var ticketsBar     = document.getElementById('gachaTicketsBar');
    var ticketsNumEl   = document.getElementById('gachaTicketsNum');

    // 定向选择 DOM
    var targetGrid     = document.getElementById('targetGrid');
    var targetDisplay  = document.getElementById('targetDisplay');
    var targetClearBtn = document.getElementById('targetClear');
    var targetTabs     = document.querySelectorAll('.target-tab');

    // 初始：隐藏款角标
    gachaHiddenTag.style.display = 'none';

    /* ===== 抽卡券管理（与种棉花联动） ===== */
    function getTickets() {
        return parseInt(localStorage.getItem('gachaTickets') || '0', 10);
    }

    function consumeTicket() {
        var t = getTickets();
        if (t > 0) {
            localStorage.setItem('gachaTickets', t - 1);
        }
        updateTicketsDisplay();
    }

    function updateTicketsDisplay() {
        var t = getTickets();
        ticketsNumEl.textContent = t;
        if (t <= 0) {
            ticketsBar.classList.add('no-tickets');
        } else {
            ticketsBar.classList.remove('no-tickets');
        }
    }

    // 无抽卡券提示
    function alertNoTickets() {
        ticketsBar.classList.remove('shake-alert');
        void ticketsBar.offsetWidth;
        ticketsBar.classList.add('shake-alert');
        setTimeout(function () {
            ticketsBar.classList.remove('shake-alert');
        }, 500);
    }

    /* ===== 定向选择面板 ===== */
    var currentTab = 'SSR'; // 当前标签页：SSR 或 UR

    // 渲染角色网格
    function renderTargetGrid() {
        var list = POOL[currentTab];
        var html = '';
        for (var i = 0; i < list.length; i++) {
            var char = list[i];
            var isUR = (currentTab === 'UR');
            var isSelected = targetChar && targetChar.pool === currentTab && targetChar.idx === i;
            html += '<div class="target-item' + (isSelected ? ' selected' : '') + (isUR ? ' ur-item' : '') + '" '
                + 'data-pool="' + currentTab + '" data-idx="' + i + '" title="' + char.name + '">'
                + '<img src="' + char.img + '" alt="' + char.name + '" loading="lazy">'
                + '<div class="target-item-name">' + char.name + '</div>'
                + '</div>';
        }
        targetGrid.innerHTML = html;

        // 绑定点击事件
        var items = targetGrid.querySelectorAll('.target-item');
        for (var k = 0; k < items.length; k++) {
            items[k].addEventListener('click', onTargetItemClick);
        }
    }

    // 点击角色选择定向
    function onTargetItemClick() {
        var pool = this.getAttribute('data-pool');
        var idx = parseInt(this.getAttribute('data-idx'), 10);

        // 如果已选中同一个，则取消
        if (targetChar && targetChar.pool === pool && targetChar.idx === idx) {
            clearTarget();
            return;
        }

        targetChar = { pool: pool, idx: idx };
        var char = POOL[pool][idx];
        var isUR = (pool === 'UR');

        // 更新大图展示
        targetDisplay.innerHTML = '<img src="' + char.img + '" alt="' + char.name + '">'
            + '<div class="target-name">' + char.name + '</div>';
        targetDisplay.classList.add('has-target');
        if (isUR) {
            targetDisplay.classList.add('ur-target');
        } else {
            targetDisplay.classList.remove('ur-target');
        }

        // 更新网格选中状态
        renderTargetGrid();
        saveState();
    }

    // 取消定向
    function clearTarget() {
        targetChar = null;
        targetDisplay.innerHTML = '<div class="target-placeholder">未选择<br>点击下方角色</div>';
        targetDisplay.classList.remove('has-target', 'ur-target');
        renderTargetGrid();
        saveState();
    }

    // 标签页切换
    for (var t = 0; t < targetTabs.length; t++) {
        targetTabs[t].addEventListener('click', function () {
            for (var j = 0; j < targetTabs.length; j++) {
                targetTabs[j].classList.remove('active');
            }
            this.classList.add('active');
            currentTab = this.getAttribute('data-pool');
            renderTargetGrid();
        });
    }

    // 取消定向按钮
    targetClearBtn.addEventListener('click', clearTarget);

    // 初始化定向面板
    renderTargetGrid();
    updateTicketsDisplay();

    // 恢复保存的状态到 UI
    updateStats();
    updateInventory();
    renderHistory();

    // 如果有保存的定向选择，恢复显示（带越界检查）
    if (targetChar && POOL[targetChar.pool] && POOL[targetChar.pool][targetChar.idx]) {
        var savedChar = POOL[targetChar.pool][targetChar.idx];
        var isUR = (targetChar.pool === 'UR');
        targetDisplay.innerHTML = '<img src="' + savedChar.img + '" alt="' + savedChar.name + '">'
            + '<div class="target-name">' + savedChar.name + '</div>';
        targetDisplay.classList.add('has-target');
        if (isUR) targetDisplay.classList.add('ur-target');
        renderTargetGrid(); // 重新渲染以显示选中状态
    } else if (targetChar) {
        // 保存的数据越界，清除
        targetChar = null;
    }

    // 从某个稀有度池中随机取一个
    function pickRandom(rarity) {
        var arr = POOL[rarity];
        return arr[Math.floor(Math.random() * arr.length)];
    }

    // 执行一次抽卡，返回 { name, rarity, reward, type, img, offRate }
    function drawOnce() {
        gachaCount++;
        pityCounter++;

        var rarity;
        var isOffRate = false; // 是否"歪了"（定向未命中）

        // 硬保底：达到 60 抽必出 SSR 或以上
        if (pityCounter >= PITY_MAX) {
            rarity = Math.random() < 0.15 ? 'UR' : 'SSR';
        } else {
            var r = Math.random();
            // UR 独立概率
            if (r < PROB_UR) {
                rarity = 'UR';
            } else {
                // 软保底：50抽后每抽SSR概率递增
                var ssrProb = PROB_SSR;
                if (pityCounter >= SOFT_PITY) {
                    ssrProb += (pityCounter - (SOFT_PITY - 1)) * SOFT_PITY_STEP;
                }
                if (ssrProb > 1) ssrProb = 1;

                if (r < PROB_UR + ssrProb) {
                    rarity = 'SSR';
                } else if (r < PROB_UR + ssrProb + PROB_SR) {
                    rarity = 'SR';
                } else {
                    rarity = 'R';
                }
            }
        }

        // 出 SSR 或 UR 后重置保底计数
        if (rarity === 'SSR' || rarity === 'UR') {
            pityCounter = 0;
        }

        var item;

        // ===== 定向选择逻辑（参考主流抽卡UP机制）=====
        if ((rarity === 'SSR' || rarity === 'UR') && targetChar) {
            // 出金时有概率命中定向，否则"歪"到同池其他角色
            var hitRate = (targetChar.pool === 'UR') ? 0.20 : 0.50;
            if (Math.random() < hitRate) {
                // 命中定向角色
                item = POOL[targetChar.pool][targetChar.idx];
                rarity = targetChar.pool;
            } else {
                // 歪了：从同稀有度池随机（排除定向角色）
                var pool = POOL[targetChar.pool];
                do {
                    item = pool[Math.floor(Math.random() * pool.length)];
                } while (item === POOL[targetChar.pool][targetChar.idx] && pool.length > 1);
                rarity = targetChar.pool;
                isOffRate = true;
            }
        } else if (rarity === 'SSR' && !targetChar) {
            // 无定向时，SSR 有小概率升级为 UR
            if (Math.random() < 0.05) {
                item = pickRandom('UR');
                rarity = 'UR';
                pityCounter = 0;
            } else {
                item = pickRandom(rarity);
            }
        } else {
            item = pickRandom(rarity);
        }

        // 累计资源
        if (item.type === 'ur') inventory.ur++;
        else if (item.type === 'ssr') inventory.ssr++;
        else if (item.type === 'sr') inventory.sr++;
        else if (item.type === 'frag') inventory.frag += item.amount;
        else if (item.type === 'jade') inventory.jade += item.amount;
        else if (item.type === 'coin') inventory.coin += item.amount;

        return {
            name: item.name,
            rarity: rarity,
            reward: item.reward,
            type: item.type,
            img: item.img || '',
            offRate: isOffRate
        };
    }

    // 更新资源总览
    function updateInventory() {
        invUREl.textContent = inventory.ur;
        invSSREl.textContent = inventory.ssr;
        invSREl.textContent = inventory.sr;
        invFragEl.textContent = inventory.frag;
        invJadeEl.textContent = inventory.jade;
        invCoinEl.textContent = inventory.coin;
    }

    // 更新已抽次数与保底进度条
    function updateStats() {
        gachaCountEl.textContent = gachaCount;
        pityNumEl.textContent = pityCounter;
        var percent = (pityCounter / PITY_MAX) * 100;
        pityBarEl.style.width = percent + '%';
    }

    // 渲染历史记录列表
    function renderHistory() {
        if (history.length === 0) {
            historyList.innerHTML = '<div class="history-empty">暂无抽卡记录</div>';
            return;
        }
        var html = '';
        var showCount = Math.min(history.length, 30);
        for (var i = 0; i < showCount; i++) {
            var h = history[i];
            var rarityCls = h.rarity;
            var isUR = (h.rarity === 'UR');
            html += '<div class="history-item rarity-' + rarityCls + '">'
                + '<div class="h-rarity-bar ' + rarityCls + '"></div>'
                + (h.img ? '<div class="h-img" style="background-image:url(' + h.img + ')"></div>' : '<div class="h-img h-img-text">' + (isUR ? '牢' : '?') + '</div>')
                + '<div class="h-name">' + h.name + '</div>'
                + '<div class="h-rarity-text ' + rarityCls + '">' + h.rarity + '</div>'
                + '</div>';
        }
        historyList.innerHTML = html;
    }

    // 更新主卡片显示（展示完后在主区域显示最佳结果）
    function updateMainCard(result) {
        gachaRarity.textContent = result.rarity;
        gachaRarity.className = 'gacha-card-rarity rarity-' + result.rarity;

        gachaName.textContent = result.name;
        gachaName.className = 'gacha-card-name rarity-' + result.rarity;
        gachaReward.textContent = result.reward || '';
        gachaReward.className = 'gacha-card-reward rarity-' + result.rarity;

        if (result.img) {
            gachaImg.src = result.img;
            gachaImg.style.display = 'block';
            gachaPlaceholder.style.display = 'none';
            gachaImgWrap.classList.add('has-img');
        } else {
            gachaImg.src = '';
            gachaImg.style.display = 'none';
            gachaPlaceholder.style.display = 'flex';
            gachaImgWrap.classList.remove('has-img');
        }

        // UR 显示特殊角标
        if (result.rarity === 'UR') {
            gachaHiddenTag.style.display = 'block';
            gachaHiddenTag.textContent = 'UR';
        } else {
            gachaHiddenTag.style.display = 'none';
        }
    }

    // 生成单张结果卡片的 HTML
    function buildResultCardHTML(result) {
        var rarityCls = result.rarity;
        var isGold = (rarityCls === 'SSR' || rarityCls === 'UR');

        var imgHTML = '';
        if (result.img) {
            imgHTML = '<img class="rcard-img" src="' + result.img + '" alt="' + result.name + '">';
        } else {
            imgHTML = '<div class="rcard-imgplaceholder">' + (rarityCls === 'UR' ? '牢' : '?') + '</div>';
        }

        var offRateTag = result.offRate ? '<div class="rcard-offrate-tag">歪了</div>' : '';

        // SSR/UR 不显示稀有度文字，保留神秘感；SR/R 显示
        var rarityHTML = isGold ? '' : '<div class="rcard-rarity">' + rarityCls + '</div>';

        return '<div class="rcard rarity-' + rarityCls + '">'
            + offRateTag
            + '<div class="rcard-inner">'
            + '<div class="rcard-back">？</div>'
            + '<div class="rcard-front">'
            + '<div class="rcard-imgwrap">' + imgHTML + '</div>'
            + '<div class="rcard-info">'
            + rarityHTML
            + '<div class="rcard-name">' + result.name + '</div>'
            + '</div>'
            + '</div>'
            + '</div>'
            + '</div>';
    }

    // 从一批结果中选出最佳展示（UR > SSR > SR > R）
    function pickBest(results) {
        var best = results[0];
        for (var i = 1; i < results.length; i++) {
            var r = results[i];
            if (r.rarity === 'UR' && best.rarity !== 'UR') { best = r; }
            else if (r.rarity === 'SSR' && best.rarity !== 'SSR' && best.rarity !== 'UR') { best = r; }
            else if (r.rarity === 'SR' && best.rarity === 'R') { best = r; }
        }
        return best;
    }

    // 展示抽卡结果：全屏 overlay + 卡片网格 + 依次翻转
    function showResults(results) {
        animating = true;
        btnSingle.disabled = true;
        btnTen.disabled = true;

        // 生成卡片 HTML
        var isSingle = results.length === 1;
        resultGrid.className = isSingle ? 'gacha-result-grid single' : 'gacha-result-grid';
        resultGrid.innerHTML = '';
        for (var i = 0; i < results.length; i++) {
            resultGrid.innerHTML += buildResultCardHTML(results[i]);
        }

        resultHint.style.display = 'none';
        resultOverlay.classList.add('active');

        var cards = resultGrid.querySelectorAll('.rcard');
        var flipStartDelay = 300;      // dg 开始后多久翻第一张非金卡
        var goldFlipStartDelay = 100;  // dg 结束后多久翻第一张金卡
        var goldFlipInterval = 250;    // 金卡之间翻转间隔

        // 待完成翻转的卡片数：归零后立即解除锁定（不再强制等待额外时间）
        var pendingFlips = results.length;

        function onCardFlipDone() {
            pendingFlips--;
            if (pendingFlips <= 0) {
                resultHint.style.display = 'block';
                animating = false;
                btnSingle.disabled = false;
                btnTen.disabled = false;
            }
        }

        // 翻转一张卡片（翻转动画完成后回调 onCardFlipDone）
        function flipCard(card, idx, result) {
            card.classList.add('flipped');
            if (result.rarity === 'UR') {
                card.classList.add('ur-extended');
                document.body.classList.add('screen-shake');
                setTimeout(function () {
                    document.body.classList.remove('screen-shake');
                }, 800);
            }
            // 翻转动画时长：UR 2500ms，其他 600ms
            var flipAnimDuration = result.rarity === 'UR' ? 2500 : 600;
            setTimeout(onCardFlipDone, flipAnimDuration);
        }

        // 分离金卡和非金卡索引
        var goldIndices = [];
        var nonGoldIndices = [];
        for (var i = 0; i < results.length; i++) {
            var r = results[i];
            if (r.rarity === 'SSR' || r.rarity === 'UR') {
                goldIndices.push(i);
            } else {
                nonGoldIndices.push(i);
            }
        }

        // 计算非金卡翻转间隔（根据 dg 音频时长均匀分布）
        function getNonGoldFlipDelay(count) {
            if (audioGacha && audioGacha.duration && !isNaN(audioGacha.duration) && count > 0) {
                return Math.max(120, (audioGacha.duration * 800) / count);
            }
            return isSingle ? 500 : 150;
        }

        var flipDelay = getNonGoldFlipDelay(nonGoldIndices.length || 1);

        // dg 播放时翻转非金卡（SR/R）
        function startNonGoldFlip() {
            for (var k = 0; k < nonGoldIndices.length; k++) {
                (function (cardIdx, orderIdx) {
                    var result = results[cardIdx];
                    var delay = flipStartDelay + orderIdx * flipDelay;
                    setTimeout(function () {
                        flipCard(cards[cardIdx], cardIdx, result);
                    }, delay);
                })(nonGoldIndices[k], k);
            }
        }

        // dg 播放完毕后翻转金卡（立即开始，金卡之间间隔 250ms）
        function startGoldFlip() {
            for (var k = 0; k < goldIndices.length; k++) {
                (function (cardIdx, orderIdx) {
                    var result = results[cardIdx];
                    var delay = goldFlipStartDelay + orderIdx * goldFlipInterval;
                    setTimeout(function () {
                        playGoldSound(); // 出金翻转时同步播放 j 音效
                        flipCard(cards[cardIdx], cardIdx, result);
                    }, delay);
                })(goldIndices[k], k);
            }
        }

        // 播放 dg 音频，同时翻转非金卡，dg 播完翻转金卡
        if (audioGacha) {
            audioGacha.currentTime = 0;
            audioGacha.play();

            startNonGoldFlip(); // dg 播放同时翻转 SR/R

            var goldFlipped = false;
            audioGacha.addEventListener('ended', function onEnded() {
                audioGacha.removeEventListener('ended', onEnded);
                if (!goldFlipped) {
                    goldFlipped = true;
                    if (goldIndices.length > 0) {
                        startGoldFlip(); // dg 播完翻转金卡
                    }
                }
            });
            // 兜底：dg 时长 + 2秒后若金卡仍未翻转，强制开始
            var fallbackDelay = (audioGacha.duration && !isNaN(audioGacha.duration))
                ? (audioGacha.duration * 1000 + 2000)
                : 8000;
            setTimeout(function () {
                if (!goldFlipped) {
                    goldFlipped = true;
                    if (goldIndices.length > 0) startGoldFlip();
                }
            }, fallbackDelay);
        } else {
            // 无 dg 音频：直接按顺序翻转
            var defaultDelay = isSingle ? 500 : 150;
            for (var i = 0; i < results.length; i++) {
                (function (cardIdx, orderIdx) {
                    var result = results[cardIdx];
                    var isGold = (result.rarity === 'SSR' || result.rarity === 'UR');
                    var delay = flipStartDelay + orderIdx * defaultDelay;
                    setTimeout(function () {
                        if (isGold) playGoldSound();
                        flipCard(cards[cardIdx], cardIdx, result);
                    }, delay);
                })(i, i);
            }
        }
    }

    // 关闭结果展示
    function closeResults() {
        resultOverlay.classList.remove('active');
        resultHint.style.display = 'none';
        resultGrid.innerHTML = '';
    }

    // 点击 overlay 关闭
    resultOverlay.addEventListener('click', function () {
        if (animating) return; // 翻转中不可关闭
        closeResults();
    });

    // 单抽
    function doSingle() {
        if (animating) return;
        // 检查抽卡券
        if (getTickets() <= 0) {
            alertNoTickets();
            return;
        }
        consumeTicket();
        var result = drawOnce();
        updateStats();
        updateInventory();
        history.unshift(result);
        renderHistory();
        saveState();
        // 主卡片显示结果
        updateMainCard(result);
        // 弹出全屏展示
        showResults([result]);
    }

    // 十连抽
    function doTen() {
        if (animating) return;
        // 检查抽卡券
        if (getTickets() <= 0) {
            alertNoTickets();
            return;
        }
        consumeTicket();
        var batch = [];
        for (var i = 0; i < 10; i++) {
            batch.push(drawOnce());
        }
        updateStats();
        updateInventory();
        for (var j = batch.length - 1; j >= 0; j--) {
            history.unshift(batch[j]);
        }
        renderHistory();
        saveState();
        // 主卡片显示最佳结果
        updateMainCard(pickBest(batch));
        // 弹出全屏展示全部 10 张
        showResults(batch);
    }

    btnSingle.addEventListener('click', doSingle);
    btnTen.addEventListener('click', doTen);
});
