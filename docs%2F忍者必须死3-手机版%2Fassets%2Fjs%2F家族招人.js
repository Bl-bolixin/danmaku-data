/*
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2026-08-01 21:31:34
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2026-08-01 22:55:40
 * @FilePath: \yy\忍者必须死3\assets\js\家族招人.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
/*
 * 快乐是种天赋 - 家族招人页面交互脚本
 * 忍者必须死3 玩家自制页面
 */

window.addEventListener('DOMContentLoaded', function () {

    /* ===== 0. 汉堡菜单切换 ===== */
    var navToggle = document.getElementById('navToggle');
    var navLinks = document.getElementById('navLinks');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function () {
            navToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        // 点击菜单项后自动收起
        navLinks.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                navToggle.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }

    /* ===== 1. 滚动滑入动画 ===== */
    var animateItems = document.querySelectorAll('.animate-box');

    function checkScroll() {
        var triggerPoint = window.innerHeight * 0.85;
        animateItems.forEach(function (item) {
            var itemTop = item.getBoundingClientRect().top;
            if (itemTop < triggerPoint) {
                item.classList.add('show');
            }
        });
    }

    window.addEventListener('scroll', checkScroll);
    window.addEventListener('load', checkScroll);
    // 初始触发一次
    checkScroll();

    /* ===== 2. 导航栏滚动效果 ===== */
    var nav = document.querySelector('.nav');
    window.addEventListener('scroll', function () {
        if (window.scrollY > 50) {
            nav.style.background = 'rgba(10, 10, 15, 0.95)';
            nav.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.5)';
        } else {
            nav.style.background = 'rgba(10, 10, 15, 0.85)';
            nav.style.boxShadow = 'none';
        }
    });

    /* ===== 3. 平滑滚动到锚点 ===== */
    var navLinks = document.querySelectorAll('.nav-links a, .banner-btn');
    navLinks.forEach(function (link) {
        link.addEventListener('click', function (e) {
            var href = this.getAttribute('href');
            if (href && href.charAt(0) === '#') {
                e.preventDefault();
                var target = document.querySelector(href);
                if (target) {
                    var offsetTop = target.offsetTop - 60;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    /* ===== 3.5 种棉花小游戏 ===== */
    var COLUMNS = 4;   // 列数
    var ROWS = 3;      // 行数
    var GROW_TIME = 3000;  // 种子生长时间（毫秒）

    var cottonField = document.getElementById('cottonField');
    var cottonNum = document.getElementById('cottonNum');
    var cottonTotal = document.getElementById('cottonTotal');

    // 状态：仓库内棉花数 + 累计收获
    var storage = 0;
    var totalHarvest = 0;

    // 每个格子的状态：empty / seed / ripe
    var cells = [];

    // 初始化棉花田
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
                cells.push({
                    el: cell,
                    state: 'empty',
                    timer: null
                });
            })(i);
        }
    }

    // 点击格子
    function onCellClick(idx) {
        var cell = cells[idx];
        if (cell.state === 'empty') {
            plantSeed(idx);
        } else if (cell.state === 'ripe') {
            harvest(idx);
        }
        // seed 状态点击无效果
    }

    // 种下种子
    function plantSeed(idx) {
        var cell = cells[idx];
        cell.state = 'seed';
        cell.el.className = 'cotton-cell seed';
        cell.el.textContent = '🌱';
        // 设定生长定时器
        cell.timer = setTimeout(function () {
            growUp(idx);
        }, GROW_TIME);
    }

    // 种子长成棉花
    function growUp(idx) {
        var cell = cells[idx];
        cell.state = 'ripe';
        cell.el.className = 'cotton-cell ripe';
        cell.el.textContent = '☁';
        cell.timer = null;
    }

    // 收获棉花
    function harvest(idx) {
        var cell = cells[idx];
        cell.state = 'empty';
        cell.el.className = 'cotton-cell harvesting';

        // +1 浮动文字
        var plus = document.createElement('div');
        plus.className = 'cotton-plus';
        plus.textContent = '+1';
        cell.el.appendChild(plus);

        // 数据更新
        storage += 1;
        totalHarvest += 1;
        cottonNum.textContent = storage;
        cottonTotal.textContent = totalHarvest;

        // 动画结束后重置格子
        setTimeout(function () {
            cell.el.className = 'cotton-cell empty';
            cell.el.textContent = '';
        }, 400);

        // 清理 +1 浮动元素
        setTimeout(function () {
            if (plus.parentNode) {
                plus.parentNode.removeChild(plus);
            }
        }, 800);
    }

    initField();

    /* ===== 3.6 族长互动 ===== */
    var zuzhang = document.getElementById('zuzhang');
    var zuzhangTalk = document.getElementById('zuzhangTalk');
    var gachaStack = document.getElementById('gachaStack');
    var whipEffect = document.getElementById('whipEffect');

    var zuzhangClickCount = 0;
    var gachaIndex = 0;

    // 对话内容
    var talk1 = '孩子们，种棉花这个福利怎么样';
    var talk2 = '孩子，别肘我了';
    var talk3 = '再肘我，送一百抽';

    // 点击族长
    zuzhang.addEventListener('click', function () {
        zuzhangClickCount++;
        // 抖动反馈
        zuzhang.classList.remove('shake');
        void zuzhang.offsetWidth;  // 触发重绘
        zuzhang.classList.add('shake');
        zuzhangTalk.classList.add('active');

        if (zuzhangClickCount === 1) {
            zuzhangTalk.textContent = talk1;
        } else if (zuzhangClickCount === 2) {
            zuzhangTalk.textContent = talk2;
        } else {
            // 第3次及之后：显示"再肘我，送一百抽" + 右侧弹出一个"一百抽"按钮
            zuzhangTalk.textContent = talk3;
            createGachaButton();
        }
    });

    // 创建"一百抽"按钮（屏幕右侧堆叠）
    function createGachaButton() {
        gachaIndex++;
        var btn = document.createElement('div');
        btn.className = 'gacha-btn';
        btn.textContent = '一百抽 #' + gachaIndex;
        btn.addEventListener('click', function () {
            // 触发鞭子动画
            whipEffect.classList.remove('show');
            void whipEffect.offsetWidth;
            whipEffect.classList.add('show');

            // 触发屏幕震动
            document.body.classList.remove('shake-screen');
            void document.body.offsetWidth;
            document.body.classList.add('shake-screen');

            // 按钮使用后淡出移除
            btn.classList.add('used');
            setTimeout(function () {
                if (btn.parentNode) {
                    btn.parentNode.removeChild(btn);
                }
            }, 400);
        });
        gachaStack.appendChild(btn);
    }

    // 动画结束后清理 class
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

/* ===== 4. 表单提交验证 ===== */
// ★ 在这里填你创建好的腾讯问卷链接（拿到后把下面这行的 # 换成你的问卷URL）
var QUESTIONNAIRE_URL = '#';

function submitForm() {
    var nick = document.getElementById('nick').value.trim();
    var ninja = document.getElementById('ninja').value;
    var contact = document.getElementById('contact').value.trim();

    if (nick === '') {
        alert('请输入游戏昵称');
        return false;
    }
    if (ninja === '') {
        alert('请选择主玩忍者');
        return false;
    }
    if (contact === '') {
        alert('请留下联系方式');
        return false;
    }

    // 如果还没配置问卷链接，提示族长去配置
    if (QUESTIONNAIRE_URL === '#') {
        alert('申请信息已记录！\n\n昵称：' + nick +
              '\n主玩忍者：' + ninja +
              '\nQQ：' + contact +
              '\n\n（族长尚未配置问卷链接，请直接加族长QQ沟通）');
        return false;
    }

    // 跳转到腾讯问卷
    alert('信息确认无误，点击确定前往正式报名问卷~');
    window.location.href = QUESTIONNAIRE_URL;
    return false;
}
