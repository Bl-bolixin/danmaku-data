/*
 * 快乐是种天赋 - 公共脚本（手机版）
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

    /* ===== 汉堡菜单：点击切换 + 选择后自动关闭 ===== */
    var navToggle = document.getElementById('navToggle');
    var navLinks = document.getElementById('navLinks');
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function () {
            navToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
        // 点击导航链接后自动关闭抽屉
        navLinks.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                navToggle.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }

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

    /* ===== 页面加载动画（仅首页显示，其他页面跳过） ===== */
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

    /* ===== 顶部滚动进度条 ===== */
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

    /* ===== 粒子背景（手机端减少数量，提升性能） ===== */
    var canvas = document.getElementById('particles');
    if (canvas) {
        var ctx = canvas.getContext('2d');
        var particles = [];
        var PARTICLE_COUNT = 20;

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

    /* ===== IntersectionObserver 章节标题动画 ===== */
    var chapterHeads = document.querySelectorAll('.chapter-head-v2');
    if (chapterHeads.length > 0) {
        var headObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) entry.target.classList.add('show');
            });
        }, { threshold: 0.2 });
        chapterHeads.forEach(function (el) { headObserver.observe(el); });
    }
});
