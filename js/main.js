// js/main.js
import { loadNewsList, getTopItems } from './news.js';

const newsGrid = document.getElementById('news-grid');
const featuredCarousel = document.getElementById('featured-carousel');
const topList = document.getElementById('top-stories-list');
const upcomingList = document.getElementById('upcoming-list');
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modal-body');
const modalClose = document.getElementById('modal-close');

function openModal(html){
  modalBody.innerHTML = html;
  modal.setAttribute('aria-hidden','false');
  // set focus to modal close for accessibility
  modalClose?.focus();
}
function closeModal(){
  modal.setAttribute('aria-hidden','true');
}
mo2dalClose?.addEventListener('click', closeModal);
modal.addEventListener('click', (e)=>{ if(e.target === modal) closeModal(); });

// mobile nav toggle
document.getElementById('menu-toggle')?.addEventListener('click', () => {1
  const nav = document.getElementById('primary-nav');
  const open = nav.classList.toggle('open');
  document.getElementById('menu-toggle')?.setAttribute('aria-expanded', String(open));
  localStorage.setItem('navOpen', String(open));
});
if (localStorage.getItem('navOpen') === 'true') {
  document.getElementById('primary-nav')?.classList.add('open');
}

async function init(){
  try{
    const items = await loadNewsList();

    // featured (first 3)
    const featured = items.slice(0,3);
    if(featuredCarousel) featuredCarousel.innerHTML = featured.map(it => `
      <figure class="featured-item">
        <img src="${it.image}" alt="${it.title}" loading="lazy">
        <figcaption>
          <h3>${it.title}</h3>
          <p>${it.summary}</p>
          <p><a href="news/article.html?id=${encodeURIComponent(it.id)}" class="btn">Read article</a></p>
        </figcaption>
      </figure>
    `).join('');

    // news cards (first 15)
    if(newsGrid) newsGrid.innerHTML = items.slice(0,15).map(it => `
      <article class="news-card" role="listitem" tabindex="0" data-id="${it.id}">
        <img src="${it.image}" alt="${it.title}" loading="lazy">
        <div class="card-body">
          <h3>${it.title}</h3>
          <p><strong>${it.category}</strong> — ${it.date}</p>
          <p class="summary">${it.summary}</p>
          <div class="card-actions">
            <button class="favorite-btn" data-id="${it.id}" aria-pressed="false" title="Add to favorites">♡</button>
            <button class="preview-btn" data-id="${it.id}">Preview</button>
            <a href="news/article.html?id=${encodeURIComponent(it.id)}" class="btn" style="margin-left:auto">Open</a>
          </div>
        </div>
      </article>
    `).join('');

    // top stories & upcoming
    const top = getTopItems(items,5);
    if(topList) topList.innerHTML = top.map(t => `<li>${t.title} <small>(${t.category})</small></li>`).join('');
    const upcoming = items.filter(i=>i.upcoming).slice(0,5);
    if(upcomingList) upcomingList.innerHTML = upcoming.map(u=>`<li>${u.title} — ${u.date}</li>`).join('');

    // interactions on cards
    document.querySelectorAll('.news-card').forEach(card => {
      const id = card.dataset.id;
      const favBtn = card.querySelector('.favorite-btn');
      const previewBtn = card.querySelector('.preview-btn');

      // initial favorite state
      const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
      if(favs.includes(id)){ favBtn.setAttribute('aria-pressed','true'); favBtn.textContent='♥'; }

      favBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        if(favorites.includes(id)){
          favorites = favorites.filter(x => x !== id);
          favBtn.setAttribute('aria-pressed','false'); favBtn.textContent='♡';
        } else {
          favorites.push(id);
          favBtn.setAttribute('aria-pressed','true'); favBtn.textContent='♥';
        }
        localStorage.setItem('favorites', JSON.stringify(favorites));
        window.dispatchEvent(new Event('favorites-changed'));
      });

      previewBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const item = items.find(it => String(it.id) === String(id));
        if(item){
          openModal(`
            <h2 id="modal-title">${item.title}</h2>
            <p><strong>${item.category}</strong> — ${item.date}</p>
            <img src="${item.image}" alt="${item.title}" style="max-width:100%;display:block;margin:12px 0;border-radius:6px">
            <p>${item.summary}</p>
            <p><a href="news/article.html?id=${encodeURIComponent(item.id)}" class="btn">Read full article</a></p>
          `);
        }
      });

      card.addEventListener('click', ()=> window.open(`news/article.html?id=${encodeURIComponent(id)}`, '_blank'));
      card.addEventListener('keydown', (e)=>{ if(e.key === 'Enter') card.click(); });
    });

    // persist lastLoaded demo
    if(items.length) localStorage.setItem('lastLoaded', items[0].category);

    // broadcast favorites-changed to update any favorites list UI
    window.dispatchEvent(new Event('favorites-changed'));

  }catch(err){
    console.error('Init error', err);
    if(newsGrid) newsGrid.innerHTML = '<p class="note">Unable to load news at this time.</p>';
  }
}

init();
export { openModal, closeModal };
