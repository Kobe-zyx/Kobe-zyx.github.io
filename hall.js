// ==========================================
// 极客版音乐馆引擎 (纯净 iTunes API 原生版 + 全局同步)
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
        // 默认加载推荐的歌手或关键词，你可以随意改成喜欢的名字
        await this.loadFeaturedMusic("周杰伦"); 
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
        // 提取 iTunes 的高清大图封面
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
        
        // 切歌时彻底释放上一首歌的内存
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.src = ''; 
        }
        
        this.currentTrack = track;
        this.updatePlayerInfo();
        this.showPlayer();
        
        // 极其干脆：直接调用苹果服务器的预览音频
        this.currentAudio = new Audio(track.previewUrl);
        
        // 将当前歌曲信息存入本地，供其它页面的左下角小圆盘接力播放
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
            
            // 进度实时存档，供跨页面同步
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
        if (!playPauseBtn) return;
        playPauseBtn.innerHTML = `<i data-feather="${this.isPlaying ? 'pause' : 'play'}"></i>`;
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
            this.currentAudio.src = ''; // 释放音频内存
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

document.addEventListener('DOMContentLoaded', () => new MusicHall());