/**
 * Skill_Map Automated Learning Recommendations Module
 */

document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('recommendationsView')) return;
  loadRecommendations();
});

async function loadRecommendations(userId = 3) {
  const container = document.getElementById('recommendationsList');
  if (!container) return;

  try {
    const res = await APIClient.get(`/recommendations/user/${userId}`);
    if (res.success && res.recommendations) {
      container.innerHTML = '';
      res.recommendations.forEach(r => {
        const badgeClass = r.priority === 'Critical' ? 'badge-critical' : (r.priority === 'Medium' ? 'badge-medium' : 'badge-low');
        const card = document.createElement('div');
        card.className = 'col-md-6 col-lg-4 mb-4';
        card.innerHTML = `
          <div class="card card-custom h-100 p-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <span class="badge bg-primary-subtle text-primary fw-bold"><i class="bi bi-journal-bookmark-fill me-1"></i>${r.resource_type || 'Course'}</span>
              <span class="${badgeClass}">${r.priority} Priority</span>
            </div>
            <h5 class="fw-bold mb-2">${r.resource_title || 'Recommended Learning Resource'}</h5>
            <p class="text-muted small mb-3">Target Skill: <strong class="text-primary">${r.skill_name}</strong></p>
            <div class="mb-3 d-flex align-items-center text-muted small">
              <i class="bi bi-clock me-2"></i>Est. Duration: ${r.est_hours || 20} Hours
            </div>
            <div class="mt-auto d-flex justify-content-between align-items-center">
              <span class="badge bg-success-subtle text-success">${r.status || 'Assigned'}</span>
              <a href="${r.url_or_ref || '#'}" target="_blank" class="btn btn-sm btn-primary">Start Course <i class="bi bi-arrow-right ms-1"></i></a>
            </div>
          </div>
        `;
        container.appendChild(card);
      });
    }
  } catch (err) {
    console.error('Failed to load recommendations:', err);
  }
}
