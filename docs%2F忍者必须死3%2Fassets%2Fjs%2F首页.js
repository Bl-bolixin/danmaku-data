/*
 * 快乐是种天赋 - 首页脚本
 * 忍者必须死3 玩家自制页面
 * 3A官网级交互效果
 */

window.addEventListener('DOMContentLoaded', function () {

    /* ===== 1. 页面加载动画 ===== */
    var loader = document.getElementById('loader');
    function hideLoader() {
        if (loader) loader.classList.add('hidden');
    }
    window.addEventListener('load', function () {
        setTimeout(hideLoader, 1000);
    });
    setTimeout(hideLoader, 3500); // 超时保底

    /* ===== 2. 顶部滚动进度条 ===== */
    var scrollProgress = document.getElementById('scrollProgress');
    function updateProgress() {
        var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        var scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        var percent = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
        scrollProgress.style.width = percent + '%';
    }
    window.addEventListener('scroll', updateProgress);
    updateProgress();

    /* ===== 3. 自定义光标 ===== */
    var cursorDot = document.getElementById('cursorDot');
    var cursorRing = document.getElementById('cursorRing');
    var mouseX = 0, mouseY = 0;
    var ringX = 0, ringY = 0;

    document.addEventListener('mousemove', function (e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursorDot.style.left = mouseX + 'px';
        cursorDot.style.top = mouseY + 'px';
    });

    // 光环平滑跟随
    function followCursor() {
        ringX += (mouseX - ringX) * 0.15;
        ringY += (mouseY - ringY) * 0.15;
        cursorRing.style.left = ringX + 'px';
        cursorRing.style.top = ringY + 'px';
        requestAnimationFrame(followCursor);
    }
    followCursor();

    // 悬停可交互元素时光环放大
    document.querySelectorAll('a, button, .chapter-dot, [data-tilt]').forEach(function (el) {
        el.addEventListener('mouseenter', function () {
            cursorRing.classList.add('hover');
        });
        el.addEventListener('mouseleave', function () {
            cursorRing.classList.remove('hover');
        });
    });

    /* ===== 4. Banner 打字机效果 ===== */
    var typedText = document.getElementById('typedText');
    var slogan = '来家族免费种棉花';
    var typeIndex = 0;
    var typing = true;

    function typeWriter() {
        if (typing) {
            if (typeIndex < slogan.length) {
                typedText.textContent = slogan.substring(0, typeIndex + 1);
                typeIndex++;
                setTimeout(typeWriter, 150);
            } else {
                typing = false;
                setTimeout(typeWriter, 2500);
            }
        } else {
            if (typeIndex > 0) {
                typedText.textContent = slogan.substring(0, typeIndex - 1);
                typeIndex--;
                setTimeout(typeWriter, 80);
            } else {
                typing = true;
                setTimeout(typeWriter, 500);
            }
        }
    }
    setTimeout(typeWriter, 2200);

    /* ===== 5. 滚动驱动：元素进入可视区时添加 .show ===== */
    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
            }
        });
    }, { threshold: 0.15 });

    // 观察所有需要动画的元素
    document.querySelectorAll(
        '.chapter-head, .data-item, .data-desc, ' +
        '.manifesto-line, .feature-card-v2, ' +
        '.cta-tag, .cta-title, .cta-desc, .btn-cta'
    ).forEach(function (el) {
        observer.observe(el);
    });

    /* ===== 6. 数字滚动动画 ===== */
    var numItems = document.querySelectorAll('.data-item');
    var numAnimated = {};

    numItems.forEach(function (item, idx) {
        var numEl = item.querySelector('.num-count');
        var target = parseInt(item.getAttribute('data-target'));
        var suffix = item.getAttribute('data-suffix') || '';
        var animated = false;

        var numObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting && !animated) {
                    animated = true;
                    var current = 0;
                    var step = target / 60;
                    var timer = setInterval(function () {
                        current += step;
                        if (current >= target) {
                            current = target;
                            clearInterval(timer);
                        }
                        numEl.textContent = Math.floor(current) + suffix;
                    }, 25);
                }
            });
        }, { threshold: 0.3 });

        numObserver.observe(item);
    });

    /* ===== 7. 章节指示器 ===== */
    var chapterDots = document.querySelectorAll('.chapter-dot');
    var chapters = document.querySelectorAll('.chapter, .hero');

    // 点击跳转
    chapterDots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            var targetId = this.getAttribute('data-target');
            var target = document.getElementById(targetId);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // 滚动时高亮当前章节
    function updateChapterNav() {
        var scrollPos = window.scrollY + window.innerHeight / 3;
        var currentIdx = 0;

        chapters.forEach(function (chap, idx) {
            var top = chap.offsetTop;
            if (scrollPos >= top) {
                currentIdx = idx;
            }
        });

        chapterDots.forEach(function (dot, idx) {
            dot.classList.toggle('active', idx === currentIdx);
        });
    }
    window.addEventListener('scroll', updateChapterNav);

    /* ===== 8. 特色卡片 3D 倾斜 ===== */
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

    /* ===== 9. 粒子背景 ===== */
    var canvas = document.getElementById('particles');
    var ctx = canvas.getContext('2d');
    var particles = [];
    var PARTICLE_COUNT = 50;

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

            // 粒子核心
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(240, 199, 94, ' + pulseAlpha + ')';
            ctx.fill();

            // 粒子光晕
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(240, 199, 94, ' + (pulseAlpha * 0.08) + ')';
            ctx.fill();
        });
        requestAnimationFrame(drawParticles);
    }
    drawParticles();

    /* ===== 10. 粒子鼠标交互（鼠标附近粒子加速） ===== */
    document.addEventListener('mousemove', function (e) {
        var mx = e.clientX;
        var my = e.clientY;
        particles.forEach(function (p) {
            var dx = p.x - mx;
            var dy = p.y - my;
            var dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150) {
                var force = (150 - dist) / 150;
                p.vx += (dx / dist) * force * 0.5;
                p.vy += (dy / dist) * force * 0.5;
            }
        });
    });

    // 粒子速度衰减（防止越来越快）
    setInterval(function () {
        particles.forEach(function (p) {
            p.vx *= 0.98;
            p.vy *= 0.98;
            // 限制最大速度
            var speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
            if (speed > 2) {
                p.vx = (p.vx / speed) * 2;
                p.vy = (p.vy / speed) * 2;
            }
        });
    }, 100);

    /* ===== 11. 视差背景文字移动 ===== */
    var bgText = document.getElementById('bgText');
    window.addEventListener('scroll', function () {
        if (bgText) {
            var scrolled = window.pageYOffset;
            var section = document.querySelector('.chapter-manifesto');
            if (section) {
                var offset = section.offsetTop - scrolled;
                bgText.style.transform = 'translate(-50%, calc(-50% + ' + (offset * 0.05) + 'px))';
            }
        }
    });
});
