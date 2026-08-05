document.addEventListener('DOMContentLoaded', function() {
    feather.replace(); // 在 DOMContentLoaded 事件中调用 feather.replace()

    const backToTopButton = document.getElementById('back-to-top');
    const profilePhoto = document.querySelector('.profile-photo');
    const body = document.body;
    
    // ==========================================
    // 页面跳转与淡入淡出逻辑
    // ==========================================
    body.classList.add('fade-in'); 
    setTimeout(() => {
        body.classList.add('active'); 
    }, 100); 

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

    document.querySelectorAll('a[href="/timeline/"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            document.body.classList.add('fade-out');
            setTimeout(() => {
                window.location.href = '/timeline/';
            }, 500);
        });
    });

    // 回到顶部点击事件
    if (backToTopButton) {
        backToTopButton.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }); 
    }

    // ==========================================
    // Portfolio 卡片鼠标追踪特效
    // ==========================================
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    portfolioItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(30px)';
        item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        
        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, 200 + (index * 100)); 
        
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

    // ==========================================
    // 导航栏滚动高亮逻辑 (提取为独立函数供总线调用)
    // ==========================================
    const sections = document.querySelectorAll('section');
    const navbar = document.querySelector('.navbar'); 
    const navbarHeight = navbar ? navbar.offsetHeight : 0; 

    const highlightNavLink = () => {
        let currentSectionId = '';
        const scrollPosition = window.pageYOffset;
 
        sections.forEach(section => {
            const sectionTop = section.offsetTop - navbarHeight - 10; 
            const sectionBottom = sectionTop + section.clientHeight;

            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                currentSectionId = section.getAttribute('id');
            }
        });

        const navLinks = document.querySelectorAll('.navbar a');
        navLinks.forEach(link => {
            link.classList.remove('active'); 
            const linkHref = link.getAttribute('href').split('#')[1]; 

            const isBlogPostPage = window.location.pathname.includes('/blog/') || window.location.pathname.endsWith('/all-posts.html');

            if (isBlogPostPage && linkHref === 'blog') {
                link.classList.add('active');
            } else if (!isBlogPostPage && linkHref === currentSectionId) {
                link.classList.add('active');
            } else if (!isBlogPostPage && currentSectionId === '' && linkHref === 'home') {
                link.classList.add('active');
            }
        });
    };

    // ==========================================
    // 🌟 极客引擎：全局滚动总线 (Global Scroll Bus - 性能终极版)
    // ==========================================
    let isGlobalScrolling = false;
    
    window.addEventListener('scroll', () => {
        if (!isGlobalScrolling) {
            window.requestAnimationFrame(() => {
                const scrollY = window.pageYOffset || document.documentElement.scrollTop;

                // 1. 派发：回到顶部按钮状态
                if (backToTopButton) {
                    if (scrollY > 300) backToTopButton.classList.add('show');
                    else backToTopButton.classList.remove('show');
                }

                // 2. 派发：头像滚动缩放动效
                if (profilePhoto) {
                    if (scrollY > 100) profilePhoto.classList.add('scrolled');
                    else profilePhoto.classList.remove('scrolled');
                }

                // 3. 派发：导航栏高亮计算
                if (typeof highlightNavLink === 'function') {
                    highlightNavLink();
                }

                isGlobalScrolling = false;
            });
            isGlobalScrolling = true;
        }
    }, { passive: true }); // passive 彻底解放浏览器原生滚动线程！

    // 页面加载后立即执行一次高亮判断
    highlightNavLink();
});

// ==========================================
// 极客版图片懒加载与淡入引擎
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('.markdown-content img');
    if (images.length === 0) return;

    images.forEach(img => img.setAttribute('loading', 'lazy'));

    const observerOptions = {
        root: null,
        rootMargin: '50px 0px', 
        threshold: 0.1 
    };

    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.complete) {
                    img.classList.add('lazy-loaded');
                } else {
                    img.addEventListener('load', () => {
                        img.classList.add('lazy-loaded');
                    });
                }
                observer.unobserve(img);
            }
        });
    }, observerOptions);

    images.forEach(img => {
        imageObserver.observe(img);
    });
});


