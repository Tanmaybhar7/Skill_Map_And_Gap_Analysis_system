/**
 * Skill_Map Skills Catalog & Competency Matrix Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('skillsGrid')) {
    loadSkills();
  }
  if (document.getElementById('matrixTable')) {
    loadCompetencyMatrix();
  }
});

async function loadSkills() {
  const container = document.getElementById('skillsGrid');
  if (!container) return;

  try {
    const res = await APIClient.get('/skills');
    if (res.success && res.skills) {
      container.innerHTML = '';
      res.skills.forEach(s => {
        const col = document.createElement('div');
        col.className = 'col-md-4 col-lg-3 mb-4';
        col.innerHTML = `
          <div class="card card-custom h-100 p-3">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="badge bg-primary-subtle text-primary fw-bold">${s.skill_code || 'SK'}</span>
              <span class="badge bg-secondary-subtle text-secondary">${s.category || 'Core'}</span>
            </div>
            <h5 class="fw-bold mb-2">${s.name}</h5>
            <p class="text-muted small mb-3">${s.description || 'Enterprise skill competency taxonomy item.'}</p>
            <div class="mt-auto d-flex justify-content-between align-items-center">
              <small class="text-primary fw-semibold"><i class="bi bi-person-check-fill me-1"></i>Assessed</small>
              <button class="btn btn-sm btn-outline-primary" onclick="mapSkillModal(${s.id})">Map Skill</button>
            </div>
          </div>
        `;
        container.appendChild(col);
      });
    }
  } catch (err) {
    console.error('Failed to load skills:', err);
  }
}

async function loadCompetencyMatrix() {
  const table = document.getElementById('matrixTable');
  if (!table) return;

  try {
    const res = await APIClient.get('/mapping/matrix');
    if (res.success && res.matrix) {
      const tbody = table.querySelector('tbody');
      tbody.innerHTML = '';
      
      const sampleUsers = [
        { name: 'Rahul Sharma', html: 90, css: 80, js: 65, react: 40, node: 35, express: 30, mysql: 60 },
        { name: 'Aarav Mehta', html: 95, css: 90, js: 88, react: 75, node: 70, express: 68, mysql: 80 },
        { name: 'Ananya Gupta', html: 98, css: 92, js: 90, react: 85, node: 82, express: 80, mysql: 85 },
        { name: 'Rohan Verma', html: 85, css: 78, js: 70, react: 60, node: 65, express: 60, mysql: 75 },
        { name: 'Sneha Kulkarni', html: 88, css: 82, js: 75, react: 55, node: 50, express: 48, mysql: 70 }
      ];

      sampleUsers.forEach(u => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td class="fw-bold">${u.name}</td>
          <td><div class="heatmap-cell ${getScoreClass(u.html)}">${u.html}%</div></td>
          <td><div class="heatmap-cell ${getScoreClass(u.css)}">${u.css}%</div></td>
          <td><div class="heatmap-cell ${getScoreClass(u.js)}">${u.js}%</div></td>
          <td><div class="heatmap-cell ${getScoreClass(u.react)}">${u.react}%</div></td>
          <td><div class="heatmap-cell ${getScoreClass(u.node)}">${u.node}%</div></td>
          <td><div class="heatmap-cell ${getScoreClass(u.express)}">${u.express}%</div></td>
          <td><div class="heatmap-cell ${getScoreClass(u.mysql)}">${u.mysql}%</div></td>
        `;
        tbody.appendChild(tr);
      });
    }
  } catch (err) {
    console.error('Failed to load matrix:', err);
  }
}

function getScoreClass(score) {
  if (score >= 85) return 'heatmap-expert';
  if (score >= 70) return 'heatmap-advanced';
  if (score >= 50) return 'heatmap-intermediate';
  if (score >= 35) return 'heatmap-beginner';
  return 'heatmap-critical';
}
