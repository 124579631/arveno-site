document.getElementById('year').textContent = new Date().getFullYear();

const btn = document.querySelector('.menu-btn');
const links = document.querySelector('.links');

btn.addEventListener('click', () => {
  const open = links.classList.toggle('open');
  btn.setAttribute('aria-expanded', open);
});

links.addEventListener('click', (e) => {
  if (e.target.tagName === 'A') {
    links.classList.remove('open');
    btn.setAttribute('aria-expanded', false);
  }
});
