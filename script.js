document.addEventListener('DOMContentLoaded', function() {
    feather.replace(); // 在 DOMContentLoaded 事件中调用 feather.replace()

    // 回到顶部按钮逻辑
    const backToTopButton = document.getElementById('back-to-top');

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopButton.classList.add('show');
        } else {
            backToTopButton.classList.remove('show');
        }
    });

    backToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }); 

    // 每日一言逻辑
    const quoteText = document.getElementById('quote-text');
    const quoteFrom = document.getElementById('quote-from');

    async function fetchDailyQuote() {
        try {
            const response = await fetch('https://v1.hitokoto.cn/?c=i&encode=json');
            const data = await response.json();
            
            quoteText.textContent = `"${data.hitokoto}"`;
            quoteFrom.textContent = `- ${data.from}`;
        } catch (error) {
            // 如果API调用失败，使用备用名言
            const fallbackQuotes = [
                { text: "未来属于那些相信梦想之美的人。", from: "埃莉诺·罗斯福" },
                { text: "唯一能做出伟大工作的方法就是热爱你所做的一切。", from: "史蒂夫·乔布斯" },
                { text: "生活就像骑自行车。为了保持平衡，你必须不断前进。", from: "阿尔伯特·爱因斯坦" }
            ];
            
            const randomIndex = Math.floor(Math.random() * fallbackQuotes.length);
            const fallbackQuote = fallbackQuotes[randomIndex];
            
            quoteText.textContent = `"${fallbackQuote.text}"`;
            quoteFrom.textContent = `- ${fallbackQuote.from}`;
        }
    }

    fetchDailyQuote();

    // 页面加载时的淡入效果
    const body = document.body;
    body.classList.add('fade-in'); // 添加淡入类
    setTimeout(() => {
        body.classList.add('active'); // 激活淡入效果
    }, 100); // 延迟一小段再激活，确保 CSS 过渡生效

    // 页面淡出跳转
    // 只处理"阅读更多"和"查看更多博文"按钮
    // 只处理指向.html或blog/的链接
    document.querySelectorAll('.button.secondary, .button.primary').forEach(btn => {
        btn.addEventListener('click', function(e) {
            const href = btn.getAttribute('href');
            if (href && (href.endsWith('.html') || href.startsWith('blog/'))) {
                e.preventDefault();
                document.body.classList.add('fade-out');
                setTimeout(() => {
                    window.location.href = href;
                }, 500);
            }
        });
    });

    // 平滑滚动到作品集
    document.querySelectorAll('a.button.primary[href="#portfolio"]').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.getElementById('portfolio');
            if (target) {
                const navbar = document.querySelector('.navbar');
                const navbarHeight = navbar ? navbar.offsetHeight : 0;
                const offsetTop = target.offsetTop - navbarHeight;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 时间轴导航淡出跳转
    document.querySelectorAll('a[href="/timeline/"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            document.body.classList.add('fade-out');
            setTimeout(() => {
                window.location.href = '/timeline/';
            }, 500);
        });
    });

    // 头像滚动效果
    const profilePhoto = document.querySelector('.profile-photo');
    let ticking = false;

    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                const currentScrollY = window.scrollY;

                if (currentScrollY > 100) {
                    profilePhoto.classList.add('scrolled');
                } else {
                    profilePhoto.classList.remove('scrolled');
                }

                ticking = false;
            });

            ticking = true;
        }
    });

    // Portfolio cards mouse tracking effect and entrance animation
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    
    // Add entrance animation
    portfolioItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(30px)';
        item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        
        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, 200 + (index * 100)); // Stagger the animation
        
        // Mouse tracking
        item.addEventListener('mousemove', (e) => {
            const rect = item.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            
            item.style.setProperty('--mouse-x', `${x}%`);
            item.style.setProperty('--mouse-y', `${y}%`);
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.setProperty('--mouse-x', '50%');
            item.style.setProperty('--mouse-y', '50%');
        });
    });

    

    // 导航栏滚动高亮逻辑
    const sections = document.querySelectorAll('section');
    const navbar = document.querySelector('.navbar'); // 获取导航栏元素
    const navbarHeight = navbar ? navbar.offsetHeight : 0; // 确保导航栏存在再获取高度

    const highlightNavLink = () => {
        let currentSectionId = '';
        // 获取当前滚动位置
        const scrollPosition = window.pageYOffset;
 
        sections.forEach(section => {
            // 计算 section 的顶部和底部相对于视口的位置
            const sectionTop = section.offsetTop - navbarHeight - 10; // 考虑导航栏高度和一些偏移
            const sectionBottom = sectionTop + section.clientHeight;

            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                currentSectionId = section.getAttribute('id');
            }
        });

        const navLinks = document.querySelectorAll('.navbar a');
        navLinks.forEach(link => {
            link.classList.remove('active'); // 移除所有活跃状态
            const linkHref = link.getAttribute('href').split('#')[1]; // 获取链接的哈希部分

            // 特殊处理：如果当前在博文页面（例如 /blog/ai-edu.html），则高亮"博文"导航项
            // 同时检查页面路径是否包含 'blog/' 或者是以 '/all-posts.html' 结尾
            const isBlogPostPage = window.location.pathname.includes('/blog/') || window.location.pathname.endsWith('/all-posts.html');

            if (isBlogPostPage && linkHref === 'blog') {
                link.classList.add('active');
            } else if (!isBlogPostPage && linkHref === currentSectionId) {
                // 如果在主页，根据滚动位置高亮对应 section 的导航项
                link.classList.add('active');
            } else if (!isBlogPostPage && currentSectionId === '' && linkHref === 'home') {
                // 如果在页面顶部，且当前没有其他 section 被高亮，高亮"首页"
                // 这适用于页面刚加载时，滚动位置在最顶部的情况
                link.classList.add('active');
            }
        });
    };

    // 监听滚动事件和页面加载事件
    window.addEventListener('scroll', highlightNavLink);
    // 页面加载后立即执行一次，以确保初始状态的导航项正确高亮
    highlightNavLink();
});