// ==========================================
// 🌟 极客引擎：全局迷你播放器 + 实时音频频谱引擎
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    const isHallPage = window.location.pathname.includes('/hall');
    if (isHallPage) return; // 音乐馆页面不显示迷你播放器

    const savedSongInfo = localStorage.getItem('geekCurrentSong');
    if (!savedSongInfo) return; 

    const songData = JSON.parse(savedSongInfo);

    // 🌟 HTML 结构升级：注入了 mini-visualizer 画布，并开启 crossorigin 允许跨域音频分析
    const miniPlayerHTML = `
        <div class="global-mini-player" id="global-mini-player">
            <canvas id="mini-visualizer" class="mini-visualizer"></canvas>
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
            <audio id="global-audio" src="${songData.src}" crossorigin="anonymous"></audio>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', miniPlayerHTML);

    const miniPlayer = document.getElementById('global-mini-player');
    const audio = document.getElementById('global-audio');
    const playBtn = document.getElementById('mini-play-btn');
    const miniCover = document.getElementById('mini-cover');
    const canvas = document.getElementById('mini-visualizer');
    const ctx = canvas.getContext('2d');

    miniCover.addEventListener('click', function() {
        document.body.classList.add('fade-out'); 
        setTimeout(() => { window.location.href = '/hall/'; }, 500); 
    });

    audio.currentTime = songData.currentTime || 0;
    let isPlaying = false;

    // 🌟 核心引擎：Web Audio API 状态变量
    let audioCtx = null;
    let analyser = null;
    let source = null;

    // 初始化硬件音频接口 (必须在用户点击后触发)
    const initVisualizer = () => {
        if (audioCtx) return; 
        
        // 建立神经桥接：获取底层 AudioContext
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64; // 采样率，越小柱子越粗，颗粒感越强
        
        source = audioCtx.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(audioCtx.destination);
        
        renderFrame(); // 启动帧渲染循环
    };

    // 极速渲染循环 (60fps)
    const renderFrame = () => {
        requestAnimationFrame(renderFrame);
        if (!isPlaying) return; // 如果暂停了，瞬间停止 GPU 算力消耗

        // 同步 Canvas 物理像素与 CSS 像素
        if (canvas.width !== canvas.offsetWidth) canvas.width = canvas.offsetWidth;
        if (canvas.height !== canvas.offsetHeight) canvas.height = canvas.offsetHeight;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray); // 抽取当前毫秒的频段数据

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 我们只取前一半的低频和中频数据，这样柱子跳动幅度更明显
        const renderLength = Math.floor(bufferLength * 0.7); 
        const barWidth = (canvas.width / renderLength);
        let x = 0;

        for (let i = 0; i < renderLength; i++) {
            // 对数放大处理，让音频跳动更具视觉冲击
            const barHeight = (dataArray[i] / 255) * canvas.height * 0.8;
            
            // Apple 风动态渐变色
            const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            if (isDark) {
                gradient.addColorStop(0, 'rgba(10, 132, 255, 0.2)'); // 深色模式透出微蓝
                gradient.addColorStop(1, 'rgba(191, 90, 242, 1)');   // 迷幻紫
            } else {
                gradient.addColorStop(0, 'rgba(0, 122, 255, 0.2)');
                gradient.addColorStop(1, 'rgba(0, 122, 255, 1)');    // 纯正 Apple 蓝
            }

            ctx.fillStyle = gradient;
            // 绘制带有 1px 间隙的柱状图
            ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);

            x += barWidth;
        }
    };

    playBtn.addEventListener('click', function() {
        if (audio.paused) {
            initVisualizer(); // 🌟 每次播放前确保引擎已激活
            
            // 解决某些浏览器 AudioContext 在进入页面时被挂起的问题
            if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();

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
            
            // 暂停时绘制一个平滑下降的归零动画 (视觉细节)
            setTimeout(() => { ctx.clearRect(0, 0, canvas.width, canvas.height); }, 100);
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
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

document.addEventListener('click', (e) => {
    const isPostLink = e.target.closest('.post-item-hux a, .archive-item a');
    if (isPostLink) {
        const currentPath = window.location.pathname.replace(/\/$/, '');
        sessionStorage.setItem('geekScroll_' + currentPath, window.scrollY);
    }
    
    const isNavLink = e.target.closest('.navbar a');
    if (isNavLink) {
        let href = isNavLink.getAttribute('href');
        if (href && !href.startsWith('#')) {
            let targetPath = new URL(href, window.location.origin).pathname.replace(/\/$/, '');
            sessionStorage.removeItem('geekScroll_' + targetPath);
        }
    }
});

const restoreScrollPos = () => {
    const currentPath = window.location.pathname.replace(/\/$/, '');
    const savedPos = sessionStorage.getItem('geekScroll_' + currentPath);
    
    if (savedPos && parseInt(savedPos) > 0) {
        const pos = parseInt(savedPos, 10);
        window.scrollTo({ top: pos, behavior: 'instant' });
        setTimeout(() => window.scrollTo({ top: pos, behavior: 'instant' }), 50);
        setTimeout(() => window.scrollTo({ top: pos, behavior: 'instant' }), 300);
    }
};

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

    init() {
        if (!this.isBlogPostPage()) return;
        this.createProgressBar();
        this.bindEvents();
    }

    isBlogPostPage() {
        try {
            const path = window.location.pathname;
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
            return false; 
        }
    }

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
            this.progressBar = null;
            this.progressFill = null;
        }
    }

    bindEvents() {
        window.addEventListener('scroll', () => this.onScroll(), { passive: true });
        this.updateProgress();
    }

    onScroll() {
        if (!this.ticking) {
            window.requestAnimationFrame(() => {
                this.updateProgress();
                this.ticking = false;
            });
            this.ticking = true;
        }
    }

    updateProgress() {
        try {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const docHeight = document.documentElement.scrollHeight;
            const winHeight = window.innerHeight;
            
            if (!this.progressFill || docHeight <= winHeight) return;
            
            const scrollPercent = scrollTop / (docHeight - winHeight);
            const scrollPercentRounded = Math.max(0, Math.min(100, Math.round(scrollPercent * 100)));
            
            this.progressFill.style.width = `${scrollPercentRounded}%`;
        } catch (error) {}
    }

    destroy() {
        if (this.progressBar && this.progressBar.parentNode) {
            this.progressBar.parentNode.removeChild(this.progressBar);
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const readingProgressBar = new ReadingProgressBar();
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

    const openTerminal = () => {
        terminal.classList.add('show');
        isTerminalOpen = true;
        setTimeout(() => termInput.focus(), 200);
    };
    const closeTerminal = () => {
        terminal.classList.remove('show');
        isTerminalOpen = false;
        termInput.blur();
        stopMatrix(); 
    };

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

    const printLine = (text, type = '') => {
        const line = document.createElement('div');
        if (type) line.className = `terminal-text-${type}`;
        line.innerHTML = text; 
        termOutput.appendChild(line);
        termOutput.parentNode.scrollTop = termOutput.parentNode.scrollHeight;
    };

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

    let matrixInterval;
    const startMatrix = () => {
        if (matrixCanvas.classList.contains('active')) return;
        matrixCanvas.classList.add('active');
        const ctx = matrixCanvas.getContext('2d');
        matrixCanvas.width = terminal.offsetWidth;
        matrixCanvas.height = terminal.offsetHeight;

        const chars = '01'; 
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
// 🌟 极客引擎：鼠标探照灯坐标实时同步
// ==========================================
document.addEventListener('mousemove', (e) => {
    if (document.documentElement.getAttribute('data-theme') !== 'dark') return;
    
    const spotlight = document.getElementById('mouse-spotlight');
    if (!spotlight) return;

    window.requestAnimationFrame(() => {
        spotlight.style.left = e.clientX + 'px';
        spotlight.style.top = e.clientY + 'px';
    });
});

document.addEventListener('mouseleave', () => {
    const spotlight = document.getElementById('mouse-spotlight');
    if (spotlight) spotlight.classList.add('is-hidden');
});

document.addEventListener('mouseenter', () => {
    const spotlight = document.getElementById('mouse-spotlight');
    if (spotlight) spotlight.classList.remove('is-hidden');
});

// ==========================================
// 🌟 极客引擎：沉浸式划词菜单 & 持久化荧光笔 (右键精准唤醒版)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const tooltip = document.createElement('div');
    tooltip.className = 'geek-selection-tooltip';
    tooltip.innerHTML = `
        <button id="st-highlight" title="永久高亮"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg> 高亮</button>
        <div class="st-divider"></div>
        <button id="st-copy"><i data-feather="copy"></i> 复制金句</button>
        <div class="st-divider"></div>
        <button id="st-share"><i data-feather="twitter"></i> 分享至 X</button>
    `;
    document.body.appendChild(tooltip);
    if(typeof feather !== 'undefined') feather.replace();

    let selectedText = '';
    const contentBox = document.querySelector('.markdown-content');
    const pathKey = 'geek_hl_' + window.location.pathname.replace(/\/$/, '');

    // 🌟 核心算力 1：无视 DOM 撕裂的终极映射渲染器
    const renderHighlight = (text, hlId) => {
        if (!contentBox) return false;
        
        const walk = document.createTreeWalker(contentBox, NodeFilter.SHOW_TEXT, null, false);
        let strippedText = "";
        const charMap = [];
        const textNodes = [];
        let currentIndex = 0;
        let n;
        
        while (n = walk.nextNode()) {
            const parent = n.parentNode;
            const parentTag = parent.tagName.toLowerCase();
            
            if (['code', 'pre', 'script', 'style'].includes(parentTag)) {
                 currentIndex++; 
                 continue;
            }
            
            const val = n.nodeValue;
            textNodes.push({ 
                node: n, 
                start: currentIndex, 
                end: currentIndex + val.length,
                isHighlighted: parent.classList.contains('geek-highlight') 
            });
            
            for(let i = 0; i < val.length; i++) {
                if (!/\s/.test(val[i])) { 
                    charMap.push(currentIndex + i);
                    strippedText += val[i];
                }
            }
            currentIndex += val.length;
        }

        const strippedSearch = text.replace(/\s+/g, '');
        if (strippedSearch.length < 2) return false;

        let matchIndex = -1;
        let searchStart = 0;
        let startOriginal, endOriginal;
        let foundValidMatch = false;

        while ((matchIndex = strippedText.indexOf(strippedSearch, searchStart)) !== -1) {
            startOriginal = charMap[matchIndex];
            endOriginal = charMap[matchIndex + strippedSearch.length - 1] + 1;
            
            const overlapsHighlight = textNodes.some(info => 
                info.isHighlighted && info.end > startOriginal && info.start < endOriginal
            );
            
            if (!overlapsHighlight) {
                foundValidMatch = true;
                break;
            }
            searchStart = matchIndex + 1;
        }

        if (!foundValidMatch) return false;

        const nodesToWrap = textNodes.filter(info => info.end > startOriginal && info.start < endOriginal);
        if (nodesToWrap.length === 0) return false;

        for (let i = nodesToWrap.length - 1; i >= 0; i--) {
            const info = nodesToWrap[i];
            const relStart = Math.max(0, startOriginal - info.start);
            const relEnd = Math.min(info.node.nodeValue.length, endOriginal - info.start);
            
            const before = info.node.nodeValue.substring(0, relStart);
            const match = info.node.nodeValue.substring(relStart, relEnd);
            const after = info.node.nodeValue.substring(relEnd);
            
            const fragment = document.createDocumentFragment();
            if (before) fragment.appendChild(document.createTextNode(before));
            
            if (match) {
                const mark = document.createElement('mark');
                mark.className = 'geek-highlight';
                mark.setAttribute('data-hl-id', hlId); 
                mark.textContent = match;
                fragment.appendChild(mark);
            }
            
            if (after) fragment.appendChild(document.createTextNode(after));
            info.node.parentNode.replaceChild(fragment, info.node);
        }
        return true;
    };

    // 🌟 核心算力 2：页面加载时瞬间恢复前世记忆
    if (contentBox) {
        let savedHighlights = JSON.parse(localStorage.getItem(pathKey) || '[]');
        savedHighlights.forEach(hl => renderHighlight(hl.text, hl.id));

        contentBox.addEventListener('click', (e) => {
            const mark = e.target.closest('mark.geek-highlight');
            if (mark) {
                if (confirm('是否清除这段高亮笔记？')) {
                    const hlId = mark.getAttribute('data-hl-id');
                    let hls = JSON.parse(localStorage.getItem(pathKey) || '[]');
                    hls = hls.filter(h => h.id !== hlId);
                    localStorage.setItem(pathKey, JSON.stringify(hls));
                    
                    document.querySelectorAll(`mark.geek-highlight[data-hl-id="${hlId}"]`).forEach(m => {
                        m.replaceWith(document.createTextNode(m.textContent));
                    });
                    
                    contentBox.normalize(); 
                }
            }
        });
    }

    // 🌟 核心重构：监听鼠标右键 (contextmenu)，而非自动弹出
    document.addEventListener('contextmenu', (e) => {
        // 如果右键点击了菜单本身，防止原生菜单弹出
        if (tooltip.contains(e.target)) {
            e.preventDefault();
            return;
        }

        const selection = window.getSelection();
        selectedText = selection.toString().trim();

        let isInsidePost = false;
        if (selection.rangeCount > 0) {
            let container = selection.getRangeAt(0).commonAncestorContainer;
            if (container.nodeType === 3) container = container.parentNode; 
            
            if (container && typeof container.closest === 'function' && container.closest('.markdown-content')) {
                isInsidePost = true;
            }
        }

        const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
        
        // 只有在选中文本，且在文章内右键时，才拦截原生菜单并呼出极客菜单
        if (selectedText.length > 0 && isInsidePost && activeTag !== 'input' && activeTag !== 'textarea') {
            e.preventDefault(); 
            
            tooltip.style.display = 'flex';
            void tooltip.offsetWidth; 

            const tooltipWidth = tooltip.offsetWidth;
            const tooltipHeight = tooltip.offsetHeight;
            
            // 🌟 精准降维：菜单直接悬浮在你右键点击的坐标上方
            let top = e.clientY + window.scrollY - tooltipHeight - 12; 
            let left = e.clientX + window.scrollX - (tooltipWidth / 2);
            
            if (top < window.scrollY) {
                top = e.clientY + window.scrollY + 12;
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
            // 如果没选中文本，或者在非文章区域右键，正常呼出浏览器原生右键菜单
            tooltip.classList.remove('show');
            setTimeout(() => { if(!tooltip.classList.contains('show')) tooltip.style.display = 'none'; }, 200); 
        }
    });

    // 🌟 辅助逻辑：左键点击页面任意空白处，隐匿菜单
    document.addEventListener('mousedown', (e) => {
        // 忽略右键点击（交由上面的 contextmenu 逻辑处理）
        if (e.button === 2) return; 
        
        if (!tooltip.contains(e.target) && tooltip.classList.contains('show')) {
            tooltip.classList.remove('show');
            setTimeout(() => { tooltip.style.display = 'none'; }, 200);
        }
    });

    // 交互绑定 1：跨节点永久高亮逻辑
    document.getElementById('st-highlight').addEventListener('click', (e) => {
        e.stopPropagation();

        if (selectedText.length < 2) {
            window.showDynamicIsland(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> <span>选中的文本太短啦</span>`, 'error');
            return;
        }

        const hlId = 'hl_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
        const success = renderHighlight(selectedText, hlId);
        
        if (success) {
            let hls = JSON.parse(localStorage.getItem(pathKey) || '[]');
            hls.push({ id: hlId, text: selectedText });
            localStorage.setItem(pathKey, JSON.stringify(hls));
            
            window.showDynamicIsland(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg> <span>已永久高亮并保存至本地</span>`, 'success');
        } else {
            window.showDynamicIsland(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg> <span>这段区域已被标记或无法解析</span>`, 'error');
        }

        window.getSelection().removeAllRanges();
        tooltip.classList.remove('show');
        setTimeout(() => { tooltip.style.display = 'none'; }, 200);
    });

    // 交互绑定 2：优雅地复制
    document.getElementById('st-copy').addEventListener('click', () => {
        navigator.clipboard.writeText(selectedText).then(() => {
            window.showDynamicIsland(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> <span>复制成功</span>`, 'success');
            window.getSelection().removeAllRanges(); 
            tooltip.classList.remove('show');
        });
    });

    // 交互绑定 3：分享至 X
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
    const cardSelectors = '.related-post-card, .career-item-card, .music-track, .portfolio-item';
    const cards = document.querySelectorAll(cardSelectors);

    cards.forEach(card => {
        card.classList.add('tilt-card');

        if (!card.querySelector('.tilt-card-glare')) {
            const glare = document.createElement('div');
            glare.className = 'tilt-card-glare';
            card.appendChild(glare);
        }

        let ticking = false;

        card.addEventListener('mousemove', (e) => {
            card.classList.remove('tilt-reset');

            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const rect = card.getBoundingClientRect();
                    const width = rect.width;
                    const height = rect.height;
                    
                    const mouseX = e.clientX - rect.left;
                    const mouseY = e.clientY - rect.top;
                    
                    const xPct = (mouseX / width) - 0.5;
                    const yPct = (mouseY / height) - 0.5;

                    const maxTilt = 10;
                    const rotateX = (-yPct * maxTilt).toFixed(2); 
                    const rotateY = (xPct * maxTilt).toFixed(2);  

                    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;

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
            card.classList.add('tilt-reset');
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        });
    });
});

// ==========================================
// 🌟 极客引擎：视频链接自动解析与懒加载 (Auto Video Embed)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const links = document.querySelectorAll('.markdown-content a');

    links.forEach(link => {
        try {
            const url = link.getAttribute('href') || '';
            if (!url) return;
            
            let wrapper = null;

            const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
            if (ytMatch) {
                const videoId = ytMatch[1];
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
            else {
                const biliMatch = url.match(/bilibili\.com\/video\/(BV[a-zA-Z0-9]+)/i);
                if (biliMatch) {
                    const bvid = biliMatch[1];
                    wrapper = document.createElement('div');
                    wrapper.className = 'geek-video-wrapper';
                    wrapper.innerHTML = `<iframe src="//player.bilibili.com/player.html?bvid=${bvid}&page=1&high_quality=1&danmaku=0" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>`;
                }
            }

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

// ==========================================
// 🌟 极客引擎：年度创作热力图 (异步 API 版)
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
    const heatmapContainer = document.getElementById('geek-heatmap');
    if (!heatmapContainer) return;

    try {
        // 瞬间从 API 接口拉取全站数据
        const res = await fetch('/api/geek-data.json');
        const posts = await res.json();

        const postCounts = {};
        posts.forEach(post => {
            if (post.date) postCounts[post.date] = (postCounts[post.date] || 0) + 1;
        });

        const today = new Date();
        const startDate = new Date();
        startDate.setDate(today.getDate() - 364);
        startDate.setDate(startDate.getDate() - startDate.getDay());

        const grid = document.createElement('div');
        grid.className = 'heatmap-grid';
        const tooltip = document.createElement('div');
        tooltip.className = 'heatmap-tooltip';
        document.body.appendChild(tooltip);

        let currentDate = new Date(startDate);
        const endDate = new Date(today);
        
        while (currentDate <= endDate) {
            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
            const count = postCounts[dateStr] || 0;

            const cell = document.createElement('div');
            cell.className = 'heatmap-cell';
            cell.setAttribute('data-level', count > 3 ? '4' : count.toString());

            cell.addEventListener('mouseenter', (e) => {
                const rect = cell.getBoundingClientRect();
                const text = count > 0 ? `<strong style="color:var(--primary-color);">${count} 篇</strong> 文章` : '暂无更新';
                tooltip.innerHTML = `${text} <span style="color:#888; margin-left:4px;">(${dateStr})</span>`;
                tooltip.style.display = 'block';
                tooltip.classList.add('show');
                tooltip.style.top = (rect.top + window.scrollY - 35) + 'px';
                tooltip.style.left = (rect.left + window.scrollX - (tooltip.offsetWidth / 2) + 6) + 'px';
            });
            cell.addEventListener('mouseleave', () => tooltip.classList.remove('show'));

            grid.appendChild(cell);
            currentDate.setDate(currentDate.getDate() + 1);
        }

        heatmapContainer.appendChild(grid);
        if(typeof feather !== 'undefined') feather.replace(heatmapContainer);
    } catch (e) {
        console.warn('热力图数据加载失败:', e);
    }
});

// ==========================================
// 🌟 极客引擎：Obsidian 级知识星图 (异步 API 版)
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
    const graphContainer = document.getElementById('geek-knowledge-graph');
    if (!graphContainer || typeof ForceGraph === 'undefined') return;

    try {
        const res = await fetch('/api/geek-data.json');
        const posts = await res.json();

        // 纯前端动态织网计算
        const graphData = { nodes: [], links: [] };
        const nodeSet = new Set();
        
        const addNode = (id, name, val, color, url) => {
            if (!nodeSet.has(id)) {
                nodeSet.add(id);
                graphData.nodes.push({ id, name, val, color, url });
            }
        };
        const addLink = (source, target) => graphData.links.push({ source, target });

        // 中心点
        addNode('root', '知识宇宙', 25, '#007AFF', null);

        posts.forEach(post => {
            addNode(post.url, post.title, 8, '#E5E5EA', post.url);

            post.categories.forEach(cat => {
                addNode(`cat_${cat}`, cat, 16, '#FF9500', null);
                addLink('root', `cat_${cat}`);
                addLink(`cat_${cat}`, post.url);
            });

            post.tags.forEach(tag => {
                addNode(`tag_${tag}`, `#${tag}`, 12, '#34C759', null);
                if (post.categories.length > 0) addLink(`cat_${post.categories[0]}`, `tag_${tag}`);
                else addLink('root', `tag_${tag}`);
                addLink(`tag_${tag}`, post.url);
            });

            if (post.categories.length === 0 && post.tags.length === 0) {
                addLink('root', post.url);
            }
        });

        // 加载物理引擎
        const Graph = ForceGraph()(graphContainer)
            .graphData(graphData)
            .nodeId('id').nodeVal('val').nodeLabel('name').nodeColor('color')
            .linkColor(() => document.documentElement.getAttribute('data-theme') === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)')
            .linkWidth(1)
            .onNodeHover(node => graphContainer.style.cursor = node ? 'pointer' : 'grab')
            .onNodeClick(node => {
                if (node.url) window.location.href = node.url;
                else { Graph.centerAt(node.x, node.y, 1000); Graph.zoom(3, 1500); }
            })
            .onNodeDragEnd(node => { node.fx = node.x; node.fy = node.y; })
            .enableZoomInteraction(false)
            .enablePanInteraction(true);

        Graph.d3Force('charge').strength(-150);
        Graph.d3Force('link').distance(50);

        const zoomInBtn = document.getElementById('graph-zoom-in');
        const zoomOutBtn = document.getElementById('graph-zoom-out');
        const resetBtn = document.getElementById('graph-reset');

        if (zoomInBtn) zoomInBtn.addEventListener('click', () => Graph.zoom(Graph.zoom() * 1.4, 400));
        if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => Graph.zoom(Graph.zoom() / 1.4, 400));
        if (resetBtn) resetBtn.addEventListener('click', () => Graph.zoomToFit(800, 20));

        const resizeObserver = new ResizeObserver(() => {
            Graph.width(graphContainer.clientWidth);
            Graph.height(graphContainer.clientHeight);
        });
        resizeObserver.observe(graphContainer);
        
        setTimeout(() => Graph.zoom(0.8, 1000), 500);
    } catch (e) {
        console.warn('知识星图数据加载失败:', e);
    }
});

