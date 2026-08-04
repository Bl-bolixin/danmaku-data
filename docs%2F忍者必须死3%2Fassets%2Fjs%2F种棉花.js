/*
 * 快乐是种天赋 - 种棉花页脚本
 * 忍者必须死3 玩家自制页面
 */

window.addEventListener('DOMContentLoaded', function () {

    /* ===== 种棉花小游戏（升级版：连击+成长阶段） ===== */
    var COLUMNS = 4;
    var ROWS = 3;
    var STAGE_TIME = 800;          // 每个成长阶段间隔
    var STAGES = ['seed', 'sprout', 'bloom', 'ripe']; // 4个阶段
    var STAGE_EMOJI = { seed: '🌱', sprout: '🌿', bloom: '🌸', ripe: '☁' };

    var cottonField = document.getElementById('cottonField');
    var cottonNum = document.getElementById('cottonNum');
    var cottonTotal = document.getElementById('cottonTotal');
    var cottonTicketsNum = document.getElementById('cottonTicketsNum');
    var comboNumEl = document.getElementById('comboNum');
    var comboMultiEl = document.getElementById('comboMulti');
    var comboDisplay = document.getElementById('comboDisplay');

    // 初始化抽卡券显示
    function updateCottonTickets() {
        var t = parseInt(localStorage.getItem('gachaTickets') || '0', 10);
        if (cottonTicketsNum) cottonTicketsNum.textContent = t;
    }
    updateCottonTickets();

    var storage = 0;
    var totalHarvest = 0;
    var cells = [];
    var combo = 0;           // 当前连击数
    var comboTimer = null;   // 连击重置计时器

    // 从 localStorage 恢复棉花数据
    storage = parseInt(localStorage.getItem('cottonStorage') || '0', 10);
    totalHarvest = parseInt(localStorage.getItem('cottonTotal') || '0', 10);
    cottonNum.textContent = storage;
    cottonTotal.textContent = totalHarvest;

    // 获取连击倍数
    function getComboMulti() {
        if (combo >= 11) return 3;
        if (combo >= 6) return 2;
        return 1;
    }

    // 更新连击显示
    function updateComboDisplay() {
        comboNumEl.textContent = combo;
        var multi = getComboMulti();
        comboMultiEl.textContent = '×' + multi;
        comboMultiEl.className = 'combo-multi' + (multi > 1 ? ' active' : '');

        // 连击浮动文字
        if (combo >= 2) {
            comboDisplay.textContent = combo + ' 连击！';
            comboDisplay.className = 'combo-display show';
            comboDisplay.classList.remove('bounce');
            void comboDisplay.offsetWidth;
            comboDisplay.classList.add('bounce');
        }
    }

    // 连击重置（2秒无收获则清零）
    function resetComboTimer() {
        if (comboTimer) clearTimeout(comboTimer);
        comboTimer = setTimeout(function () {
            combo = 0;
            updateComboDisplay();
            comboDisplay.className = 'combo-display';
        }, 2000);
    }

    function initField() {
        cottonField.innerHTML = '';
        cells = [];
        for (var i = 0; i < COLUMNS * ROWS; i++) {
            (function (idx) {
                var cell = document.createElement('div');
                cell.className = 'cotton-cell empty';
                cell.textContent = '';
                cell.addEventListener('click', function () {
                    onCellClick(idx);
                });
                cottonField.appendChild(cell);
                cells.push({ el: cell, state: 'empty', stage: -1, timer: null });
            })(i);
        }
    }

    function onCellClick(idx) {
        var cell = cells[idx];
        if (cell.state === 'empty') {
            plantSeed(idx);
        } else if (cell.state === 'ripe') {
            harvest(idx);
        } else if (cell.stage >= 0 && cell.stage < STAGES.length - 1) {
            // 点击未成熟的棉花：催熟一个阶段
            growNext(idx);
        }
    }

    function plantSeed(idx) {
        var cell = cells[idx];
        cell.state = 'growing';
        cell.stage = 0;
        cell.el.className = 'cotton-cell ' + STAGES[0];
        cell.el.textContent = STAGE_EMOJI[STAGES[0]];
        cell.timer = setTimeout(function () {
            growNext(idx);
        }, STAGE_TIME);
    }

    function growNext(idx) {
        var cell = cells[idx];
        if (cell.timer) {
            clearTimeout(cell.timer);
            cell.timer = null;
        }
        cell.stage++;
        if (cell.stage >= STAGES.length - 1) {
            // 成熟
            cell.state = 'ripe';
            cell.stage = STAGES.length - 1;
            cell.el.className = 'cotton-cell ' + STAGES[cell.stage] + ' ripe';
            cell.el.textContent = STAGE_EMOJI[STAGES[cell.stage]];
        } else {
            cell.state = 'growing';
            cell.el.className = 'cotton-cell ' + STAGES[cell.stage];
            cell.el.textContent = STAGE_EMOJI[STAGES[cell.stage]];
            cell.timer = setTimeout(function () {
                growNext(idx);
            }, STAGE_TIME);
        }
    }

    function harvest(idx) {
        var cell = cells[idx];
        cell.state = 'empty';
        cell.stage = -1;
        cell.el.className = 'cotton-cell harvesting';

        // 连击+1
        combo++;
        var multi = getComboMulti();
        var ticketsGained = multi;

        var plus = document.createElement('div');
        plus.className = 'cotton-plus' + (multi > 1 ? ' combo' : '');
        plus.textContent = '+' + ticketsGained + (multi > 1 ? ' (×' + multi + ')' : '');
        cell.el.appendChild(plus);

        storage += 1;
        totalHarvest += 1;
        cottonNum.textContent = storage;
        cottonTotal.textContent = totalHarvest;

        // 保存棉花数据
        localStorage.setItem('cottonStorage', storage);
        localStorage.setItem('cottonTotal', totalHarvest);

        // 收获棉花获得抽卡券（连击倍数）
        var tickets = parseInt(localStorage.getItem('gachaTickets') || '0', 10) + ticketsGained;
        localStorage.setItem('gachaTickets', tickets);
        updateCottonTickets();

        // 更新连击显示
        updateComboDisplay();
        resetComboTimer();

        setTimeout(function () {
            cell.el.className = 'cotton-cell empty';
            cell.el.textContent = '';
        }, 400);

        setTimeout(function () {
            if (plus.parentNode) {
                plus.parentNode.removeChild(plus);
            }
        }, 800);
    }

    initField();

    /* ===== 族长互动 ===== */
    var zuzhang = document.getElementById('zuzhang');
    var zuzhangTalk = document.getElementById('zuzhangTalk');
    var gachaStack = document.getElementById('gachaStack');
    var whipEffect = document.getElementById('whipEffect');
    var audioMan = document.getElementById('audioMan');

    var zuzhangClickCount = 0;
    var gachaIndex = 0;

    var talk1 = '孩子们，种棉花这个福利怎么样';
    var talk2 = '孩子，别肘我了';
    var talk3 = '再肘我，送一百抽';

    zuzhang.addEventListener('click', function () {
        // 立即播放 man 音效（点击一次重复一次，速度与点击保持一致）
        if (audioMan) {
            audioMan.currentTime = 0;
            audioMan.play();
        }

        zuzhangClickCount++;
        zuzhang.classList.remove('shake');
        void zuzhang.offsetWidth;
        zuzhang.classList.add('shake');
        zuzhangTalk.classList.add('active');

        if (zuzhangClickCount === 1) {
            zuzhangTalk.textContent = talk1;
        } else if (zuzhangClickCount === 2) {
            zuzhangTalk.textContent = talk2;
        } else {
            zuzhangTalk.textContent = talk3;
            createGachaButton();
        }
    });

    function createGachaButton() {
        gachaIndex++;
        var btn = document.createElement('div');
        btn.className = 'gacha-btn';
        btn.textContent = '一百抽 #' + gachaIndex;
        btn.addEventListener('click', function () {
            whipEffect.classList.remove('show');
            void whipEffect.offsetWidth;
            whipEffect.classList.add('show');

            document.body.classList.remove('shake-screen');
            void document.body.offsetWidth;
            document.body.classList.add('shake-screen');

            btn.classList.add('used');
            setTimeout(function () {
                if (btn.parentNode) {
                    btn.parentNode.removeChild(btn);
                }
            }, 400);
        });
        gachaStack.appendChild(btn);
    }

    zuzhang.addEventListener('animationend', function () {
        zuzhang.classList.remove('shake');
    });
    whipEffect.addEventListener('animationend', function () {
        whipEffect.classList.remove('show');
    });
    document.body.addEventListener('animationend', function () {
        document.body.classList.remove('shake-screen');
    });
});