// 深浅模式切换逻辑
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.querySelector('.theme-toggle');

    // 获取当前主题
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    }

    // 🌟 核心魔法：向 Giscus 的 iframe 发送跨域换色指令
    function syncGiscusTheme(theme) {
        const iframe = document.querySelector('iframe.giscus-frame');
        if (!iframe) return;
        // 向评论区内部传递当前主题状态
        iframe.contentWindow.postMessage(
            { giscus: { setConfig: { theme: theme } } },
            'https://giscus.app'
        );
    }

    // 监听右上角按钮的点击切换
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        // 切换网页本地主题
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);

        // ⚡️ 同时让评论区瞬间变色
        syncGiscusTheme(newTheme);
    });

    // 🌟 核心防御：当 Giscus 刚刚加载完毕时，自动校准一次颜色
    window.addEventListener('message', (event) => {
        if (event.origin === 'https://giscus.app') {
            syncGiscusTheme(document.documentElement.getAttribute('data-theme') || 'light');
        }
    });
});





// ==========================================
// 极客版图片懒加载与淡入引擎
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('.markdown-content img');
    if (images.length === 0) return;

    // 1. 物理拦截：给所有图片强制加上 HTML5 原生懒加载属性
    // 这行代码会让浏览器底层接管网络请求，不在屏幕内的图片坚决不下载！
    images.forEach(img => img.setAttribute('loading', 'lazy'));

    // 2. 视觉魔法：使用 Intersection Observer 监控图片是否进入视口
    const observerOptions = {
        root: null,
        rootMargin: '50px 0px', // 提前 50px 触发，让用户感觉不到延迟
        threshold: 0.1 // 露出 10% 就开始动画
    };

    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                
                // 为了确保图片真的下载完了再显示，我们监听它的 load 事件
                if (img.complete) {
                    img.classList.add('lazy-loaded');
                } else {
                    img.addEventListener('load', () => {
                        img.classList.add('lazy-loaded');
                    });
                }
                
                // 观察过并且触发动画后，就解除观察，节省 CPU 性能
                observer.unobserve(img);
            }
        });
    }, observerOptions);

    // 3. 开始监视所有文章内的图片
    images.forEach(img => {
        imageObserver.observe(img);
    });
});


