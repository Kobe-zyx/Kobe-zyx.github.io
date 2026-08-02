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
    const isHallPage = window.location.pathname.includes('/hall');
    if (isHallPage) return;

    const savedSongInfo = localStorage.getItem('geekCurrentSong');
    if (!savedSongInfo) return; 

    const songData = JSON.parse(savedSongInfo);

    const miniPlayerHTML = `
        <div class="global-mini-player" id="global-mini-player">
            <img src="${songData.cover}" class="mini-player-cover" id="mini-cover" alt="cover" title="返回音乐馆" style="cursor: pointer;">
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

    const miniPlayer = document.getElementById('global-mini-player');
    const audio = document.getElementById('global-audio');
    const playBtn = document.getElementById('mini-play-btn');
    const miniCover = document.getElementById('mini-cover');

    // 点击封面：正常返回音乐馆
    miniCover.addEventListener('click', function() {
        document.body.classList.add('fade-out'); 
        setTimeout(() => { window.location.href = '/hall/'; }, 500); 
    });

    audio.currentTime = songData.currentTime || 0;
    let isPlaying = false;

    playBtn.addEventListener('click', function() {
        if (audio.paused) {
            audio.play().then(() => {
                isPlaying = true;
                miniPlayer.classList.add('is-playing');
                playBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`;
            }).catch(e => console.log('自动播放被拦截', e));
        } else {
            audio.pause();
            isPlaying = false;
            miniPlayer.classList.remove('is-playing');
            playBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
        }
    });

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


// ==========================================
// 阅读进度条引擎 (Reading Progress Bar)
// ==========================================
class ReadingProgressBar {
    constructor() {
        this.progressBar = null;
        this.progressFill = null;
        this.ticking = false;
        this.init();
    }

    /**
     * 初始化进度条
     * 检测页面类型，仅在博客文章页创建进度条
     */
    init() {
        if (!this.isBlogPostPage()) {
            return;
        }
        this.createProgressBar();
        this.bindEvents();
    }

    /**
     * 检测是否为博客文章页
     * @returns {boolean}
     */
    isBlogPostPage() {
        try {
            const path = window.location.pathname;
            // 检测是否为博客文章页：
            // 1. 路径以 .html 结尾（文章页面）
            // 2. 排除首页、博客列表页、时间轴、项目页等
            // 3. 排除 /blog/index.html 和 /blog/
            const isHtmlPage = path.endsWith('.html');
            const isExcludedPage = path === '/' || 
                                   path === '/index.html' ||
                                   path === '/blog/' ||
                                   path === '/blog/index.html' ||
                                   path === '/timeline/' ||
                                   path === '/timeline/index.html' ||
                                   path === '/projects/' ||
                                   path === '/projects/index.html' ||
                                   path === '/archive/' ||
                                   path === '/archive/index.html' ||
                                   path === '/hall/' ||
                                   path === '/hall/index.html' ||
                                   path === '/stack/' ||
                                   path === '/stack/index.html' ||
                                   path === '/changelog/' ||
                                   path === '/changelog/index.html';
            
            return isHtmlPage && !isExcludedPage;
        } catch (error) {
            console.warn('Reading Progress Bar: Failed to detect page type', error);
            return false; // 默认不显示进度条
        }
    }

    /**
     * 创建进度条 DOM 元素
     */
    createProgressBar() {
        try {
            this.progressBar = document.createElement('div');
            this.progressBar.id = 'reading-progress-bar';
            this.progressBar.className = 'reading-progress-bar';
            
            this.progressFill = document.createElement('div');
            this.progressFill.className = 'progress-fill';
            
            this.progressBar.appendChild(this.progressFill);
            document.body.appendChild(this.progressBar);
        } catch (error) {
            console.error('Reading Progress Bar: Failed to create DOM elements', error);
            this.progressBar = null;
            this.progressFill = null;
        }
    }

    /**
     * 绑定滚动事件监听器
     */
    bindEvents() {
        window.addEventListener('scroll', () => this.onScroll(), { passive: true });
        // 初始化时计算一次进度
        this.updateProgress();
    }

