const root = document.documentElement;
const menu = document.querySelector('.menu-button');
const navigation = document.querySelector('.nav-links');
const themeButton = document.querySelector('#theme-toggle');
const searchButton = document.querySelector('#search-toggle');
const dialog = document.querySelector('#search-dialog');
const input = document.querySelector('#search-input');
const results = document.querySelector('#search-results');

menu.hidden = false;
menu.addEventListener('click', () => {
  menu.setAttribute('aria-expanded', menu.getAttribute('aria-expanded') !== 'true');
});
navigation.addEventListener('click', () => menu.setAttribute('aria-expanded', 'false'));

themeButton.hidden = false;
themeButton.addEventListener('click', () => {
  const theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  root.dataset.theme = theme;
  try { localStorage.setItem('theme', theme); } catch (error) {}
});

function updateAuthors(button, expanded) {
  const count = Number(button.dataset.count);
  const suffix = count === 1 ? 'author' : 'authors';
  document.getElementById(button.getAttribute('aria-controls')).hidden = !expanded;
  button.setAttribute('aria-expanded', expanded);
  button.textContent = expanded ? 'Show fewer authors' : 'and ' + count + ' more ' + suffix;
}
document.querySelectorAll('.expand-authors').forEach(button => {
  updateAuthors(button, false);
  button.hidden = false;
  button.addEventListener('click', () => updateAuthors(button, button.getAttribute('aria-expanded') !== 'true'));
});

document.querySelectorAll('.resources button').forEach(button => {
  button.hidden = false;
  button.addEventListener('click', () => {
    const panel = document.getElementById(button.getAttribute('aria-controls'));
    panel.hidden = !panel.hidden;
    button.setAttribute('aria-expanded', !panel.hidden);
  });
});

const papers = Array.from(document.querySelectorAll('.paper'), paper => ({
  title: paper.querySelector('h3').textContent.trim(),
  href: '#' + paper.id,
  terms: paper.id + ' ' + paper.querySelector('.authors').textContent + ' ' + paper.querySelector('.resources').textContent
}));
const entries = [
  { title: 'About ' + document.title, href: '#about' },
  { title: 'News', href: '#news' },
  { title: 'Selected Publications', href: '#publications' },
  ...papers,
  ...Array.from(document.querySelectorAll('.profile-links a'), link => ({
    title: link.textContent.trim(), href: link.getAttribute('href')
  }))
];
function showResults() {
  const query = input.value.trim().toLowerCase();
  results.replaceChildren();
  entries.filter(entry => (entry.title + ' ' + (entry.terms || '')).toLowerCase().includes(query)).forEach(entry => {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = entry.href;
    link.textContent = entry.title;
    item.append(link);
    results.append(item);
  });
  if (!results.children.length) {
    const item = document.createElement('li');
    item.textContent = 'No results';
    results.append(item);
  }
}
function openSearch() {
  menu.setAttribute('aria-expanded', 'false');
  input.value = '';
  showResults();
  dialog.showModal();
  input.focus();
}
if (typeof dialog.showModal === 'function') {
  searchButton.hidden = false;
  if (/Mac|iPhone|iPad/.test(navigator.platform)) {
    document.querySelector('#search-shortcut').textContent = '⌘ k';
  }
  searchButton.addEventListener('click', openSearch);
  input.addEventListener('input', showResults);
  dialog.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      event.preventDefault();
      dialog.close();
    }
  });
  results.addEventListener('click', event => {
    if (event.target.closest('a')) dialog.close();
  });
  document.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      if (dialog.open) dialog.close();
      else openSearch();
    }
  });
}

const progress = document.querySelector('#reading-progress');
const publications = document.querySelector('#publications');
const navLinks = navigation.querySelectorAll('a');
function updateReadingPosition() {
  const distance = root.scrollHeight - window.innerHeight;
  const fraction = distance > 0 ? Math.min(1, Math.max(0, window.scrollY / distance)) : 0;
  progress.style.transform = 'scaleX(' + fraction + ')';
  const current = publications.getBoundingClientRect().top <= 84 || fraction >= .99 ? '#publications' : '#about';
  navLinks.forEach(link => {
    if (link.hash === current) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}
window.addEventListener('scroll', updateReadingPosition, { passive: true });
window.addEventListener('resize', updateReadingPosition);
window.addEventListener('load', updateReadingPosition);
updateReadingPosition();