// ==========================================
// 极客全局迷你播放器引擎 (非音乐馆页面接收器)
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    // 1. 判断是否在音乐馆：如果是，则不显示小圆圈（因为已有大播放器）
    const isHallPage = window.location.pathname.includes('/hall');
    if (isHallPage) return;

    // 2. 从本地缓存读取刚刚在音乐馆听的歌
    const savedSongInfo = localStorage.getItem('geekCurrentSong');
    if (!savedSongInfo) return; 

    const songData = JSON.parse(savedSongInfo);

    // 3. 动态生成迷你播放器并注入到网页左下角
    const miniPlayerHTML = `
        <div class="global-mini-player" id="global-mini-player">
            <img src="${songData.cover}" class="mini-player-cover" id="mini-cover" alt="cover">
            <div class="mini-player-info">
                <p class="mini-player-title" id="mini-title">${songData.title}</p>
                <p class="mini-player-artist">${songData.artist}</p>
            </div>
            <div class="mini-player-controls">
                <button class="mini-play-btn" id="mini-play-btn">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                </button>
            </div>
            <audio id="global-audio" src="${songData.src}"></audio>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', miniPlayerHTML);

    // 4. 为小圆盘绑定点击与状态接力逻辑
    const miniPlayer = document.getElementById('global-mini-player');
    const audio = document.getElementById('global-audio');
    const playBtn = document.getElementById('mini-play-btn');

    // 完美接力：恢复你刚才在音乐馆听到的秒数
    audio.currentTime = songData.currentTime || 0;

    let isPlaying = false;

    // 播放/暂停控制
    playBtn.addEventListener('click', function() {
        if (audio.paused) {
            audio.play().then(() => {
                isPlaying = true;
                miniPlayer.classList.add('is-playing');
                // 切换为暂停图标
                playBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`;
            }).catch(e => console.log('浏览器阻止了自动播放', e));
        } else {
            audio.pause();
            isPlaying = false;
            miniPlayer.classList.remove('is-playing');
            // 切换回播放图标
            playBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
        }
    });

    // 其它页面放歌时，也要实时把进度存起来，保证切页面不掉线
    audio.addEventListener('timeupdate', function() {
        songData.currentTime = audio.currentTime;
        localStorage.setItem('geekCurrentSong', JSON.stringify(songData));
    });
});

// ==========================================
// 极客阅读体验：列表滚动位置记忆引擎 (终极精准版)
// ==========================================
// 取消浏览器原生的滚动恢复，由我们的极客引擎全面接管
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

// 1. 监听点击事件，像读心术一样判断用户意图 (替代不可靠的离开事件)
document.addEventListener('click', (e) => {
    // 意图 A：用户在列表页点击了文章，准备进入阅读
    const isPostLink = e.target.closest('.post-item-hux a, .archive-item a');
    if (isPostLink) {
        // 死死锁定当前列表页的路径和精确的滚动坐标
        const currentPath = window.location.pathname.replace(/\/$/, '');
        sessionStorage.setItem('geekScroll_' + currentPath, window.scrollY);
    }
    
    // 意图 B：用户点击了顶部导航栏 (Navbar)，说明想看全新的页面
    const isNavLink = e.target.closest('.navbar a');
    if (isNavLink) {
        // 无情擦除目标页面的记忆，保证通过导航栏进入永远从第一眼看起
        let href = isNavLink.getAttribute('href');
        if (href && !href.startsWith('#')) {
            let targetPath = new URL(href, window.location.origin).pathname.replace(/\/$/, '');
            sessionStorage.removeItem('geekScroll_' + targetPath);
        }
    }
});

// 2. 页面加载时的强力恢复引擎
const restoreScrollPos = () => {
    const currentPath = window.location.pathname.replace(/\/$/, '');
    const savedPos = sessionStorage.getItem('geekScroll_' + currentPath);
    
    if (savedPos && parseInt(savedPos) > 0) {
        const pos = parseInt(savedPos, 10);
        // 三重保险瞬间移动：彻底打败网络延迟、图片撑开和页面的淡入动画
        window.scrollTo({ top: pos, behavior: 'instant' });
        setTimeout(() => window.scrollTo({ top: pos, behavior: 'instant' }), 50);
        setTimeout(() => window.scrollTo({ top: pos, behavior: 'instant' }), 300);
    }
};

// 3. 挂载到两大核心生命周期上
document.addEventListener('DOMContentLoaded', restoreScrollPos);
window.addEventListener('pageshow', restoreScrollPos);