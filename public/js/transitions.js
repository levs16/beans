const pageTransitions = {
  paths: ['/', '/login', '/editor', '/404', '/500'],
  
  getDirection(from, to) {
    const fromIndex = this.paths.indexOf(from);
    const toIndex = this.paths.indexOf(to);
    return fromIndex < toIndex ? 'slide-left' : 'slide-right';
  },

  beforeNavigate(url) {
    const currentPath = window.location.pathname;
    const direction = this.getDirection(currentPath, url);
    
    document.body.classList.add('transitioning', direction);
    return new Promise(resolve => setTimeout(resolve, 300));
  },

  afterNavigate() {
    document.body.classList.remove('transitioning', 'slide-left', 'slide-right');
  }
};

document.addEventListener('click', async (e) => {
  const link = e.target.closest('a');
  if (link && link.href.startsWith(window.location.origin)) {
    e.preventDefault();
    
    await pageTransitions.beforeNavigate(link.pathname);
    window.location.href = link.href;
  }
});

window.addEventListener('popstate', () => {
  pageTransitions.afterNavigate();
}); 