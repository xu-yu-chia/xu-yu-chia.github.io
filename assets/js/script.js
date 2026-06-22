const viewCount = localStorage.getItem('viewCount') || Math.floor(Math.random() * 10000);  // 隨機產生 0 到 9999 的數字
document.getElementById('viewCount').textContent = parseInt(viewCount) + 1;
localStorage.setItem('viewCount', parseInt(viewCount) + 1);


// 監聽超連結的點擊事件
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', event => {
        const target = document.querySelector(link.getAttribute('href'));

        if (target) {
            event.preventDefault(); // 阻止預設行為（跳轉到目標）

            // 隱藏所有的 section
            document.querySelectorAll('main section').forEach(section => {
                section.classList.add('hidden');
            });

            // 顯示目標 section
            target.classList.remove('hidden');
            // target.scrollIntoView({ behavior: 'smooth' }); // 平滑滾動到目標區塊
        } else {
            // 如果找不到目標 section，讓瀏覽器跳轉到原本的 href
            window.location.href = link.getAttribute('href');
        }
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



/*

let clickCount = 0;

// 獲取超連結元素
const link = document.getElementById('customLink');

link.addEventListener('click', function(event) {
    event.preventDefault();
    clickCount++;

    if (clickCount === 5) {
        // 取得目前時間（時 + 分）
        const now = new Date();
        const pad2 = n => n.toString().padStart(2, '0');

        // 產生可接受的三種密碼（前一分、當前分、下一分）
        const times = [-1, 0, 1].map(offset => {
            const t = new Date(now.getTime() + offset * 60000);
            return pad2(t.getHours()) + pad2(t.getMinutes());
        });

        // 建立遮罩輸入框
        const div = document.createElement('div');
        div.style = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center;
            z-index: 9999;
        `;
        div.innerHTML = `
            <div style="
                background:#fff; padding:20px 25px; border-radius:12px;
                text-align:center; box-shadow:0 5px 20px rgba(0,0,0,0.3);
            ">
                <h3 style="margin-bottom:10px;">請輸入當前時間（HHMM）</h3>
                <input type="password" id="timePassword" maxlength="4" placeholder="例如1020"
                    style="padding:10px; font-size:16px; width:150px; text-align:center;">
                <div style="margin-top:15px;">
                    <button id="okBtn" style="padding:8px 16px; font-size:14px;">確認</button>
                    <button id="cancelBtn" style="padding:8px 16px; font-size:14px;">取消</button>
                </div>
            </div>
        `;
        document.body.appendChild(div);

        const input = div.querySelector('#timePassword');
        const okBtn = div.querySelector('#okBtn');
        const cancelBtn = div.querySelector('#cancelBtn');
        input.focus();

        okBtn.onclick = () => {
            const userInput = input.value.trim();
            if (times.includes(userInput)) {
                alert("密碼正確，正在跳轉...");
                window.location.href = "https://drive.google.com/drive/folders/1IZHCREJtgujggHoZeD4I4c2O-Zm24wlU?usp=sharing";
            } else {
                alert("密碼錯誤，請重新嘗試！");
            }
            document.body.removeChild(div);
            clickCount = 100;
        };

        cancelBtn.onclick = () => {
            document.body.removeChild(div);
            clickCount = 0;
        };
    } else {
        console.log('點擊次數:', clickCount);
    }
});
*/


let clickCount = 0;

// 獲取超連結元素
const link = document.getElementById('customLink');

// 添加點擊事件監聽器
link.addEventListener('click', function(event) {
    event.preventDefault(); // 阻止默認的連結行為
    clickCount++;

    // 檢查是否達到5次點擊
    if (clickCount === 5) {
        // 取得目前時間（時 + 分）
        const now = new Date();

        // 小工具：補0
        const pad2 = (n) => n.toString().padStart(2, '0');

        // 產生可接受的三種密碼（前一分、當前分、下一分）
        const times = [-1, 0, 1].map(offset => {
            const t = new Date(now.getTime() + offset * 60000);
            return pad2(t.getHours()) + pad2(t.getMinutes());
        });

        console.log("（開發提示）可接受密碼為：", times); // 測試用，可刪除

        // 要求使用者輸入密碼
        const userInput = prompt("輸入密碼以繼續：");

        if (times.includes(userInput)) {
            // 密碼正確 → 跳轉
            alert("密碼正確，正在跳轉...");
            window.location.href = "https://drive.google.com/drive/folders/1IZHCREJtgujggHoZeD4I4c2O-Zm24wlU?usp=sharing";
        } else {
            // 密碼錯誤 → 顯示提示並重置點擊次數
            alert("尼瑪還想猜密碼啊!!");
            alert("尼瑪還想猜密碼啊!!");
            alert("尼瑪還想猜密碼啊!!");
            alert("尼瑪還想猜密碼啊!!");
            alert("尼瑪還想猜密碼啊!!");
            clickCount = 100;
        }
    } else {
        console.log('點擊次數:', clickCount);
    }
});


/*

// 初始化點擊計數器
let clickCount = 0;

// 獲取超連結元素
const link = document.getElementById('customLink');

// 添加點擊事件監聽器
link.addEventListener('click', function(event) {
    event.preventDefault(); // 阻止默認的連結行為
    clickCount++;

    // 檢查是否達到5次點擊
    if (clickCount === 5) {
        // 跳轉到你想要的網址
        window.location.href = "https://drive.google.com/drive/folders/1IZHCREJtgujggHoZeD4I4c2O-Zm24wlU?usp=sharing"; // 更換為你想要的URL
    } else {
        // 可以更新UI來顯示當前點擊次數，但這裡我們只是簡單地不做任何事情
        console.log('點擊次數:', clickCount);
    }
});

*/

function showSectionFromHash() {
  let hash = window.location.hash;

  if (!hash) {
    window.location.hash = '#home'; // 沒有 hash 時跳回首頁
    return;
  }

  const targetSection = document.querySelector(hash);

  if (targetSection) {
    // 隱藏所有 section
    document.querySelectorAll('section').forEach(section => {
      section.classList.add('hidden');
    });

    // 顯示目標 section
    targetSection.classList.remove('hidden');
  } else {
    // 如果 hash 無效，導回首頁
    window.location.hash = '#home';
  }
}

// 頁面載入時和 hash 變化時執行
window.addEventListener('DOMContentLoaded', showSectionFromHash);
window.addEventListener('hashchange', showSectionFromHash);


