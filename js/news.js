// js/news.js
const DATA_PATH = new URL('../data/sports-data.json', import.meta.url).pathname;

export async function loadNewsList() {
  try {
    const res = await fetch(DATA_PATH);
    if (!res.ok) throw new Error('Network response was not ok');
    const data = await res.json();
    return data.map((item, idx) => ({
      id: item.id ?? `i${idx + 1}`,
      title: item.title ?? 'Untitled',
      image: item.image ?? 'images/articles/default.jpg',
      category: item.category ?? 'General',
      date: item.date ?? '',
      summary: item.summary ?? '',
      content: item.content ?? '',
      upcoming: Boolean(item.upcoming)
    }));
  } catch (err) {
    console.error('Failed to load news', err);
    throw err;
  }
}

export function getTopItems(list, count = 5) {
  return list.slice().sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, count);
}

export async function getItemById(id) {
  const list = await loadNewsList();
  return list.find(i => String(i.id) === String(id));
}

export async function renderArticleFromParams() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const spot = document.getElementById('article-spot');
  if (!id) { spot.innerHTML = '<p>No article selected.</p>'; return; }
  try {
    const item = await getItemById(id);
    if (!item) { spot.innerHTML = '<p>Article not found.</p>'; return; }
    spot.innerHTML = `
      <h1>${item.title}</h1>
      <p><strong>${item.category}</strong> — ${item.date}</p>
      <img src="${item.image}" alt="${item.title}" loading="lazy" style="max-width:100%;height:auto;border-radius:8px">
      <div class="article-content">
        ${item.content ? item.content : `<p>${item.summary}</p><p>Full article content goes here.</p>`}
      </div>
      <div style="margin-top:12px">
        <button id="fav-article" class="favorite-btn" aria-pressed="false">♡ Save</button>
      </div>
    `;
    const favBtn = document.getElementById('fav-article');
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    if (favorites.includes(item.id)) {
      favBtn.setAttribute('aria-pressed', 'true');
      favBtn.textContent = '♥ Saved';
    }
    favBtn.addEventListener('click', () => {
      let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      if (favorites.includes(item.id)) {
        favorites = favorites.filter(x => x !== item.id);
        favBtn.setAttribute('aria-pressed', 'false');
        favBtn.textContent = '♡ Save';
      } else {
        favorites.push(item.id);
        favBtn.setAttribute('aria-pressed', 'true');
        favBtn.textContent = '♥ Saved';
      }
      localStorage.setItem('favorites', JSON.stringify(favorites));
      window.dispatchEvent(new Event('favorites-changed'));
    });
  } catch (err) {
    spot.innerHTML = '<p>Error loading article.</p>';
  }
}

// if (typeof document !== 'undefined' && document.getElementById('all-news')) {
  (async () => {
    try {
      const items = await loadNewsList();
      const grid = document.getElementById('all-news');
      grid.innerHTML = items.map(it => `
        <article class="news-card">
          <img src="../${it.image}" alt="${it.title}">
          <h3>${it.title}</h3>
          <p>${it.summary}</p>
        </article>
      `).join('');
    } catch (err) {
      console.error('Error loading news:', err);
    }
  })();