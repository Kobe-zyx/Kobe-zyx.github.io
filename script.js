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
// 🌟 极客引擎：沉浸式划词菜单 (Text Selection Tooltip)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
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

    document.addEventListener('contextmenu', (e) => {
        if (tooltip.classList.contains('show')) {
            tooltip.classList.remove('show');
            setTimeout(() => { tooltip.style.display = 'none'; }, 200);
            return; 
        }

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
            if (container.closest('.markdown-content')) {
                isInsidePost = true;
            }
        }

        const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
        
        if (selectedText.length > 0 && isInsidePost && activeTag !== 'input' && activeTag !== 'textarea') {
            e.preventDefault(); 
            
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect(); 
            
            tooltip.style.display = 'flex';
            void tooltip.offsetWidth; 

            const tooltipWidth = tooltip.offsetWidth;
            const tooltipHeight = tooltip.offsetHeight;
            
            let top = rect.top + window.scrollY - tooltipHeight - 12; 
            let left = rect.left + window.scrollX + (rect.width / 2) - (tooltipWidth / 2);
            
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
            tooltip.classList.remove('show');
            setTimeout(() => { 
                if(!tooltip.classList.contains('show')) tooltip.style.display = 'none'; 
            }, 200); 
        }
    });

    document.addEventListener('mousedown', (e) => {
        if (e.button === 2) return; 
        
        if (!tooltip.contains(e.target) && tooltip.classList.contains('show')) {
            tooltip.classList.remove('show');
            setTimeout(() => { tooltip.style.display = 'none'; }, 200);
        }
    });

    // 🌟 核心功能：优雅地复制 (性能优化版)
    document.getElementById('st-copy').addEventListener('click', () => {
        navigator.clipboard.writeText(selectedText).then(() => {
            const btn = document.getElementById('st-copy');
            const originalHtml = btn.innerHTML;
            
            btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> 复制成功`;
            btn.style.color = '#10B981';

            setTimeout(() => {
                btn.innerHTML = originalHtml;
                btn.style.color = '';
                window.getSelection().removeAllRanges(); 
                tooltip.classList.remove('show');
            }, 1500);
        });
    });

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
// 🌟 极客引擎：异步海报渲染与下载 (Poster Generator - 性能终极版)
// ==========================================
window.generateGeekPoster = async function(btn) {
    const originalHtml = btn.innerHTML; 
    
    // 1. 切换至 Loading 状态 (直接注入 Loader SVG，不再全站扫描)
    btn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spin-anim"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>`;
    btn.style.pointerEvents = 'none';

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
                text: window.location.href,
                width: 90, height: 90,
                colorDark : "#000000", colorLight : "#ffffff",
                correctLevel : QRCode.CorrectLevel.H
            });
        }

        await new Promise(r => setTimeout(r, 300));

        const posterDOM = document.getElementById('geek-poster-template');
        const canvas = await html2canvas(posterDOM, {
            scale: 2, useCORS: true, backgroundColor: '#0d1117'
        });

        const link = document.createElement('a');
        link.download = `极客海报-${document.title.split('|')[0].trim()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();

        // 6. 切换至成功状态 (直接注入 Check SVG)
        btn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
        btn.style.color = '#10B981';
        btn.style.borderColor = '#10B981';
        btn.style.background = 'rgba(16, 185, 129, 0.1)';
        
    } catch (e) {
        console.error('海报生成失败:', e);
        // 失败状态 (直接注入 X SVG)
        btn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
        btn.style.color = '#EF4444';
    } finally {
        setTimeout(() => {
            btn.innerHTML = originalHtml;
            btn.style.color = '';
            btn.style.borderColor = '';
            btn.style.background = '';
            btn.style.pointerEvents = 'auto';
        }, 3000);
    }
};