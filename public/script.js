async function stalkUser() {
    const username = document.getElementById('usernameInput').value.trim();
    const resultArea = document.getElementById('resultArea');
    const loading = document.getElementById('loading');
    const errorMsg = document.getElementById('errorMsg');
    const postsGrid = document.getElementById('postsGrid');

    if (!username) return alert('Masukkan username dulu!');

    // Reset UI
    resultArea.classList.add('hidden');
    errorMsg.classList.add('hidden');
    loading.classList.remove('hidden');
    postsGrid.innerHTML = '';

    try {
        // Panggil API Backend kita sendiri (folder /api/)
        const response = await fetch(`/api/stalk?username=${username}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'User tidak ditemukan atau server sibuk.');
        }

        renderData(data);
    } catch (err) {
        errorMsg.textContent = err.message;
        errorMsg.classList.remove('hidden');
    } finally {
        loading.classList.add('hidden');
    }
}

function renderData(data) {
    const resultArea = document.getElementById('resultArea');
    
    // Safety check data structure
    const user = data.profile?.userInfo?.user;
    const stats = data.profile?.userInfo?.stats;
    const posts = data.posts?.originalItems || [];

    if (!user) {
        throw new Error("Data profil tidak valid.");
    }

    // Isi Info Profil
    document.getElementById('avatar').src = user.avatarThumb || '';
    document.getElementById('nickname').textContent = user.nickname || 'No Name';
    document.getElementById('uniqueId').textContent = '@' + user.uniqueId;
    document.getElementById('followers').textContent = formatNumber(stats.followerCount) + ' Pengikut';
    document.getElementById('likes').textContent = formatNumber(stats.heartCount) + ' Suka';
    document.getElementById('bio').textContent = user.signature || 'Tidak ada bio';

    // Render Posts
    if (posts.length === 0) {
        postsGrid.innerHTML = '<p style="grid-column: span 2; text-align: center; color: #888;">Tidak ada video.</p>';
    } else {
        posts.forEach(post => {
            const div = document.createElement('div');
            div.className = 'post-item';
            
            // Cek apakah ada cover image
            const cover = post.video?.cover || 'https://via.placeholder.com/150';
            const desc = post.desc || '';
            const link = `https://www.tiktok.com/@${user.uniqueId}/video/${post.id}`;

            div.innerHTML = `
                <a href="${link}" target="_blank" style="text-decoration: none; color: white;">
                    <img src="${cover}" alt="Video" loading="lazy">
                    <div class="post-desc">${desc}</div>
                </a>
            `;
            postsGrid.appendChild(div);
        });
    }

    resultArea.classList.remove('hidden');
}

function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num;
}
