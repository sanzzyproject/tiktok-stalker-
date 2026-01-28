// Elements
const usernameInput = document.getElementById('username');
const searchBtn = document.getElementById('searchBtn');
const loading = document.getElementById('loading');
const errorDiv = document.getElementById('error');
const profileDiv = document.getElementById('profile');
const postsDiv = document.getElementById('posts');
const postsGrid = document.getElementById('postsGrid');

// API Base URL - gunakan relative path untuk Vercel
const API_URL = '/api/stalk';

// Format number
function formatNumber(num) {
    if (num >= 1000000000) {
        return (num / 1000000000).toFixed(1) + 'B';
    }
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// Show/Hide elements
function showElement(element) {
    element.classList.remove('hidden');
}

function hideElement(element) {
    element.classList.add('hidden');
}

// Show error
function showError(message) {
    errorDiv.textContent = message;
    showElement(errorDiv);
    setTimeout(() => {
        hideElement(errorDiv);
    }, 5000);
}

// Display profile
function displayProfile(data) {
    try {
        const userInfo = data.profile.userInfo.user;
        const stats = data.profile.userInfo.stats;
        
        // Set avatar
        document.getElementById('avatar').src = userInfo.avatarLarger || userInfo.avatarMedium || userInfo.avatarThumb;
        
        // Set profile info
        document.getElementById('nickname').textContent = userInfo.nickname || userInfo.uniqueId;
        document.getElementById('uniqueId').textContent = '@' + userInfo.uniqueId;
        document.getElementById('signature').textContent = userInfo.signature || 'Tidak ada bio';
        
        // Set stats
        document.getElementById('following').textContent = formatNumber(stats.followingCount || 0);
        document.getElementById('followers').textContent = formatNumber(stats.followerCount || 0);
        document.getElementById('likes').textContent = formatNumber(stats.heartCount || 0);
        document.getElementById('videos').textContent = formatNumber(stats.videoCount || 0);
        
        showElement(profileDiv);
    } catch (error) {
        console.error('Error displaying profile:', error);
        showError('Gagal menampilkan profil');
    }
}

// Display posts
function displayPosts(data) {
    try {
        postsGrid.innerHTML = '';
        
        if (!data.posts || !data.posts.originalItems || data.posts.originalItems.length === 0) {
            postsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 20px; color: var(--text-secondary);">Tidak ada video</p>';
            showElement(postsDiv);
            return;
        }
        
        const items = data.posts.originalItems.slice(0, 12); // Limit to 12 videos
        
        items.forEach(item => {
            const postItem = document.createElement('div');
            postItem.className = 'post-item';
            
            const coverUrl = item.video?.cover || item.video?.dynamicCover || item.video?.originCover;
            const playCount = item.stats?.playCount || 0;
            const videoUrl = `https://www.tiktok.com/@${item.author?.uniqueId}/video/${item.id}`;
            
            postItem.innerHTML = `
                <img src="${coverUrl}" alt="Video thumbnail" loading="lazy">
                <div class="post-overlay">
                    <svg viewBox="0 0 24 24" fill="white">
                        <path d="M8 5v14l11-7z"/>
                    </svg>
                    <span>${formatNumber(playCount)}</span>
                </div>
            `;
            
            postItem.addEventListener('click', () => {
                window.open(videoUrl, '_blank');
            });
            
            postsGrid.appendChild(postItem);
        });
        
        showElement(postsDiv);
    } catch (error) {
        console.error('Error displaying posts:', error);
        showError('Gagal menampilkan video');
    }
}

// Fetch TikTok data
async function fetchTikTokData(username) {
    try {
        // Hide previous results
        hideElement(profileDiv);
        hideElement(postsDiv);
        hideElement(errorDiv);
        showElement(loading);
        
        const response = await fetch(`${API_URL}?username=${encodeURIComponent(username)}`);
        const data = await response.json();
        
        hideElement(loading);
        
        if (!response.ok) {
            throw new Error(data.message || 'Gagal mengambil data');
        }
        
        if (!data.profile || !data.profile.userInfo) {
            throw new Error('Username tidak ditemukan');
        }
        
        displayProfile(data);
        displayPosts(data);
        
    } catch (error) {
        hideElement(loading);
        console.error('Error:', error);
        showError(error.message || 'Terjadi kesalahan saat mengambil data');
    }
}

// Event listeners
searchBtn.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    
    if (!username) {
        showError('Masukkan username terlebih dahulu!');
        return;
    }
    
    // Remove @ if user includes it
    const cleanUsername = username.replace('@', '');
    fetchTikTokData(cleanUsername);
});

usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchBtn.click();
    }
});

// Prevent zoom on double tap (iOS)
let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        e.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// Service Worker Registration (optional, for PWA)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {
            // Ignore if service worker fails to register
        });
    });
}