    /**
     * 滚动事件处理器（使用 requestAnimationFrame 节流）
     */
    onScroll() {
        if (!this.ticking) {
            window.requestAnimationFrame(() => {
                this.updateProgress();
                this.ticking = false;
            });
            this.ticking = true;
        }
    }

    /**
     * 计算并更新进度条宽度
     */
    updateProgress() {
        try {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const docHeight = document.documentElement.scrollHeight;
            const winHeight = window.innerHeight;
            
            // 防御性检查
            if (!this.progressFill || docHeight <= winHeight) {
                return;
            }
            
            const scrollPercent = scrollTop / (docHeight - winHeight);
            const scrollPercentRounded = Math.max(0, Math.min(100, Math.round(scrollPercent * 100)));
            
            this.progressFill.style.width = `${scrollPercentRounded}%`;
        } catch (error) {
            console.error('Reading Progress Bar: Failed to update progress', error);
        }
    }

    /**
     * 清理资源（页面卸载时调用）
     */
    destroy() {
        if (this.progressBar && this.progressBar.parentNode) {
            this.progressBar.parentNode.removeChild(this.progressBar);
        }
    }
}

// 在 DOMContentLoaded 事件中初始化阅读进度条
document.addEventListener('DOMContentLoaded', function() {
    const readingProgressBar = new ReadingProgressBar();
    
    // 页面卸载时清理资源
    window.addEventListener('beforeunload', () => {
        readingProgressBar.destroy();
    });
});

// ==========================================
// 🌟 极客彩蛋：隐藏终端 (Terminal) 引擎
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const terminal = document.getElementById('geek-terminal');
    if (!terminal) return;

    const termInput = document.getElementById('terminal-input');
    const termOutput = document.getElementById('terminal-output');
    const termClose = document.getElementById('terminal-close');
    const matrixCanvas = document.getElementById('matrix-canvas');
    let isTerminalOpen = false;

    // 打开/关闭逻辑
    const openTerminal = () => {
        terminal.classList.add('show');
        isTerminalOpen = true;
        setTimeout(() => termInput.focus(), 200);
    };
    const closeTerminal = () => {
        terminal.classList.remove('show');
        isTerminalOpen = false;
        termInput.blur();
        stopMatrix(); // 关闭时停止代码雨节省性能
    };

    // 监听 Ctrl+~ 或 Cmd+~
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && (e.key === '`' || e.code === 'Backquote')) {
            e.preventDefault();
            if (isTerminalOpen) closeTerminal();
            else openTerminal();
        }
        if (e.key === 'Escape' && isTerminalOpen) {
            closeTerminal();
        }
    });

    termClose.addEventListener('click', closeTerminal);
    terminal.querySelector('.terminal-body').addEventListener('click', () => {
        if (window.getSelection().toString() === '') termInput.focus();
    });

    // 打印输出函数
    const printLine = (text, type = '') => {
        const line = document.createElement('div');
        if (type) line.className = `terminal-text-${type}`;
        line.innerHTML = text; 
        termOutput.appendChild(line);
        termOutput.parentNode.scrollTop = termOutput.parentNode.scrollHeight;
    };

    // 🌟 极客专属指令集
    const commands = {
        help: () => {
            printLine('Available commands:', 'yellow');
            printLine('  <span class="terminal-text-blue">whoami</span>  - About the author');
            printLine('  <span class="terminal-text-blue">date</span>    - Current system time');
            printLine('  <span class="terminal-text-blue">clear</span>   - Clear terminal output');
            printLine('  <span class="terminal-text-blue">matrix</span>  - Enter the matrix (Easter Egg)');
            printLine('  <span class="terminal-text-blue">exit</span>    - Close terminal');
        },
        whoami: () => {
            printLine('Name: Kobe_zyx', 'green');
            printLine('Role: Geek, Developer, Blogger');
            printLine('Status: Writing code and changing the world.');
        },
        date: () => { printLine(new Date().toString()); },
        clear: () => { termOutput.innerHTML = ''; },
        exit: () => { closeTerminal(); },
        matrix: () => {
            printLine('Initializing Matrix protocol...', 'green');
            startMatrix();
        }
    };

    // 监听输入回车
    termInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const cmd = termInput.value.trim().toLowerCase();
            printLine(`geek@blog:~$ ${termInput.value}`);
            termInput.value = '';
            
            if (cmd) {
                if (commands[cmd]) commands[cmd]();
                else printLine(`bash: ${cmd}: command not found. Type 'help'.`, 'yellow');
            }
        }
    });

    // 🌟 Matrix 代码雨引擎 (Canvas)
    let matrixInterval;
    const startMatrix = () => {
        if (matrixCanvas.classList.contains('active')) return;
        matrixCanvas.classList.add('active');
        const ctx = matrixCanvas.getContext('2d');
        matrixCanvas.width = terminal.offsetWidth;
        matrixCanvas.height = terminal.offsetHeight;

        const chars = '01'; // 纯粹的 01 矩阵
        const fontSize = 14;
        const columns = matrixCanvas.width / fontSize;
        const drops = Array(Math.floor(columns)).fill(1);

        clearInterval(matrixInterval);
        matrixInterval = setInterval(() => {
            ctx.fillStyle = 'rgba(30, 30, 30, 0.1)';
            ctx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
            
            ctx.fillStyle = '#0F0';
            ctx.font = fontSize + 'px monospace';

            for (let i = 0; i < drops.length; i++) {
                const text = chars.charAt(Math.floor(Math.random() * chars.length));
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                if (drops[i] * fontSize > matrixCanvas.height && Math.random() > 0.95) drops[i] = 0;
                drops[i]++;
            }
        }, 33);
    };

    const stopMatrix = () => {
        matrixCanvas.classList.remove('active');
        clearInterval(matrixInterval);
    };
    
    window.addEventListener('resize', () => {
        if(matrixCanvas.classList.contains('active')){
            matrixCanvas.width = terminal.offsetWidth;
            matrixCanvas.height = terminal.offsetHeight;
        }
    });
});

