// 音乐馆功能实现
class MusicHall {
    constructor() {
        this.currentAudio = null;
        this.isPlaying = false;
        this.currentTrack = null;
        this.init();
    }

    async init() {
        this.bindEvents();
        // 极客品味：默认搜索林肯公园或者电子乐来作为默认展示，比搜 featured 出来的结果酷多了
        await this.loadFeaturedMusic("OneDirection"); 
        this.setupAudioPlayer();
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
        if(playPauseBtn) {
            playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        }
        if(closePlayerBtn) {
            closePlayerBtn.addEventListener('click', () => this.hidePlayer());
        }
    }

    async performSearch() {
        const query = document.getElementById('searchInput').value.trim();
        if (!query) return;

        const searchResultsGrid = document.getElementById('searchResultsGrid');
        const searchResultsContainer = document.getElementById('searchResults');
        searchResultsGrid.innerHTML = '<p>Searching via iTunes API...</p>';
        searchResultsContainer.style.display = 'block';

        try {
            const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=12`);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            this.displaySearchResults(data.results, searchResultsGrid);
        } catch (error) {
            console.error('Search failed:', error);
            searchResultsGrid.innerHTML = '<p class="no-results">Search failed. Please try again later.</p>';
        }
    }

    async loadFeaturedMusic(defaultArtist) {
        const featuredGrid = document.getElementById('featuredMusic');
        featuredGrid.innerHTML = '<p>Loading featured tracks...</p>';

        try {
            const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(defaultArtist)}&entity=song&limit=8`);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            this.displaySearchResults(data.results, featuredGrid);
        } catch (error) {
            console.error('Failed to load featured music:', error);
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
            // 只展示有预览音频的歌曲
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
        trackDiv.innerHTML = `
            <div class="track-image">
                <img src="${track.artworkUrl100.replace('100x100', '300x300')}" alt="${track.trackName}" loading="lazy">
                <div class="play-overlay">
                    <i data-feather="play-circle"></i>
                </div>
            </div>
            <div class="track-info">
                <h3>${track.trackName}</h3>
                <p>${track.artistName}</p>
                <p class="track-duration">Preview · 30s</p>
            </div>
        `;
        trackDiv.addEventListener('click', () => this.playTrack(track));
        return trackDiv;
    }

    playTrack(track) {
        if (!track.previewUrl) return;
        
        if (this.currentAudio) {
            this.currentAudio.pause();
        }
        
        this.currentTrack = track;
        this.currentAudio = new Audio(track.previewUrl);
        this.setupAudioEvents();
        this.currentAudio.play();
        this.updatePlayerInfo();
        this.showPlayer();
    }

    setupAudioEvents() {
        if (!this.currentAudio) return;
        this.currentAudio.addEventListener('timeupdate', () => this.updateProgress());
        this.currentAudio.addEventListener('ended', () => {
            this.isPlaying = false;
            this.updatePlayerUI();
            // 播放完毕进度条归零
            document.getElementById('progressFill').style.width = '0%';
            document.getElementById('currentTime').textContent = '0:00';
        });
        this.currentAudio.addEventListener('play', () => {
            this.isPlaying = true;
            this.updatePlayerUI();
        });
        this.currentAudio.addEventListener('pause', () => {
            this.isPlaying = false;
            this.updatePlayerUI();
        });
    }

    togglePlayPause() {
        if (!this.currentAudio) return;
        if (this.isPlaying) {
            this.currentAudio.pause();
        } else {
            this.currentAudio.play();
        }
    }

    updatePlayerUI() {
        const playPauseBtn = document.getElementById('playPauseBtn');
        if (!playPauseBtn) return;
        // 使用 innerHTML 重新绘制 SVG 解决 feather 无法实时切换图标的问题
        playPauseBtn.innerHTML = `<i data-feather="${this.isPlaying ? 'pause' : 'play'}"></i>`;
        if(typeof feather !== 'undefined') feather.replace();
    }

    updateProgress() {
        if (!this.currentAudio || !this.currentAudio.duration) return;
        const { currentTime, duration } = this.currentAudio;
        const progressFill = document.getElementById('progressFill');
        const currentTimeSpan = document.getElementById('currentTime');
        
        if (duration) {
            const progress = (currentTime / duration) * 100;
            progressFill.style.width = `${progress}%`;
        }
        currentTimeSpan.textContent = this.formatTime(currentTime * 1000);
    }

    updatePlayerInfo() {
        if (!this.currentTrack) return;
        // 把 iTunes 默认的很糊的小图换成 600x600 的高清封面
        document.getElementById('playerAlbumArt').src = this.currentTrack.artworkUrl100.replace('100x100', '600x600');
        document.getElementById('playerTitle').textContent = this.currentTrack.trackName;
        document.getElementById('playerArtist').textContent = this.currentTrack.artistName;
    }

    showPlayer() {
        const player = document.getElementById('musicPlayer');
        player.style.display = 'block';
        // 使用一小段延迟来触发 CSS 的滑入动画
        setTimeout(() => {
            player.classList.add('show');
        }, 10);
    }

    hidePlayer() {
        if (this.currentAudio) {
            this.currentAudio.pause();
        }
        const player = document.getElementById('musicPlayer');
        player.classList.remove('show');
        // 等待动画结束后隐藏
        setTimeout(() => {
            player.style.display = 'none';
        }, 400);
    }

    setupAudioPlayer() {
        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) {
            progressBar.addEventListener('click', (e) => {
                if (!this.currentAudio || !this.currentAudio.duration) return;
                const rect = progressBar.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const percentage = clickX / rect.width;
                this.currentAudio.currentTime = percentage * this.currentAudio.duration;
            });
        }
    }

    formatTime(ms) {
        if (!ms || isNaN(ms)) return '0:00';
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new MusicHall();
});