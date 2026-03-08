// ==========================================
// 极客版音乐馆引擎 (纯净原生版)
// ==========================================
class MusicHall {
    constructor() {
        this.currentAudio = null;
        this.isPlaying = false;
        this.currentTrack = null;
        this.init();
    }

    async init() {
        this.bindEvents();
        // 默认加载推荐的歌手或关键词
        await this.loadFeaturedMusic("OneDirection"); 
        this.setupAudioPlayer();
        this.restoreFromLocal();
    }

    bindEvents() {
        const searchBtn = document.getElementById('searchBtn');
        const searchInput = document.getElementById('searchInput');
        const playPauseBtn = document.getElementById('playPauseBtn');
        const closePlayerBtn = document.getElementById('closePlayerBtn');

        searchBtn.addEventListener('click', () => this.performSearch());
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.performSearch();
        });
        if(playPauseBtn) playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        if(closePlayerBtn) closePlayerBtn.addEventListener('click', () => this.hidePlayer());

        // 🌟 新增：绑定滚动与窗口调整事件，驱动底部停靠引擎
        window.addEventListener('scroll', () => this.handleScrollDocking());
        window.addEventListener('resize', () => this.handleScrollDocking());
    }

    // ==========================================
    // 🌟 极客物理碰撞与停靠引擎
    // ==========================================
    handleScrollDocking() {
        const player = document.getElementById('musicPlayer');
        // 自动抓取页面最底部的导航栏 (或者 footer) 作为碰撞参考物
        const bottomNav = document.querySelector('.bottom-nav') || document.querySelector('footer');
        
        if (!player || !bottomNav) return;

        const rect = bottomNav.getBoundingClientRect();
        // 计算底部导航栏此时“侵入”屏幕可视区域的高度
        const visibleHeight = window.innerHeight - rect.top;

        if (visibleHeight > 0) {
            // 如果底栏露出来了，就把播放器一比一向上推，实现完美的“搁置”效果
            // (这里的 +10 是为了给它一点呼吸空间，如果你想让它完全贴死，可以把 +10 删掉)
            player.style.bottom = `${visibleHeight + 10}px`; 
        } else {
            // 如果底栏没露出来，播放器死死吸附在屏幕最底端
            player.style.bottom = '0px';
        }
    }

    async performSearch() {
        const query = document.getElementById('searchInput').value.trim();
        if (!query) return;

        const searchResultsGrid = document.getElementById('searchResultsGrid');
        const searchResultsContainer = document.getElementById('searchResults');
        searchResultsGrid.innerHTML = '<p>Searching...</p>';
        searchResultsContainer.style.display = 'block';

        try {
            const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=12`);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            this.displaySearchResults(data.results, searchResultsGrid);
        } catch (error) {
            console.error('Search failed:', error);
            searchResultsGrid.innerHTML = '<p class="no-results" style="color:#ff4d4f;">Search failed. Please check your network connection.</p>';
        }
    }

    async loadFeaturedMusic(defaultArtist) {
        const featuredGrid = document.getElementById('featuredMusic');
        if(!featuredGrid) return;
        featuredGrid.innerHTML = '<p>Loading featured tracks...</p>';

        try {
            const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(defaultArtist)}&entity=song&limit=8`);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            this.displaySearchResults(data.results, featuredGrid);
        } catch (error) {
            featuredGrid.innerHTML = '<p class="no-results">Failed to load API data.</p>';
        }
    }

    displaySearchResults(results, targetContainer) {
        targetContainer.innerHTML = '';
        if (results.length === 0) {
            targetContainer.innerHTML = '<p class="no-results">No music found.</p>';
            return;
        }

        results.forEach(track => {
            if(track.previewUrl) {
                const trackElement = this.createTrackElement(track);
                targetContainer.appendChild(trackElement);
            }
        });
        
        if(typeof feather !== 'undefined') feather.replace();
    }

    createTrackElement(track) {
        const trackDiv = document.createElement('div');
        trackDiv.className = 'music-track';
        const highResArtwork = track.artworkUrl100 ? track.artworkUrl100.replace('100x100', '300x300') : '/img/jesus.png';

        trackDiv.innerHTML = `
            <div class="track-image">
                <img src="${highResArtwork}" alt="${track.trackName}" loading="lazy" onerror="this.src='/img/jesus.png'">
                <div class="play-overlay">
                    <i data-feather="play-circle"></i>
                </div>
            </div>
            <div class="track-info">
                <h3>${track.trackName}</h3>
                <p>${track.artistName}</p>
                <p class="track-duration">Preview (30s)</p>
            </div>
        `;
        trackDiv.addEventListener('click', () => this.playTrack(track));
        return trackDiv;
    }

    playTrack(track) {
        if (!track.previewUrl) return;
        
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.src = ''; 
        }
        
        this.currentTrack = track;
        this.updatePlayerInfo();
        this.showPlayer();
        
        this.currentAudio = new Audio(track.previewUrl);
        
        const highResArtwork = track.artworkUrl100 ? track.artworkUrl100.replace('100x100', '600x600') : '/img/jesus.png';
        const songData = {
            title: track.trackName,
            artist: track.artistName,
            cover: highResArtwork,
            src: track.previewUrl,
            currentTime: 0
        };
        localStorage.setItem('geekCurrentSong', JSON.stringify(songData));

        this.setupAudioEvents();
        
        this.currentAudio.play().then(() => {
            this.isPlaying = true;
            this.updatePlayerUI();
        }).catch(e => {
            console.log('自动播放被浏览器拦截', e);
            this.isPlaying = false;
            this.updatePlayerUI();
        });
    }

    setupAudioEvents() {
        if (!this.currentAudio) return;
        
        this.currentAudio.addEventListener('loadedmetadata', () => {
            const totalTimeSpan = document.getElementById('totalTime');
            if (totalTimeSpan && this.currentAudio.duration && this.currentAudio.duration !== Infinity) {
                totalTimeSpan.textContent = this.formatTime(this.currentAudio.duration * 1000);
            } else {
                totalTimeSpan.textContent = '0:30'; 
            }
        });

        this.currentAudio.addEventListener('timeupdate', () => {
            this.updateProgress();
            
            let savedSong = JSON.parse(localStorage.getItem('geekCurrentSong'));
            if (savedSong) {
                savedSong.currentTime = this.currentAudio.currentTime;
                localStorage.setItem('geekCurrentSong', JSON.stringify(savedSong));
            }
        });

        this.currentAudio.addEventListener('ended', () => {
            this.isPlaying = false;
            this.updatePlayerUI();
            document.getElementById('progressFill').style.width = '0%';
            document.getElementById('currentTime').textContent = '0:00';
        });
        
        this.currentAudio.addEventListener('play', () => { this.isPlaying = true; this.updatePlayerUI(); });
        this.currentAudio.addEventListener('pause', () => { this.isPlaying = false; this.updatePlayerUI(); });
    }

    restoreFromLocal() {
        const savedSongInfo = localStorage.getItem('geekCurrentSong');
        if (!savedSongInfo) return;
        try {
            const songData = JSON.parse(savedSongInfo);
            this.currentTrack = {
                trackName: songData.title,
                artistName: songData.artist,
                artworkUrl100: songData.cover, 
                previewUrl: songData.src
            };
            this.currentAudio = new Audio(songData.src);
            this.currentAudio.currentTime = songData.currentTime || 0;
            this.setupAudioEvents();
            this.updatePlayerInfo();
            this.showPlayer();
        } catch(e) {}
    }

    togglePlayPause() {
        if (!this.currentAudio) return;
        if (this.isPlaying) this.currentAudio.pause();
        else this.currentAudio.play();
    }

    updatePlayerUI() {
        const playPauseBtn = document.getElementById('playPauseBtn');
        if (playPauseBtn) {
            playPauseBtn.innerHTML = `<i data-feather="${this.isPlaying ? 'pause' : 'play'}"></i>`;
        }
        if(typeof feather !== 'undefined') feather.replace();
    }

    updateProgress() {
        if (!this.currentAudio || !this.currentAudio.duration) return;
        const { currentTime, duration } = this.currentAudio;
        const progressFill = document.getElementById('progressFill');
        const currentTimeSpan = document.getElementById('currentTime');
        
        if (duration && duration !== Infinity) {
            const progress = (currentTime / duration) * 100;
            progressFill.style.width = `${progress}%`;
        }
        currentTimeSpan.textContent = this.formatTime(currentTime * 1000);
    }

    updatePlayerInfo() {
        if (!this.currentTrack) return;
        const ultraResArtwork = this.currentTrack.artworkUrl100 ? this.currentTrack.artworkUrl100.replace('100x100', '600x600') : '/img/jesus.png';
        
        document.getElementById('playerAlbumArt').src = ultraResArtwork;
        document.getElementById('playerTitle').textContent = this.currentTrack.trackName;
        document.getElementById('playerArtist').textContent = this.currentTrack.artistName;
        document.getElementById('totalTime').textContent = '--:--'; 
    }

    showPlayer() {
        const player = document.getElementById('musicPlayer');
        if(!player) return;
        player.style.display = 'block';
        setTimeout(() => player.classList.add('show'), 10);
    }

    hidePlayer() {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.src = ''; 
        }
        const player = document.getElementById('musicPlayer');
        if(!player) return;
        player.classList.remove('show');
        setTimeout(() => player.style.display = 'none', 400);
    }

    setupAudioPlayer() {
        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) {
            progressBar.addEventListener('click', (e) => {
                if (!this.currentAudio || !this.currentAudio.duration) return;
                const rect = progressBar.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                this.currentAudio.currentTime = (clickX / rect.width) * this.currentAudio.duration;
            });
        }
    }

    formatTime(ms) {
        if (!ms || isNaN(ms) || ms === Infinity) return '0:00';
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new MusicHall();
    if(typeof feather !== 'undefined') feather.replace(); 
});