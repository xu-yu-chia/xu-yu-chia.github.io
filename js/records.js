// /js/records.js
// 讀取 scores.json，計算 PB 與「最近5筆」，並渲染到 #pb-list 和 #recent-list
// 也提供一個（選配）簡易新增介面 hooks：window.addRace(entry)

const DATA_URL = '/data/scores.json'; // 請依你的部署位置調整

// category 的排序（僅用於 PB 顯示順序）
const CATEGORY_ORDER = ['馬拉松', '半馬', '10K', '5K', '3K'];

// 將 "HH:MM:SS" 轉成秒數
function timeToSeconds(t) {
  if (!t) return Number.POSITIVE_INFINITY;
  const [hh = '0', mm = '0', ss = '0'] = t.split(':');
  const h = parseInt(hh, 10) || 0;
  const m = parseInt(mm, 10) || 0;
  const s = parseInt(ss, 10) || 0;
  return h * 3600 + m * 60 + s;
}

// 將秒數轉回 "HH:MM:SS"
function secondsToTime(sec) {
  if (!Number.isFinite(sec)) return '';
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

// 安全地解析日期，並回傳 time value 供排序（無效日期放最小）
function dateValue(isoDate) {
  const t = Date.parse(isoDate);
  return Number.isFinite(t) ? t : -Infinity;
}

// 計算各 category 的 PB（取最小時間，若時間相同，取日期最近的一筆）
function computePB(races) {
  const pb = new Map(); // category -> { race, secs }
  for (const r of races) {
    const cat = r.category;
    if (!cat) continue;
    const secs = timeToSeconds(r.time);
    if (!Number.isFinite(secs)) continue;

    const cur = pb.get(cat);
    if (!cur) {
      pb.set(cat, { race: r, secs });
    } else {
      if (
        secs < cur.secs ||
        (secs === cur.secs && dateValue(r.date) > dateValue(cur.race.date))
      ) {
        pb.set(cat, { race: r, secs });
      }
    }
  }
  // 轉為陣列並依我們想呈現的類別順序排序
  return Array.from(pb.entries())
    .sort((a, b) => CATEGORY_ORDER.indexOf(a[0]) - CATEGORY_ORDER.indexOf(b[0]))
    .map(([category, { race, secs }]) => ({
      category,
      event: race.event,
      date: race.date,
      time: secondsToTime(secs)
    }));
}

// 取最近參加的賽事前 5 筆（依日期新到舊）
function recentTop5(races) {
  return [...races]
    .filter(r => Number.isFinite(dateValue(r.date)))
    .sort((a, b) => dateValue(b.date) - dateValue(a.date))
    .slice(0, 5);
}

// 產出一個 <li>（和你原本的樣式一致）
function makeLI({ title, subtitle, titleColorClass }) {
  const li = document.createElement('li');
  li.className = 'p-4 bg-gray-800 rounded-lg shadow-lg hover:scale-105 transform transition duration-300';

  const p1 = document.createElement('p');
  p1.className = `text-lg font-semibold ${titleColorClass}`;
  p1.textContent = title;

  const p2 = document.createElement('p');
  p2.className = 'text-gray-400';
  p2.textContent = subtitle;

  li.appendChild(p1);
  li.appendChild(p2);
  return li;
}

// 渲染 PB 區塊
function renderPB(pbList, container) {
  container.innerHTML = '';
  for (const pb of pbList) {
    const title = `${pb.category}： ${pb.time}`;
    const subtitle = `地點：${pb.event}，${pb.date.replaceAll('-', '.')}`;
    container.appendChild(
      makeLI({
        title,
        subtitle,
        titleColorClass: 'text-blue-300'
      })
    );
  }
}

// 渲染最近5筆賽事
function renderRecent(races, container) {
  container.innerHTML = '';
  for (const r of races) {
    const title = `${r.date.replaceAll('-', '.')} ${r.event}_${r.category}`;
    const subtitle = `完賽時間： ${r.time}`;
    container.appendChild(
      makeLI({
        title,
        subtitle,
        titleColorClass: 'text-pink-300'
      })
    );
  }
}

// 讀檔 + 渲染
async function bootstrap() {
  const pbContainer = document.querySelector('#pb-list');
  const recentContainer = document.querySelector('#recent-list');
  if (!pbContainer || !recentContainer) {
    console.warn('[records] 找不到 #pb-list 或 #recent-list，請確認 HTML 已添加這兩個元素。');
    return;
  }

  try {
    const res = await fetch(DATA_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error(`讀取 ${DATA_URL} 失敗（${res.status}）`);
    const data = await res.json();
    const races = Array.isArray(data?.races) ? data.races : [];

    const pb = computePB(races);
    const recent = recentTop5(races);

    renderPB(pb, pbContainer);
    renderRecent(recent, recentContainer);

    // 提供全域 hooks（選配）：可在 console 或自訂表單呼叫
    window.addRace = (entry) => {
      // entry: { date, event, category, time, notes? }
      races.push(entry);
      const newPB = computePB(races);
      const newRecent = recentTop5(races);
      renderPB(newPB, pbContainer);
      renderRecent(newRecent, recentContainer);
      console.info('[records] 已新增一筆賽事，若要保存請呼叫 window.downloadScores()');
    };

    window.downloadScores = () => {
      const payload = JSON.stringify({ races }, null, 2);
      const blob = new Blob([payload], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'scores.json';
      a.click();
      URL.revokeObjectURL(url);
    };
  } catch (err) {
    console.error('[records] 載入或渲染失敗：', err);
  }
}

// 延後到 DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