// ==========================================
// 🌟 极客引擎：鼠标探照灯坐标实时同步 (性能优化版)
// ==========================================
document.addEventListener('mousemove', (e) => {
    // 🌟 核心拦截：如果是浅色模式，直接 return，不计算坐标，不消耗一滴性能！
    if (document.documentElement.getAttribute('data-theme') !== 'dark') return;
    
    const spotlight = document.getElementById('mouse-spotlight');
    if (!spotlight) return;

    window.requestAnimationFrame(() => {
        spotlight.style.left = e.clientX + 'px';
        spotlight.style.top = e.clientY + 'px';
    });
});

// 当鼠标离开窗口时，优雅地淡出光晕 (改用 Class 控制，彻底告别内联样式污染)
document.addEventListener('mouseleave', () => {
    const spotlight = document.getElementById('mouse-spotlight');
    if (spotlight) spotlight.classList.add('is-hidden');
});

// 鼠标重新进入时恢复
document.addEventListener('mouseenter', () => {
    const spotlight = document.getElementById('mouse-spotlight');
    if (spotlight) spotlight.classList.remove('is-hidden');
});

// ==========================================
// 🌟 极客引擎：沉浸式划词菜单 (Text Selection Tooltip)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // 1. 用 JS 凭空捏造一个菜单 DOM，绝对不污染 HTML
    const tooltip = document.createElement('div');
    tooltip.className = 'geek-selection-tooltip';
    tooltip.innerHTML = `
        <button id="st-copy"><i data-feather="copy"></i> 复制金句</button>
        <div class="st-divider"></div>
        <button id="st-share"><i data-feather="twitter"></i> 分享至 X</button>
    `;
    document.body.appendChild(tooltip);
    if(typeof feather !== 'undefined') feather.replace();

    let selectedText = '';

    // 2. 🌟 核心升级：监听“鼠标右键”事件 (contextmenu)
    document.addEventListener('contextmenu', (e) => {
        // 🌟 终极交互逻辑：如果自定义菜单已经处于“打开”状态，说明这是用户的“第二次右键”！
        // 此时我们隐藏自定义菜单，并且【绝对不拦截默认事件】，让浏览器原生菜单顺滑弹出！
        if (tooltip.classList.contains('show')) {
            tooltip.classList.remove('show');
            setTimeout(() => { tooltip.style.display = 'none'; }, 200);
            return; // 极其关键的 return，不再往下执行 e.preventDefault()
        }

        // 如果右键点击的是我们自己的菜单，直接拦截
        if (tooltip.contains(e.target)) {
            e.preventDefault();
            return;
        }

        const selection = window.getSelection();
        selectedText = selection.toString().trim();

        // 区域探测：判断选中的文本是否在博文正文内 (.markdown-content)
        let isInsidePost = false;
        if (selection.rangeCount > 0) {
            let container = selection.getRangeAt(0).commonAncestorContainer;
            if (container.nodeType === 3) container = container.parentNode; 
            if (container.closest('.markdown-content')) {
                isInsidePost = true;
            }
        }

        const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
        
        // 触发条件：有选中文字 + 在博文区内 + 不在输入框里
        if (selectedText.length > 0 && isInsidePost && activeTag !== 'input' && activeTag !== 'textarea') {
            
            e.preventDefault(); // 第一次右键：拦截原生菜单
            
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect(); 
            
            tooltip.style.display = 'flex';
            void tooltip.offsetWidth; // 触发重绘，保证动画不跳闪

            const tooltipWidth = tooltip.offsetWidth;
            const tooltipHeight = tooltip.offsetHeight;
            
            // 计算坐标
            let top = rect.top + window.scrollY - tooltipHeight - 12; 
            let left = rect.left + window.scrollX + (rect.width / 2) - (tooltipWidth / 2);
            
            // 边缘检测与翻转：如果文字太靠顶部，小三角和菜单翻转到文字下方
            if (top < window.scrollY) {
                top = rect.bottom + window.scrollY + 12;
                tooltip.style.transformOrigin = 'top center';
                tooltip.classList.add('flip'); 
            } else {
                tooltip.style.transformOrigin = 'bottom center';
                tooltip.classList.remove('flip');
            }
            
            tooltip.style.top = `${top}px`;
            tooltip.style.left = `${left}px`;
            tooltip.classList.add('show');
            
        } else {
            // 不符合条件时，隐藏我们自己的菜单，放行系统原生菜单
            tooltip.classList.remove('show');
            setTimeout(() => { 
                if(!tooltip.classList.contains('show')) tooltip.style.display = 'none'; 
            }, 200); 
        }
    });

    // 3. 点击鼠标左键时，强制隐藏菜单
    document.addEventListener('mousedown', (e) => {
        // 如果是按右键(e.button === 2)，交由上面的 contextmenu 去处理，这里忽略
        if (e.button === 2) return; 
        
        if (!tooltip.contains(e.target) && tooltip.classList.contains('show')) {
            tooltip.classList.remove('show');
            setTimeout(() => { tooltip.style.display = 'none'; }, 200);
        }
    });

    // 4. 核心功能：优雅地复制
    document.getElementById('st-copy').addEventListener('click', () => {
        navigator.clipboard.writeText(selectedText).then(() => {
            const btn = document.getElementById('st-copy');
            const originalHtml = btn.innerHTML;
            btn.innerHTML = '<i data-feather="check"></i> 复制成功';
            feather.replace();
            btn.style.color = '#10B981'; // 绿字成功提示

            setTimeout(() => {
                btn.innerHTML = originalHtml;
                btn.style.color = '';
                feather.replace();
                window.getSelection().removeAllRanges(); // 复制完毕取消高亮
                tooltip.classList.remove('show');
            }, 1500);
        });
    });

    // 5. 核心功能：一键分享至 X (Twitter)
    document.getElementById('st-share').addEventListener('click', () => {
        const url = encodeURIComponent(window.location.href);
        const text = encodeURIComponent(`「${selectedText}」`);
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'width=600,height=500,left=200,top=200');
        
        window.getSelection().removeAllRanges();
        tooltip.classList.remove('show');
    });
});