// ==========================================
// 🌟 极客引擎：异步海报渲染与下载 (已接入灵动岛)
// ==========================================
window.generateGeekPoster = async function(btn) {
    btn.style.pointerEvents = 'none'; // 锁死按钮，防止连点

    // 1. 呼叫灵动岛：加载状态 (持久显示，传入 duration: 0)
    window.showDynamicIsland(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spin-anim"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg> <span>正在渲染极客海报...</span>`, 'loading', 0);

    const loadScript = (src) => {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) return resolve();
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.body.appendChild(script);
        });
    };

    try {
        await Promise.all([
            loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'),
            loadScript('https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js')
        ]);

        const qrContainer = document.getElementById('poster-qrcode');
        if (qrContainer.innerHTML === '') {
            new QRCode(qrContainer, {
                text: window.location.href, width: 90, height: 90,
                colorDark : "#000000", colorLight : "#ffffff", correctLevel : QRCode.CorrectLevel.H
            });
        }

        await new Promise(r => setTimeout(r, 300));

        const posterDOM = document.getElementById('geek-poster-template');
        const canvas = await html2canvas(posterDOM, { scale: 2, useCORS: true, backgroundColor: '#0d1117' });

        const link = document.createElement('a');
        link.download = `极客海报-${document.title.split('|')[0].trim()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();

        // 2. 呼叫灵动岛：成功状态，2.5秒后自动缩回
        window.showDynamicIsland(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> <span>海报生成完毕，已触发下载</span>`, 'success');
        
    } catch (e) {
        console.error('海报生成失败:', e);
        // 3. 呼叫灵动岛：错误状态
        window.showDynamicIsland(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> <span>海报渲染失败，请重试</span>`, 'error');
    } finally {
        btn.style.pointerEvents = 'auto'; // 恢复按钮
    }
};

// ==========================================
// 🌟 极客引擎：神经科学级仿生阅读 (Bionic Reading)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const bionicBtn = document.getElementById('bionic-trigger');
    const content = document.querySelector('.markdown-content');
    
    // 只在含有文章正文 (.markdown-content) 的页面显示该按钮
    if (bionicBtn && content) {
        bionicBtn.style.display = 'flex';
        if (typeof feather !== 'undefined') feather.replace();

        let isParsed = false;
        
        // 防御性 XSS 与 HTML 标签断裂处理
        const escapeHtml = (unsafe) => {
            return unsafe
                 .replace(/&/g, "&amp;")
                 .replace(/</g, "&lt;")
                 .replace(/>/g, "&gt;")
                 .replace(/"/g, "&quot;")
                 .replace(/'/g, "&#039;");
        };

        bionicBtn.addEventListener('click', () => {
            // 如果是该页面第一次开启，触发算力解析全网文
            if (!isParsed) {
                const originIcon = bionicBtn.innerHTML;
                // 开启转圈加载动效
                bionicBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin-anim"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>`;
                
                // 异步延时触发，保证 Loading 动画能渲染出来
                setTimeout(() => {
                    // TreeWalker 绝对安全的文本节点遍历，只提取纯文字！
                    const walk = document.createTreeWalker(content, NodeFilter.SHOW_TEXT, null, false);
                    const nodes = [];
                    let node;
                    while (node = walk.nextNode()) {
                        const parentTag = node.parentNode.tagName.toLowerCase();
                        // 智能跳过代码块、加粗字和斜体字，保持极客原本排版
                        if (['code', 'pre', 'script', 'style', 'strong', 'b', 'em', 'i'].includes(parentTag)) continue;
                        if (node.nodeValue.trim() === '') continue;
                        nodes.push(node);
                    }

                    nodes.forEach(n => {
                        const wrapper = document.createElement('span');
                        wrapper.className = 'bio-wrapper'; // 使用 display:contents 隐身
                        let text = escapeHtml(n.nodeValue);
                        
                        // 1. 英文算力：前半截加粗，后半截变淡
                        let html = text.replace(/[a-zA-Z0-9À-ÿ]+/g, (word) => {
                            let mid = Math.ceil(word.length / 2);
                            return `<b class="bio-b">${word.slice(0, mid)}</b><span class="bio-d">${word.slice(mid)}</span>`;
                        });

                        // 2. 中文算力：利用交替加粗法，在长句中生成大脑落脚点 (锚点)
                        let isBold = true;
                        html = html.replace(/[\u4e00-\u9fa5]/g, (char) => {
                            let res = isBold ? `<b class="bio-b">${char}</b>` : `<span class="bio-d">${char}</span>`;
                            isBold = !isBold;
                            return res;
                        });

                        wrapper.innerHTML = html;
                        n.parentNode.replaceChild(wrapper, n);
                    });
                    
                    isParsed = true;
                    
                    // 还原图标，执行瞬间切换渲染
                    bionicBtn.innerHTML = originIcon;
                    content.classList.add('is-bionic');
                    bionicBtn.classList.add('active');
                }, 50); 
            } else {
                // 如果已经解析过，直接 0ms 瞬间切换 CSS 渲染！
                content.classList.toggle('is-bionic');
                bionicBtn.classList.toggle('active');
            }
        });
    }
});

