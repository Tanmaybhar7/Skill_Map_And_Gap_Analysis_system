/**
 * Skill_Map Theme & Interactive UI Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Dark Mode Initialization
  const currentTheme = localStorage.getItem('skill_map_theme') || 'light';
  document.documentElement.setAttribute('data-theme', currentTheme);
  
  const themeToggles = document.querySelectorAll('.theme-toggle-btn');
  themeToggles.forEach(btn => {
    btn.innerHTML = currentTheme === 'dark' ? '<i class="bi bi-sun-fill text-warning"></i>' : '<i class="bi bi-moon-stars-fill"></i>';
    btn.addEventListener('click', () => {
      const activeTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = activeTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('skill_map_theme', newTheme);
      btn.innerHTML = newTheme === 'dark' ? '<i class="bi bi-sun-fill text-warning"></i>' : '<i class="bi bi-moon-stars-fill"></i>';
    });
  });

  // 2. Sidebar Toggle
  const sidebarBtn = document.getElementById('sidebarToggleBtn');
  if (sidebarBtn) {
    sidebarBtn.addEventListener('click', () => {
      document.body.classList.toggle('sidebar-collapsed');
      document.body.classList.toggle('sidebar-open');
    });
  }

  // 3. User Profile Header Update
  const user = AuthManager.getUser();
  if (user) {
    const userNameEls = document.querySelectorAll('.user-display-name');
    const userRoleEls = document.querySelectorAll('.user-display-role');
    
    userNameEls.forEach(el => el.textContent = user.name || 'User');
    userRoleEls.forEach(el => el.textContent = user.role || 'Member');
  }
});