// ==========================================
// 🌟 极客引擎：Apple TV 级 3D 空间卡片倾斜悬浮 (3D Tilt Engine)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // 自动搜寻全站所有的卡片元素
    const cardSelectors = '.related-post-card, .career-item-card, .music-track, .portfolio-item';
    const cards = document.querySelectorAll(cardSelectors);

    cards.forEach(card => {
        // 给卡片打上 3D 物理类名
        card.classList.add('tilt-card');

        // 如果内部还没有高光层，自动凭空注入高光 DOM
        if (!card.querySelector('.tilt-card-glare')) {
            const glare = document.createElement('div');
            glare.className = 'tilt-card-glare';
            card.appendChild(glare);
        }

        let ticking = false;

        card.addEventListener('mousemove', (e) => {
            // 鼠标移动时，移除平滑归位类名，保证贴合度
            card.classList.remove('tilt-reset');

            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const rect = card.getBoundingClientRect();
                    const width = rect.width;
                    const height = rect.height;
                    
                    // 计算鼠标相对卡片中心点的百分比 (-0.5 ~ 0.5)
                    const mouseX = e.clientX - rect.left;
                    const mouseY = e.clientY - rect.top;
                    
                    const xPct = (mouseX / width) - 0.5;
                    const yPct = (mouseY / height) - 0.5;

                    // 倾斜角度设定：最大倾斜 10 度
                    const maxTilt = 10;
                    const rotateX = (-yPct * maxTilt).toFixed(2); // 沿 X 轴旋转 (上下倾斜)
                    const rotateY = (xPct * maxTilt).toFixed(2);  // 沿 Y 轴旋转 (左右倾斜)

                    // 🌟 物理变形：1000px 3D 视距 + 双轴旋转 + Z轴微微放大浮起
                    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;

                    // 🌟 镜面高光坐标同步 (百分比)
                    const glareX = ((mouseX / width) * 100).toFixed(1);
                    const glareY = ((mouseY / height) * 100).toFixed(1);
                    card.style.setProperty('--glare-x', `${glareX}%`);
                    card.style.setProperty('--glare-y', `${glareY}%`);

                    ticking = false;
                });
                ticking = true;
            }
        });

        card.addEventListener('mouseleave', () => {
            // 鼠标离开卡片时，触发平滑复位
            card.classList.add('tilt-reset');
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        });
    });
});