// ==========================================
// 🌟 极客中枢：灵动岛引擎 (Dynamic Island API)
// ==========================================
let diTimeout;
window.showDynamicIsland = function(html, type = 'success', duration = 2500) {
    let island = document.getElementById('dynamic-island');
    // 如果页面还没有灵动岛，凭空捏造一个插入 DOM
    if (!island) {
        island = document.createElement('div');
        island.id = 'dynamic-island';
        island.className = 'dynamic-island';
        island.innerHTML = '<div class="di-content" id="di-content"></div>';
        document.body.appendChild(island);
    }
    
    const content = document.getElementById('di-content');
    content.className = `di-content di-${type}`;
    content.innerHTML = html;
    
    // 强制浏览器重绘，保证无论何时调用都能触发动画
    void island.offsetWidth;
    island.classList.add('active');
    
    clearTimeout(diTimeout);
    // 如果 duration 为 0，则灵动岛将持续显示（例如正在加载中）
    if (duration > 0) {
        diTimeout = setTimeout(() => {
            island.classList.remove('active');
        }, duration);
    }
};

// ==========================================
// 🌟 极客引擎：Live Status 实时生命体征映射
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const statusText = document.getElementById('status-text');
    const statusIndicator = document.querySelector('.status-indicator');
    
    // 如果不在首页（找不到元素），则静默退出
    if (!statusText || !statusIndicator) return;

    // 极客状态库：你可以随时在这里修改你的日常状态！
    const statuses = [
        { text: "Listening to Apple Music", colorClass: "music" },    // 迷幻紫
        { text: "System Online & Running", colorClass: "" },          // 默认绿色
        { text: "Coding in VS Code", colorClass: "coding" },          // 科技蓝
        { text: "Reading technical passages", colorClass: "reading" },    // 专注橙
        { text: "Compiling thoughts...", colorClass: "coding" }       // 科技蓝
    ];

    let currentIndex = 0;

    const updateStatus = () => {
        // 1. 触发淡出
        statusText.classList.add('fade');
        
        // 2. 在完全透明时，瞬间替换数据
        setTimeout(() => {
            currentIndex = (currentIndex + 1) % statuses.length;
            const status = statuses[currentIndex];
            
            // 切换文字和呼吸灯的颜色类名
            statusText.innerHTML = status.text;
            statusIndicator.className = `status-indicator ${status.colorClass}`;
            
            // 3. 触发淡入
            statusText.classList.remove('fade');
        }, 400); // 400ms 是配合 CSS 中的 opacity 过渡时间
    };

    // 页面刚加载时，0ms 瞬间显示第一个状态
    statusText.innerHTML = statuses[0].text;
    statusIndicator.className = `status-indicator ${statuses[0].colorClass}`;
    
    // 启动心跳引擎：每 8h 轮询一次状态
    setInterval(updateStatus, 28800000);
});

