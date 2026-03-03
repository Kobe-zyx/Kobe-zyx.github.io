// 音乐馆功能实现
class MusicHall {
    constructor() {
        this.currentAudio = null;
        this.isPlaying = false;
        this.currentTrack = null;

        // 精选音乐数据 (从 iTunes API 获取的示例)
        this.featuredMusic = [];

        this.init();
    }

    async init() {
        this.bindEvents();
        await this.loadFeaturedMusic();
        this.setupAudioPlayer();
    } 
 
    bindEvents() {
        const searchBtn = document.getElementById('searchBtn');
        const searchInput = document.getElementById('searchInput');
        const playPauseBtn = document.getElementById('playPauseBtn');

        searchBtn.addEventListener('click', () => this.performSearch());
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.performSearch();
        });
        if(playPauseBtn) {
            playPauseBtn.addEventListener('click', () => this.togglePlayPause());
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
            const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=20`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            this.displaySearchResults(data.results);
        } catch (error) {
            console.error('Search failed:', error);
            searchResultsGrid.innerHTML = '<p class="no-results">Search failed. Please try again later.</p>';
        }
    }

    displaySearchResults(results) {
        const grid = document.getElementById('searchResultsGrid');
        grid.innerHTML = '';

        if (results.length === 0) {
            grid.innerHTML = '<p class="no-results">No music found.</p>';
            return;
        }

        results.forEach(track => {
            const trackElement = this.createTrackElement(track);
            grid.appendChild(trackElement);
        });
        feather.replace();
    }

    createTrackElement(track) {
        const trackDiv = document.createElement('div');
        trackDiv.className = 'music-track';
        trackDiv.innerHTML = `
            <div class="track-image">
                <img src="${track.artworkUrl100.replace('100x100', '300x300')}" alt="${track.trackName}" loading="lazy">
                <div class="play-overlay">
                    <i data-feather="play"></i>
                </div>
            </div>
            <div class="track-info">
                <h3>${track.trackName}</h3>
                <p>${track.artistName}</p>
                <p class="track-duration">${this.formatTime(track.trackTimeMillis)}</p>
            </div>
        `;
        trackDiv.addEventListener('click', () => this.playTrack(track));
        return trackDiv;
    }

    async loadFeaturedMusic() {
        const featuredGrid = document.getElementById('featuredMusic');
        featuredGrid.innerHTML = '<p>Loading featured music...</p>';

        try {
            const response = await fetch(`https://itunes.apple.com/search?term=featured&entity=song&limit=8`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            this.featuredMusic = data.results;
            featuredGrid.innerHTML = '';
            this.featuredMusic.forEach(track => {
                const trackElement = this.createTrackElement(track);
                featuredGrid.appendChild(trackElement);
            });
            feather.replace();
        } catch (error) {
            console.error('Failed to load featured music:', error);
            featuredGrid.innerHTML = '<p class="no-results">Failed to load featured music. Please try again later.</p>';
        }
    }

    playTrack(track) {
        if (!track.previewUrl) {
            this.showError("No preview available for this track.");
            return;
        }
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
        });
        this.currentAudio.addEventListener('error', () => this.showError('Audio loading failed.'));
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
        const icon = playPauseBtn.querySelector('i');
        icon.setAttribute('data-feather', this.isPlaying ? 'pause' : 'play');
        feather.replace();
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
        document.getElementById('playerAlbumArt').src = this.currentTrack.artworkUrl100.replace('100x100', '600x600');
        document.getElementById('playerTitle').textContent = this.currentTrack.trackName;
        document.getElementById('playerArtist').textContent = this.currentTrack.artistName;
        document.getElementById('totalTime').textContent = this.formatTime(this.currentTrack.trackTimeMillis);
    }

    showPlayer() {
        document.getElementById('musicPlayer').style.display = 'flex';
        this.updatePlayerUI();
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

    showError(message) {
        console.error(message);
        alert(message); // Simple alert for user feedback
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new MusicHall();
});