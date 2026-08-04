/*
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2026-08-02 14:41:16
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2026-08-02 15:18:45
 * @FilePath: \yy\忍者必须死3\assets\js\common.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
/*
 * 快乐是种天赋 - 公共脚本
 * 忍者必须死3 玩家自制页面
 */

window.addEventListener('DOMContentLoaded', function () {

    /* ===== 滚动滑入动画 ===== */
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
    checkScroll();

    /* ===== 导航栏滚动渐变 ===== */
    var nav = document.querySelector('.nav');
    window.addEventListener('scroll', function () {
        if (window.scrollY > 50) {
            nav.style.background = 'rgba(10, 10, 15, 0.95)';
            nav.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.5)';
        } else {
            nav.style.background = 'rgba(10, 10, 15, 0.85)';
            nav.style.boxShadow = 'none';
        }
    });

    /* ===== 平滑滚动（锚点） ===== */
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            var target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    /* ===== 3A通用：页面加载动画（仅首页显示，其他页面跳过） ===== */
    var loader = document.getElementById('loader');
    if (loader) {
        var isHome = window.location.pathname.indexOf('首页') > -1 ||
                     document.title.indexOf('首页') > -1;
        if (isHome) {
            function hideLoader() { loader.classList.add('hidden'); }
            window.addEventListener('load', function () { setTimeout(hideLoader, 800); });
            setTimeout(hideLoader, 3000);
        } else {
            loader.classList.add('hidden');
        }
    }

    /* ===== 3A通用：顶部滚动进度条 ===== */
    var scrollProgress = document.getElementById('scrollProgress');
    if (scrollProgress) {
        function updateProgress() {
            var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
            var scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            var percent = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
            scrollProgress.style.width = percent + '%';
        }
        window.addEventListener('scroll', updateProgress);
        updateProgress();
    }

    /* ===== 3A通用：自定义光标 ===== */
    var cursorDot = document.getElementById('cursorDot');
    var cursorRing = document.getElementById('cursorRing');
    if (cursorDot && cursorRing) {
        var mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

        document.addEventListener('mousemove', function (e) {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursorDot.style.left = mouseX + 'px';
            cursorDot.style.top = mouseY + 'px';
        });

        function followCursor() {
            ringX += (mouseX - ringX) * 0.15;
            ringY += (mouseY - ringY) * 0.15;
            cursorRing.style.left = ringX + 'px';
            cursorRing.style.top = ringY + 'px';
            requestAnimationFrame(followCursor);
        }
        followCursor();

        document.querySelectorAll('a, button, .chapter-dot, [data-tilt], .feature-card-v2, .feature-card, .member-card, .gacha-btn, .cotton-cell').forEach(function (el) {
            el.addEventListener('mouseenter', function () { cursorRing.classList.add('hover'); });
            el.addEventListener('mouseleave', function () { cursorRing.classList.remove('hover'); });
        });
    }

    /* ===== 3A通用：粒子背景 ===== */
    var canvas = document.getElementById('particles');
    if (canvas) {
        var ctx = canvas.getContext('2d');
        var particles = [];
        var PARTICLE_COUNT = 40;

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        for (var i = 0; i < PARTICLE_COUNT; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                r: Math.random() * 2 + 0.3,
                vx: (Math.random() - 0.5) * 0.2,
                vy: (Math.random() - 0.5) * 0.2,
                alpha: Math.random() * 0.4 + 0.1,
                pulse: Math.random() * Math.PI * 2
            });
        }

        function drawParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(function (p) {
                p.x += p.vx;
                p.y += p.vy;
                p.pulse += 0.02;
                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

                var pulseAlpha = p.alpha * (0.6 + Math.sin(p.pulse) * 0.4);

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(240, 199, 94, ' + pulseAlpha + ')';
                ctx.fill();

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(240, 199, 94, ' + (pulseAlpha * 0.08) + ')';
                ctx.fill();
            });
            requestAnimationFrame(drawParticles);
        }
        drawParticles();
    }

    /* ===== 3A通用：IntersectionObserver 章节标题动画 ===== */
    var chapterHeads = document.querySelectorAll('.chapter-head-v2');
    if (chapterHeads.length > 0) {
        var headObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) entry.target.classList.add('show');
            });
        }, { threshold: 0.2 });
        chapterHeads.forEach(function (el) { headObserver.observe(el); });
    }

    /* ===== 3A通用：特色卡片3D倾斜 ===== */
    var tiltCards = document.querySelectorAll('[data-tilt]');
    tiltCards.forEach(function (card) {
        card.addEventListener('mousemove', function (e) {
            var rect = card.getBoundingClientRect();
            var x = e.clientX - rect.left;
            var y = e.clientY - rect.top;
            var centerX = rect.width / 2;
            var centerY = rect.height / 2;
            var rotateX = (y - centerY) / centerY * -8;
            var rotateY = (x - centerX) / centerX * 8;
            card.style.transform = 'perspective(800px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateY(-8px)';
        });
        card.addEventListener('mouseleave', function () {
            card.style.transform = '';
        });
    });
});
