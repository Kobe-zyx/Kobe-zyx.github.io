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
    document.querySelectorAll('a[href="timeline.html"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            document.body.classList.add('fade-out');
            setTimeout(() => {
                window.location.href = 'timeline.html';
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



// 图片查看器逻辑
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('.markdown-content img');
    if (images.length > 0) {
        // 创建模态框背景层
        const imageViewer = document.createElement('div');
        imageViewer.className = 'image-viewer';
        document.body.appendChild(imageViewer);

        // 创建右上角计数器
        const counter = document.createElement('span');
        counter.className = 'viewer-counter';
        imageViewer.appendChild(counter);

        // 创建关闭按钮
        const closeBtn = document.createElement('button');
        closeBtn.className = 'close-btn';
        closeBtn.innerHTML = '&times;';
        imageViewer.appendChild(closeBtn);

        // 创建左右翻页按钮
        const prevBtn = document.createElement('button');
        prevBtn.className = 'prev-btn';
        prevBtn.innerHTML = '&lt;';
        imageViewer.appendChild(prevBtn);

        const nextBtn = document.createElement('button');
        nextBtn.className = 'next-btn';
        nextBtn.innerHTML = '&gt;';
        imageViewer.appendChild(nextBtn);

        // 🌟 核心修改：创建内部内容包裹层，用于实现缩放动效
        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'image-viewer-content';
        imageViewer.appendChild(contentWrapper);

        const viewerImg = document.createElement('img');
        contentWrapper.appendChild(viewerImg);

        let currentIndex = 0;

        // 更新按钮禁用状态
        const updateNavButtons = () => {
            if (images.length <= 1) {
                prevBtn.classList.add('disabled');
                nextBtn.classList.add('disabled');
            } else {
                prevBtn.classList.remove('disabled');
                nextBtn.classList.remove('disabled');
                if (currentIndex === 0) prevBtn.classList.add('disabled');
                if (currentIndex === images.length - 1) nextBtn.classList.add('disabled');
            }
        };

        // 打开/切换图片
        const showImage = (index) => {
            if (index >= 0 && index < images.length) {
                currentIndex = index;
                viewerImg.src = images[currentIndex].src;
                counter.textContent = `${currentIndex + 1} / ${images.length}`;
                updateNavButtons();
                imageViewer.classList.add('show');
                document.body.classList.add('body-no-scroll');
            }
        };

        // 🌟 关闭图片（CSS中的 visibility 会自动处理 0.3s 的延时淡出，无需 setTimeout）
        const hideImage = () => {
            imageViewer.classList.remove('show');
            document.body.classList.remove('body-no-scroll');
        };

        images.forEach((img, index) => {
            img.style.cursor = 'pointer';
            img.addEventListener('click', () => {
                showImage(index);
            });
        });

        closeBtn.addEventListener('click', hideImage);
        
        // 点击背景区域关闭
        imageViewer.addEventListener('click', (e) => {
            if (e.target === imageViewer || e.target === contentWrapper) {
                hideImage();
            }
        });

        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showImage(currentIndex - 1);
        });

        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showImage(currentIndex + 1);
        });

        // 键盘操作：左右切换与 Esc 关闭
        document.addEventListener('keydown', (e) => {
            if (imageViewer.classList.contains('show')) {
                if (e.key === 'Escape') {
                    hideImage();
                }
                if (e.key === 'ArrowLeft' && currentIndex > 0) {
                    showImage(currentIndex - 1);
                }
                if (e.key === 'ArrowRight' && currentIndex < images.length - 1) {
                    showImage(currentIndex + 1);
                }
            }
        });

        // 🌟 新增：鼠标滚轮切换图片功能
        imageViewer.addEventListener('wheel', function (e) {
            if (imageViewer.classList.contains('show')) {
                e.preventDefault();
                if (e.deltaY > 0 && currentIndex < images.length - 1) {
                    showImage(currentIndex + 1);
                } else if (e.deltaY <= 0 && currentIndex > 0) {
                    showImage(currentIndex - 1);
                }
            }
        }, { passive: false });
    }
});

// 目录折叠/展开逻辑
document.addEventListener('DOMContentLoaded', function() {
    let currentlyOpenSubmenu = null; // 用于跟踪当前展开的子菜单

    document.querySelectorAll('.toc-main-item').forEach(item => {
        const mainLink = item.querySelector('a[href^="#"]');

        if (mainLink) {
            mainLink.addEventListener('click', event => {
                const submenu = item.querySelector('.submenu'); // 获取子菜单，如果没有则为 null

                if (submenu) {
                    if (submenu.style.display === 'block') {
                        // 如果点击的子菜单已经展开，则不做任何操作（它保持展开，锚点跳转会发生）
                    } else {
                        // 如果点击的子菜单是关闭的
                        // 折叠任何当前展开的子菜单，如果它存在且与当前点击的不同
                        if (currentlyOpenSubmenu && currentlyOpenSubmenu !== submenu) {
                            currentlyOpenSubmenu.style.display = 'none';
                        }
                        // 展开当前点击的子菜单
                        submenu.style.display = 'block';
                        // 更新当前展开的子菜单
                        currentlyOpenSubmenu = submenu;
                    }
                } else {
                    // 如果当前点击的项没有子菜单，则只折叠其他已展开的子菜单
                    if (currentlyOpenSubmenu) {
                        currentlyOpenSubmenu.style.display = 'none';
                        currentlyOpenSubmenu = null; // 重置为 null，因为没有子菜单被展开
                    }
                }
                // 锚点导航会自动发生，因为没有调用 preventDefault
            });
        }
    });
});