// ==========================================
// 🌟 极客引擎：视频链接自动解析与懒加载 (Auto Video Embed 终极防御版)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const links = document.querySelectorAll('.markdown-content a');

    links.forEach(link => {
        try {
            // 安全获取超链接，防止对象报错
            const url = link.getAttribute('href') || '';
            if (!url) return;
            
            let wrapper = null;

            // 1. YouTube 嗅探器
            const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
            if (ytMatch) {
                const videoId = ytMatch[1];
                // 🌟 修复：改用 hqdefault.jpg 替代 maxresdefault.jpg，彻底解决 404 破图报错！
                const coverUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                
                wrapper = document.createElement('div');
                wrapper.className = 'geek-video-wrapper';
                wrapper.innerHTML = `
                    <div class="video-cover-container" title="点击播放视频">
                        <img src="${coverUrl}" alt="YouTube Video Cover" loading="lazy">
                        <div class="video-play-btn">
                            <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                        </div>
                    </div>
                `;
                const coverContainer = wrapper.querySelector('.video-cover-container');
                coverContainer.addEventListener('click', function() {
                    wrapper.innerHTML = `<iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
                });
            } 
            // 2. Bilibili 嗅探器
            else {
                const biliMatch = url.match(/bilibili\.com\/video\/(BV[a-zA-Z0-9]+)/i);
                if (biliMatch) {
                    const bvid = biliMatch[1];
                    wrapper = document.createElement('div');
                    wrapper.className = 'geek-video-wrapper';
                    wrapper.innerHTML = `<iframe src="//player.bilibili.com/player.html?bvid=${bvid}&page=1&high_quality=1&danmaku=0" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>`;
                }
            }

            // 🌟 终极渲染替换逻辑，加入 DOM 容错处理
            if (wrapper) {
                const parent = link.parentNode;
                if (!parent) return; 

                if (parent.tagName === 'P' && parent.textContent.trim() === link.textContent.trim()) {
                    if (parent.parentNode) {
                        parent.parentNode.replaceChild(wrapper, parent);
                    }
                } else {
                    parent.replaceChild(wrapper, link);
                }
            }
        } catch (e) {
            console.warn('视频解析异常，安全跳过:', e);
        }
    });
});    