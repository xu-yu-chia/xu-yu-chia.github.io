const viewCount = localStorage.getItem('viewCount') || 0;
document.getElementById('viewCount').textContent = parseInt(viewCount) + 1;
localStorage.setItem('viewCount', parseInt(viewCount) + 1);

// 簡單顯示內容切換
document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', event => {
        event.preventDefault();
        document.querySelectorAll('main section').forEach(section => section.classList.add('hidden'));
        const target = document.querySelector(link.getAttribute('href'));
        if (target) target.classList.remove('hidden');
    });
});

// 滑鼠點擊漣漪效果
document.body.addEventListener('click', (e) => {
    const ripple = document.createElement('div');
    ripple.className = 'ripple';
    document.body.appendChild(ripple);

    const size = 100; // 固定漣漪大小更小
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.pageX - size / 2}px`;
    ripple.style.top = `${e.pageY - size / 2}px`;
    setTimeout(() => ripple.remove(), 400);
});
// 監聽超連結的點擊事件
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', event => {
        event.preventDefault(); // 阻止預設行為（跳轉到目標）

        // 隱藏所有的 section
        document.querySelectorAll('main section').forEach(section => {
            section.classList.add('hidden');
        });

        // 顯示目標 section
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
            target.classList.remove('hidden');
            target.scrollIntoView({ behavior: 'smooth' }); // 平滑滾動到目標區塊
        }
    });
});

document.querySelectorAll("*").forEach(element => {
  element.classList.add("interactive");
});

