/*
 * 快乐是种天赋 - 弹幕墙脚本（手机版）
 * 全屏滚动彩色弹幕 + 角色头像 + 自身标识
 */

window.addEventListener('DOMContentLoaded', function () {

    // ===== 调试开关 =====
    var DEBUG = true;
    function log(tag, msg, data) {
        if (!DEBUG) return;
        var t = new Date().toLocaleTimeString('zh-CN', { hour12: false }) + '.' +
                String(new Date().getMilliseconds()).padStart(3, '0');
        if (data !== undefined) {
            console.log('[' + t + '] [' + tag + '] ' + msg, data);
        } else {
            console.log('[' + t + '] [' + tag + '] ' + msg);
        }
    }

    // ===== 提示 Toast =====
    var toastEl = null;
    function showToast(msg, duration) {
        duration = duration || 2500;
        if (!toastEl) {
            toastEl = document.createElement('div');
            toastEl.className = 'danmaku-toast';
            document.body.appendChild(toastEl);
        }
        toastEl.innerHTML = '<span class="toast-icon">💬</span>' + msg;
        toastEl.classList.add('show');
        clearTimeout(toastEl._timer);
        toastEl._timer = setTimeout(function () {
            toastEl.classList.remove('show');
        }, duration);
    }

    var stage = document.getElementById('danmakuStage');
    var input = document.getElementById('danmakuInput');
    var btnSend = document.getElementById('btnSend');
    var speedSelect = document.getElementById('speedSelect');
    var toggleBtn = document.getElementById('toggleDanmaku');
    var screenCountEl = document.getElementById('screenCount');
    var presetBtns = document.querySelectorAll('.preset-btn');
    var colorDots = document.querySelectorAll('.color-dot');

    // 角色选择器元素
    var avatarTabs = document.querySelectorAll('.avatar-tab');
    var avatarGrid = document.getElementById('avatarGrid');
    var selectedAvatar = document.getElementById('selectedAvatar');

    var MAX_ON_SCREEN = 25;
    var isOn = true;
    var currentColor = 'gold';
    var currentSpeed = 'normal';
    var activeDanmakus = [];
    var fireSeq = 0;

    // 当前选中的角色
    var currentAvatar = null;

    // ===== GitHub API 配置 =====
    var GITHUB_CONFIG = {
        username: 'Bl-bolixin',
        repo: 'danmaku-data',
        file: 'danmaku.json',
        token: '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'
    };
    var githubFileSha = null;
    var lastPollTime = 0;
    var seenMsgIds = {};

    // 速度映射（秒）
    var SPEED_MAP = { slow: 18, normal: 12, fast: 7 };

    // SSR角色列表
    var SSR_CHARACTERS = [
        { name: '小黑', img: '小黑.WEBP' },
        { name: '阿力', img: '阿力.WEBP' },
        { name: '小椒', img: '小椒.WEBP' },
        { name: '老板娘', img: '老板娘.WEBP' },
        { name: '苍牙', img: '苍牙.WEBP' },
        { name: '伊鹤', img: '伊鹤.WEBP' },
        { name: '洛青', img: '洛青.WEBP' },
        { name: '银枭', img: '银枭.WEBP' },
        { name: '卫鲤', img: '卫鲤.WEBP' },
        { name: '兮兰', img: '兮兰.WEBP' },
        { name: '紫原', img: '紫原.WEBP' },
        { name: '隼白', img: '隼白.WEBP' },
        { name: '血影', img: '血影.WEBP' },
        { name: '荧', img: '荧.WEBP' },
        { name: '小夜', img: '小夜.WEBP' },
        { name: '戌时', img: '戌时.WEBP' },
        { name: '琳', img: '琳WEBP.WEBP' }
    ];

    // UR（牢）角色列表
    var UR_CHARACTERS = [
        { name: '牢黑', img: '牢黑.jpg' },
        { name: '牢青', img: '牢青.png' },
        { name: '牢椒', img: '牢椒.png' },
        { name: '牢板娘', img: '牢板娘.jpg' },
        { name: '牢枭', img: '牢枭.jpg' },
        { name: '牢琳', img: '牢琳.png' },
        { name: '牢力', img: '牢力.png' },
        { name: '牢牙', img: '牢牙.png' },
        { name: '牢原', img: '牢原.jpg' },
        { name: '不知牢舞', img: '不知牢舞.png' }
    ];

    // 所有角色池合并
    var ALL_CHARACTERS = SSR_CHARACTERS.concat(UR_CHARACTERS);

    // 随机取一个角色模拟真人发送
    function randomAvatar() {
        var char = ALL_CHARACTERS[Math.floor(Math.random() * ALL_CHARACTERS.length)];
        var pool = SSR_CHARACTERS.indexOf(char) >= 0 ? 'SSR' : 'UR';
        return { name: char.name, img: char.img, pool: pool };
    }

    var BASE_IMG_PATH = '../assets/images/';

    /* ===== GitHub API 读写 ===== */
    var GITHUB_API = 'https://api.github.com/repos/' + GITHUB_CONFIG.username + '/' + GITHUB_CONFIG.repo + '/contents/' + GITHUB_CONFIG.file;

    function githubRead() {
        return fetch(GITHUB_API, {
            headers: {
                'Authorization': 'token ' + GITHUB_CONFIG.token,
                'Accept': 'application/vnd.github+json'
            }
        }).then(function (res) {
            if (!res.ok) throw new Error('GitHub API error: ' + res.status + ' ' + res.statusText);
            return res.json();
        }).then(function (data) {
            githubFileSha = data.sha;
            // GitHub API 返回的 Base64 内容可能包含换行符，需要先清除
            var cleanContent = data.content.replace(/\s/g, '');
            var decoded = decodeURIComponent(escape(atob(cleanContent)));
            var parsed = JSON.parse(decoded);
            // 确保返回的是数组
            if (!Array.isArray(parsed)) {
                return [];
            }
            return parsed;
        }).catch(function (err) {
            console.error('GitHub读取失败:', err);
            throw err;
        });
    }

    function githubWrite(messages) {
        var content = btoa(unescape(encodeURIComponent(JSON.stringify(messages))));
        return fetch(GITHUB_API, {
            method: 'PUT',
            headers: {
                'Authorization': 'token ' + GITHUB_CONFIG.token,
                'Accept': 'application/vnd.github+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'update danmaku',
                content: content,
                sha: githubFileSha,
                branch: 'main'
            })
        }).then(function (res) {
            if (!res.ok) throw new Error('GitHub write error: ' + res.status);
            return res.json();
        }).then(function (data) {
            if (data.content) githubFileSha = data.content.sha;
            return data;
        });
    }

    function githubPoll() {
        githubRead().then(function (messages) {
            var newCount = 0;
            messages.forEach(function (msg) {
                if (!seenMsgIds[msg.id]) {
                    seenMsgIds[msg.id] = true;
                    fireDanmaku(msg.text, msg.color, true, msg.avatar, false);
                    newCount++;
                }
            });
        }).catch(function () {});
    }

    function githubSend(text, color, avatar) {
        return githubRead().then(function (messages) {
            // 检查重复弹幕
            var duplicateCount = 0;
            var recentMessages = messages.slice(-RECENT_CHECK_COUNT);
            for (var i = 0; i < recentMessages.length; i++) {
                if (recentMessages[i].text === text) {
                    duplicateCount++;
                }
            }
            if (duplicateCount >= MAX_DUPLICATE) {
                throw new Error('这句话已经出现太多次了，换一句吧');
            }

            var newMsg = {
                id: 'msg_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
                text: text,
                color: color,
                avatar: avatar,
                time: Date.now()
            };
            messages.push(newMsg);
            // 保留最近500条
            if (messages.length > 500) {
                messages = messages.slice(-500);
            }
            return githubWrite(messages);
        });
    }

    // 预置弹幕
    var PRESET_MESSAGES = [
        '种棉花真快乐', '牢黑出没注意', '忍3第一家族',
        '来家族免费种棉花', '快乐是种天赋', '族长最帅',
        '忍界第一！', '家族yyds', '棉花丰收节',
        '抽卡出UR', '快乐游戏每一天', '忍3永不散场',
        '100连保底', '棉花糖真好吃', '家族温暖如家',
        '有人打BOSS吗', '来组队', '求带飞',
        '今日运气爆棚', '又出金了', '谁有多余的材料',
        '收棉花啦', '家族日常', '大佬带带我',
        '萌新报到', '老玩家回归', '求个好友位',
        '这个皮肤好看', '手感不错', '又变强了',
        '每日打卡', '签到成功', '领福利啦',
        '家族收人', '欢迎新人', '一起变强'
    ];

    // 颜色池
    var COLOR_POOL = ['gold', 'red', 'blue', 'green', 'pink', 'white'];

    // ===== 违禁词列表 =====
    var BANNED_WORDS = [
        '傻逼', '操你', '滚', '废物', '垃圾', '去死', '杀人',
        'fuck', 'shit', 'sex', '色情', '赌博', '毒品',
        '反动', '政府', '习近平', '毛泽东'
    ];

    // 检查是否包含违禁词
    function containsBannedWord(text) {
        var lower = text.toLowerCase();
        for (var i = 0; i < BANNED_WORDS.length; i++) {
            if (lower.indexOf(BANNED_WORDS[i].toLowerCase()) >= 0) {
                return BANNED_WORDS[i];
            }
        }
        return null;
    }

    // ===== 防刷屏机制 =====
    var SEND_COOLDOWN = 5000;
    var lastSendTime = 0;
    var MAX_DUPLICATE = 3;
    var RECENT_CHECK_COUNT = 50;

    /* ===== 渲染角色网格 ===== */
    function renderAvatarGrid(pool) {
        var chars = pool === 'UR' ? UR_CHARACTERS : SSR_CHARACTERS;
        avatarGrid.innerHTML = '';
        chars.forEach(function (char) {
            var item = document.createElement('div');
            item.className = 'avatar-item';
            item.innerHTML =
                '<img src="' + BASE_IMG_PATH + char.img + '" alt="' + char.name + '" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">' +
                '<span class="avatar-name">' + char.name + '</span>';
            item.addEventListener('click', function () {
                selectAvatar(char, pool);
            });
            avatarGrid.appendChild(item);
        });
    }

    /* ===== 选择角色 ===== */
    function selectAvatar(char, pool) {
        currentAvatar = { name: char.name, img: char.img, pool: pool };

        avatarGrid.querySelectorAll('.avatar-item').forEach(function (el) {
            el.classList.remove('selected');
        });
        avatarGrid.querySelectorAll('.avatar-item').forEach(function (el) {
            if (el.querySelector('.avatar-name').textContent === char.name) {
                el.classList.add('selected');
            }
        });

        selectedAvatar.classList.add('has-avatar');
        selectedAvatar.innerHTML = '<img src="' + BASE_IMG_PATH + char.img + '" alt="' + char.name + '" onerror="this.style.display=\'none\'">';

        log('AVATAR', '选择角色: ' + char.name + ' (' + pool + ')');
    }

    /* ===== 切换角色池标签 ===== */
    avatarTabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
            avatarTabs.forEach(function (t) { t.classList.remove('active'); });
            tab.classList.add('active');
            var pool = tab.getAttribute('data-pool');
            renderAvatarGrid(pool);
            avatarGrid.classList.add('show');
            log('AVATAR', '切换角色池: ' + pool);
        });
    });

    /* ===== 点击已选择头像打开角色选择 ===== */
    selectedAvatar.addEventListener('click', function () {
        avatarGrid.classList.toggle('show');
    });

    /* ===== 点击外部关闭角色选择 ===== */
    document.addEventListener('click', function (e) {
        if (!avatarGrid.contains(e.target) && !e.target.classList.contains('avatar-tab') && !e.target.classList.contains('selected-avatar')) {
            avatarGrid.classList.remove('show');
        }
    });

    // 初始渲染SSR角色
    renderAvatarGrid('SSR');

    // ===== 行管理系统（多弹幕追踪法） =====
    var SAFE_GAP = 60;
    var rowActiveDanmakus = [];
    var fireQueue = [];

    function ensureRowState(rowCount) {
        while (rowActiveDanmakus.length < rowCount) {
            rowActiveDanmakus.push([]);
        }
    }

    function cleanupExpiredDanmakus() {
        var now = Date.now();
        var stageWidth = stage.offsetWidth;
        for (var r = 0; r < rowActiveDanmakus.length; r++) {
            var list = rowActiveDanmakus[r];
            var survivors = [];
            for (var i = 0; i < list.length; i++) {
                var d = list[i];
                var elapsed = (now - d.fireTime) / 1000;
                var speed = stageWidth / d.duration;
                var distanceMoved = speed * elapsed;
                if (distanceMoved < d.width + SAFE_GAP) {
                    survivors.push(d);
                }
            }
            rowActiveDanmakus[r] = survivors;
        }
    }

    function getRowFreeTime(row) {
        var list = rowActiveDanmakus[row];
        if (!list || list.length === 0) return 0;

        var now = Date.now();
        var stageWidth = stage.offsetWidth;
        var worstFreeTime = 0;

        for (var i = 0; i < list.length; i++) {
            var d = list[i];
            var elapsed = (now - d.fireTime) / 1000;
            var speed = stageWidth / d.duration;
            var distanceMoved = speed * elapsed;
            var minDistance = d.width + SAFE_GAP;

            if (distanceMoved < minDistance) {
                var remainingDistance = minDistance - distanceMoved;
                var freeTime = now + (remainingDistance / speed) * 1000;
                if (freeTime > worstFreeTime) {
                    worstFreeTime = freeTime;
                }
            }
        }

        return worstFreeTime;
    }

    function findBestRow(rowCount, itemWidth, duration) {
        ensureRowState(rowCount);
        cleanupExpiredDanmakus();

        var now = Date.now();
        var candidates = [];

        for (var r = 0; r < rowCount; r++) {
            var freeTime = getRowFreeTime(r);
            candidates.push({ row: r, freeTime: freeTime });
        }

        candidates.sort(function (a, b) { return a.freeTime - b.freeTime; });

        var available = candidates.filter(function (c) { return c.freeTime <= now; });

        if (available.length > 0) {
            var poolSize = Math.min(3, available.length);
            var chosen = available[Math.floor(Math.random() * poolSize)];
            rowActiveDanmakus[chosen.row].push({
                fireTime: now,
                width: itemWidth,
                duration: duration
            });
            return { row: chosen.row, delay: 0 };
        }

        var best = candidates[0];
        var delayMs = Math.max(0, best.freeTime - now);
        rowActiveDanmakus[best.row].push({
            fireTime: best.freeTime,
            width: itemWidth,
            duration: duration
        });
        return { row: best.row, delay: delayMs };
    }

    /* ===== 发射单条弹幕 ===== */
    function fireDanmaku(text, color, useUserColor, avatar, isSelf) {
        if (!isOn) {
            log('FIRE', '弹幕已关闭，跳过发射: "' + text + '"');
            return;
        }
        if (!text) {
            log('FIRE', '空文本，跳过发射');
            return;
        }
        if (activeDanmakus.length >= MAX_ON_SCREEN && !isSelf) {
            log('FIRE', '同屏已满(' + activeDanmakus.length + '/' + MAX_ON_SCREEN + ')，跳过: "' + text + '"');
            return;
        }

        fireSeq++;
        var item = document.createElement('div');
        var colorClass = useUserColor ? color : COLOR_POOL[Math.floor(Math.random() * COLOR_POOL.length)];

        if (avatar) {
            item.className = 'danmaku-item has-avatar ' + colorClass;
            item.innerHTML =
                '<div class="danmaku-avatar"><img src="' + BASE_IMG_PATH + avatar.img + '" alt="' + avatar.name + '" onerror="this.parentElement.style.display=\'none\'"></div>' +
                '<span class="danmaku-text">' + text + '</span>';
        } else {
            item.className = 'danmaku-item ' + colorClass;
            item.textContent = text;
        }

        if (isSelf) {
            item.classList.add('self');
            var badge = document.createElement('span');
            badge.className = 'danmaku-self-badge';
            badge.textContent = '我';
            item.appendChild(badge);
        }

        // 先追加到舞台（先隐藏，测量后再显示）
        item.style.visibility = 'hidden';
        stage.appendChild(item);
        activeDanmakus.push(item);

        // 测量宽度 + 兜底
        var itemWidth = item.offsetWidth;
        if (!itemWidth || itemWidth < 20) {
            itemWidth = text.length * 20 + (avatar ? 70 : 0);
        }

        var stageWidth = stage.offsetWidth;
        var stageRect = stage.getBoundingClientRect();
        var itemHeight = avatar ? 76 : 66;
        var rowCount = Math.max(1, Math.floor((stageRect.height - 30) / itemHeight));

        if (!stageWidth || stageWidth < 100) {
            stageWidth = 400;
        }

        var duration = SPEED_MAP[currentSpeed];

        // 统一行分配算法
        var row, delay;
        var assign = findBestRow(rowCount, itemWidth, duration);
        row = assign.row;
        var queueDelay = assign.delay;

        if (isSelf) {
            delay = (Math.random() * 0.2) + (queueDelay / 1000);
        } else {
            delay = (Math.random() * 0.4) + (queueDelay / 1000);
        }

        var top = 15 + row * itemHeight;
        item.style.top = top + 'px';
        item.style.left = '100%';
        item.style.animationDuration = duration + 's';
        item.style.animationDelay = delay + 's';

        item.style.visibility = 'visible';

        log('FIRE',
            '#' + fireSeq + (isSelf ? ' [SELF]' : '') + ' 发射: "' + text + '" | 颜色=' + colorClass +
            (avatar ? ' | 头像=' + avatar.name : '') +
            ' | 时长=' + duration + 's | 延迟=' + delay.toFixed(2) + 's' +
            ' | 同屏=' + activeDanmakus.length + '/' + MAX_ON_SCREEN +
            ' | 行=' + row + '/' + rowCount
        );

        updateScreenCount();

        item.addEventListener('animationend', function () {
            var idx = activeDanmakus.indexOf(item);
            if (idx > -1) {
                activeDanmakus.splice(idx, 1);
                log('RECYCLE',
                    '#' + fireSeq + ' 回收: "' + text + '" | 同屏=' + activeDanmakus.length
                );
            }
            if (item.parentNode) {
                item.parentNode.removeChild(item);
            }
            updateScreenCount();
        });
    }

    /* ===== 更新同屏计数 ===== */
    function updateScreenCount() {
        var count = activeDanmakus.length;
        screenCountEl.textContent = count;
    }

    /* ===== 定时自动发射（模拟真人） ===== */
    var autoTimer = null;
    var autoFireCount = 0;
    function startAutoFire() {
        if (autoTimer) return;
        autoTimer = setInterval(function () {
            if (!isOn) return;
            autoFireCount++;
            var msg = PRESET_MESSAGES[Math.floor(Math.random() * PRESET_MESSAGES.length)];
            var avatar = randomAvatar();
            var color = COLOR_POOL[Math.floor(Math.random() * COLOR_POOL.length)];
            fireDanmaku(msg, color, true, avatar, false);
        }, 1800);
    }

    function stopAutoFire() {
        if (autoTimer) {
            clearInterval(autoTimer);
            autoTimer = null;
        }
    }

    /* ===== 初始弹幕 ===== */
    function initialFire() {
        for (var i = 0; i < 8; i++) {
            (function (idx) {
                setTimeout(function () {
                    var msg = PRESET_MESSAGES[Math.floor(Math.random() * PRESET_MESSAGES.length)];
                    var avatar = randomAvatar();
                    var color = COLOR_POOL[Math.floor(Math.random() * COLOR_POOL.length)];
                    fireDanmaku(msg, color, true, avatar, false);
                }, idx * 500);
            })(i);
        }
    }

    /* ===== 发送按钮 ===== */
    btnSend.addEventListener('click', function () {
        var text = input.value.trim();
        if (!text) {
            input.focus();
            input.style.borderColor = '#c8161d';
            setTimeout(function () { input.style.borderColor = ''; }, 300);
            return;
        }
        if (!currentAvatar) {
            showToast('请先选择角色头像再发送');
            return;
        }
        // 检查是否通过服务器访问（file://协议无法访问GitHub API）
        if (location.protocol === 'file:') {
            showToast('请通过 http://localhost:8000 访问页面，不能直接打开文件', 5000);
            return;
        }
        // 违禁词检查
        var bannedWord = containsBannedWord(text);
        if (bannedWord) {
            showToast('弹幕包含违禁词，请修改后再发送', 3500);
            return;
        }
        // 防刷屏冷却检查
        var nowTime = Date.now();
        if (nowTime - lastSendTime < SEND_COOLDOWN) {
            var remaining = Math.ceil((SEND_COOLDOWN - (nowTime - lastSendTime)) / 1000);
            showToast('发送太快了，请等' + remaining + '秒再发', 2500);
            return;
        }
        var color = currentColor;

        // 立即显示弹幕
        fireDanmaku(text, color, true, currentAvatar, true);

        // 保存到 GitHub
        btnSend.disabled = true;
        btnSend.textContent = '发送中...';
        githubSend(text, color, currentAvatar).then(function () {
            lastSendTime = Date.now();
            btnSend.disabled = false;
            btnSend.textContent = '发射';
        }).catch(function (err) {
            var reason = '发送失败: ' + err.message;
            if (err.message.indexOf('Failed to fetch') >= 0 || err.message.indexOf('NetworkError') >= 0) {
                reason = '网络受限(CORS)，请通过 http://localhost:8000 访问';
            } else if (err.message.indexOf('409') >= 0) {
                reason = '弹幕冲突，请重试';
            } else if (err.message.indexOf('401') >= 0 || err.message.indexOf('403') >= 0) {
                reason = '权限不足，请检查Token';
            }
            showToast(reason, 5000);
            btnSend.disabled = false;
            btnSend.textContent = '发射';
        });

        input.value = '';
    });

    input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            btnSend.click();
        }
    });

    /* ===== 颜色选择 ===== */
    colorDots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            colorDots.forEach(function (d) { d.classList.remove('active'); });
            dot.classList.add('active');
            currentColor = dot.getAttribute('data-color');
        });
    });

    /* ===== 速度选择 ===== */
    speedSelect.addEventListener('change', function () {
        currentSpeed = speedSelect.value;
    });

    /* ===== 弹幕开关 ===== */
    toggleBtn.addEventListener('click', function () {
        isOn = !isOn;
        toggleBtn.classList.toggle('active', isOn);
        toggleBtn.textContent = isOn ? '弹幕 开' : '弹幕 关';
        if (!isOn) {
            activeDanmakus.forEach(function (item) {
                if (item.parentNode) item.parentNode.removeChild(item);
            });
            activeDanmakus = [];
            rowActiveDanmakus = [];
            fireQueue = [];
            updateScreenCount();
        }
    });

    /* ===== 预置弹幕按钮 ===== */
    presetBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            var text = btn.getAttribute('data-text');
            var color = COLOR_POOL[Math.floor(Math.random() * COLOR_POOL.length)];
            fireDanmaku(text, color, true, currentAvatar, true);
        });
    });

    /* ===== 测试模式 ===== */
    function testIntensiveFire() {
        var testMsgs = ['忍3最强家族', '种棉花啦', '牢黑出征', '家人们冲', '族长威武',
                        '快乐是种天赋', '忍3永不散场', '棉花糖真好吃', '家族yyds', '100连保底'];

        for (var i = 0; i < 20; i++) {
            (function (idx) {
                setTimeout(function () {
                    var msg = testMsgs[idx % testMsgs.length];
                    var avatar = randomAvatar();
                    var color = COLOR_POOL[Math.floor(Math.random() * COLOR_POOL.length)];
                    fireDanmaku(msg, color, true, avatar, false);
                }, idx * 400);
            })(i);
        }
    }

    window.__danmakuTest = testIntensiveFire;

    /* ===== 启动 ===== */
    // 从 GitHub 加载历史弹幕（不使用AI模拟弹幕，只显示真人弹幕）
    githubRead().then(function (messages) {
        messages.forEach(function (msg) {
            seenMsgIds[msg.id] = true;
            fireDanmaku(msg.text, msg.color, true, msg.avatar, false);
        });
        if (messages.length === 0) {
            showToast('还没有真人弹幕，发送第一条吧！');
        }
    }).catch(function (err) {
        showToast('GitHub加载失败: ' + err.message, 5000);
    });

    setInterval(function () {
        githubPoll();
    }, 3000);
});