// ==========================================
// 🌟 极客彩蛋：Konami 秘籍与 DOM 重力坍缩引擎
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // 经典的 Konami 秘籍指令：上 上 下 下 左 右 左 右 B A
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let konamiIndex = 0;
    let isGravityTriggered = false;

    // 隐形键盘监听器
    document.addEventListener('keydown', (e) => {
        if (isGravityTriggered) return;
        
        // 忽略大小写进行匹配
        if (e.key.toLowerCase() === konamiCode[konamiIndex].toLowerCase()) {
            konamiIndex++;
            if (konamiIndex === konamiCode.length) {
                isGravityTriggered = true;
                triggerGravityCollapse();
            }
        } else {
            konamiIndex = 0; // 一旦输错，重新开始记录
        }
    });

    async function triggerGravityCollapse() {
        // 1. 联动灵动岛，发出最高级别系统警告
        if (window.showDynamicIsland) {
            window.showDynamicIsland(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg> <span style="color:#FF453A; font-weight:bold;">系统警告：重力发生器已关闭，物理引擎接管中...</span>`, 'error', 4000);
        }

        // 2. 动态注入强大的 Matter.js 2D物理引擎 (不影响网页平时加载速度)
        const loadScript = (src) => new Promise((resolve) => {
            const s = document.createElement('script');
            s.src = src;
            s.onload = resolve;
            document.body.appendChild(s);
        });
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js');

        // 3. 初始化物理世界
        const { Engine, Render, Runner, Bodies, Composite, Mouse, MouseConstraint } = Matter;
        const engine = Engine.create();
        const world = engine.world;

        // 锁定屏幕滚动，将其变成一个密闭的物理沙盒
        document.body.style.overflow = 'hidden';
        const width = window.innerWidth;
        const height = window.innerHeight;

        // 创建世界边界 (隐形的不可穿透的墙壁和地板)
        const ground = Bodies.rectangle(width / 2, height + 50, width * 2, 100, { isStatic: true });
        const leftWall = Bodies.rectangle(-50, height / 2, 100, height * 2, { isStatic: true });
        const rightWall = Bodies.rectangle(width + 50, height / 2, 100, height * 2, { isStatic: true });
        const ceiling = Bodies.rectangle(width / 2, -500, width * 2, 100, { isStatic: true });
        Composite.add(world, [ground, leftWall, rightWall, ceiling]);

        // 4. 抓取页面上当前可见的核心元素，赋予物理质量
        const elements = Array.from(document.querySelectorAll('h1, h2, h3, p, img, .button, .navbar, .social-links a, .post-item-hux, .music-track, .career-item-card, .portfolio-item, .tech-stack-table, .tag-pill'))
            .filter(el => {
                const rect = el.getBoundingClientRect();
                // 只抓取在当前视口内可见的元素，防止把屏幕外的元素也拉进来
                return rect.width > 0 && rect.height > 0 && rect.top >= 0 && rect.bottom <= height;
            });

        const domBodies = [];

        // 将 DOM 元素强制剥离普通文档流，并套上物理引擎的碰撞盒 (Hitbox)
        elements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;

            const body = Bodies.rectangle(x, y, rect.width, rect.height, {
                restitution: 0.6, // 弹性 (Q弹感)
                friction: 0.1,    // 摩擦力
                density: 0.005    // 密度
            });

            domBodies.push({ body, elem: el, width: rect.width, height: rect.height });
            Composite.add(world, body);

            // 用 CSS 绝对定位接管元素
            el.style.position = 'fixed';
            el.style.top = '0px';
            el.style.left = '0px';
            el.style.width = rect.width + 'px';
            el.style.height = rect.height + 'px';
            el.style.margin = '0';
            el.style.zIndex = '99999';
            el.style.transition = 'none'; // 必须关闭 CSS 过渡，否则物理引擎会卡顿
            el.style.boxSizing = 'border-box';
        });

        // 5. 注入鼠标“上帝之手”拖拽互动
        const mouse = Mouse.create(document.body);
        const mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: { stiffness: 0.2, render: { visible: false } }
        });
        Composite.add(world, mouseConstraint);

        // 6. 开启 60fps 渲染循环，同步 DOM 与 物理引擎的坐标和旋转角度
        Matter.Events.on(engine, 'afterUpdate', () => {
            domBodies.forEach(({ body, elem, width, height }) => {
                const x = body.position.x - width / 2;
                const y = body.position.y - height / 2;
                elem.style.transform = `translate(${x}px, ${y}px) rotate(${body.angle}rad)`;
            });
        });

        // 引擎点火！
        Runner.run(Runner.create(), engine);
    }
});

// ==========================================
// 🌟 极客引擎：盘古之白 (Pangu DOM Linter) 自动排版引擎
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const content = document.querySelector('.markdown-content');
    if (!content) return; // 只在包含文章正文的页面启动

    // 核心算力：盘古正则表达式 (匹配中文与英文/数字的交界处)
    // [\u4e00-\u9fa5] 代表所有中文字符
    // [a-zA-Z0-9] 代表英文字母和数字
    const panguRegex1 = /([\u4e00-\u9fa5])([a-zA-Z0-9])/g; // 中文紧接英文/数字
    const panguRegex2 = /([a-zA-Z0-9])([\u4e00-\u9fa5])/g; // 英文/数字紧接中文

    // 使用 TreeWalker 进行最安全的底层 DOM 遍历，只抓取纯文本节点
    const walk = document.createTreeWalker(content, NodeFilter.SHOW_TEXT, null, false);
    let node;
    const nodesToFormat = [];

    // 第一遍：收集所有需要处理的文本节点，避开代码块等特殊标签
    while (node = walk.nextNode()) {
        const parentTag = node.parentNode.tagName.toLowerCase();
        
        // 🌟 极客防御：绝对不碰代码块、公式、按键提示和已经格式化过的区域
        if (['code', 'pre', 'script', 'style', 'kbd', 'math'].includes(parentTag)) {
            continue;
        }

        // 剔除纯粹的空白节点，只留下有实质内容的文本
        if (node.nodeValue.trim() !== '') {
            nodesToFormat.push(node);
        }
    }

    // 第二遍：微创手术，替换文本，注入完美的半角空格
    nodesToFormat.forEach(n => {
        let text = n.nodeValue;
        
        // 执行双向正则匹配与替换
        let formattedText = text
            .replace(panguRegex1, '$1 $2')
            .replace(panguRegex2, '$1 $2');
        
        // 只有当文本确实发生改变时，才重写 DOM，极其节省算力
        if (text !== formattedText) {
            n.nodeValue = formattedText;
        }
    });

    console.log("✨ [Geek Engine] 盘古之白排版引擎执行完毕：强迫症已被治愈。");
});

// ==========================================
// 🌟 极客引擎：阅读里程碑神经反馈 (Dynamic Island Milestones)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const content = document.querySelector('.markdown-content');
    // 只有在存在文章正文的页面才启动该引擎
    if (!content) return;

    // 核心算力：提取文章纯文字长度，计算预计阅读时间 (按极客阅读速度 300字/分钟)
    const textContent = content.innerText || content.textContent;
    // 过滤掉空白字符，计算真实的硬核字数
    const wordCount = textContent.replace(/\s+/g, '').length;
    const readTime = Math.max(1, Math.ceil(wordCount / 300));

    // 神经元状态锁：确保每个阶段终生只触发一次，绝对克制，绝不频繁打扰
    const milestones = {
        start: false,
        half: false,
        end: false
    };

    // 接入全局滚动总线
    window.addEventListener('scroll', () => {
        // 确保灵动岛核心 API 存在
        if (typeof window.showDynamicIsland !== 'function') return;

        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight;
        const winHeight = window.innerHeight;
        const scrollableDistance = docHeight - winHeight;
        
        // 如果文章太短 (不需要滚动)，直接静默，不启动打扰
        if (scrollableDistance <= 0) return;

        const scrollPercent = scrollTop / scrollableDistance;

        // 1. 启程：向下滚动 5% 时，极其克制地提示预计时间
        if (scrollPercent > 0.05 && !milestones.start) {
            milestones.start = true;
            window.showDynamicIsland(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> <span>全长 ${wordCount} 字，预计阅读 ${readTime} 分钟</span>`, 'success', 2500);
        }

        // 2. 破局：阅读进度过半 (50%)
        if (scrollPercent > 0.50 && !milestones.half) {
            milestones.half = true;
            window.showDynamicIsland(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> <span>进度 50%：保持专注</span>`, 'success', 2500);
        }

        // 3. 终局：到达底部 (95%)
        if (scrollPercent > 0.95 && !milestones.end) {
            milestones.end = true;
            // 终局提示用略长一点的时间 (3.5秒)，给予正向情绪反馈
            window.showDynamicIsland(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg> <span>阅读达成！你刚刚吸收了 ${wordCount} 字的内容</span>`, 'success', 3500);
        }
    }, { passive: true });
});

