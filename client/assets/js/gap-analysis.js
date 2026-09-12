/**
 * Skill_Map Gap Analysis Engine Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  if (!document.getElementById('gapAnalysisView')) return;
  loadGapData();
});

async function loadGapData(userId = 3) {
  try {
    const res = await APIClient.get(`/gap/user/${userId}`);
    if (res.success) {
      renderGapOverviewCards(res);
      renderGapTable(res.gaps);
      renderGapRadarChart(res.gaps);
    }
  } catch (err) {
    console.error('Failed to load gap analysis:', err);
  }
}

function renderGapOverviewCards(data) {
  document.getElementById('gapOverallScore') && (document.getElementById('gapOverallScore').textContent = `${data.overallSkillScore}%`);
  document.getElementById('gapOverallGap') && (document.getElementById('gapOverallGap').textContent = `${data.overallGapPercentage}%`);
  document.getElementById('gapCriticalCount') && (document.getElementById('gapCriticalCount').textContent = data.criticalCount);
  document.getElementById('gapMediumCount') && (document.getElementById('gapMediumCount').textContent = data.mediumCount);
}

function renderGapTable(gaps) {
  const tbody = document.querySelector('#gapReportTable tbody');
  if (!tbody || !gaps) return;

  tbody.innerHTML = '';
  gaps.forEach(g => {
    const tr = document.createElement('tr');
    const badgeClass = g.priority === 'Critical' ? 'badge-critical' : (g.priority === 'Medium' ? 'badge-medium' : 'badge-low');
    const progressColor = g.priority === 'Critical' ? 'bg-danger' : (g.priority === 'Medium' ? 'bg-warning' : 'bg-success');

    tr.innerHTML = `
      <td class="fw-bold">${g.skill_name}</td>
      <td><span class="badge bg-secondary">${g.category || 'Technical'}</span></td>
      <td class="text-center fw-semibold text-primary">${g.current_score}%</td>
      <td class="text-center fw-semibold text-secondary">${g.required_score}%</td>
      <td class="text-center fw-bold text-danger">${g.gap_score} (${g.gap_percentage}%)</td>
      <td class="text-center"><span class="${badgeClass}">${g.priority}</span></td>
      <td style="width: 160px;">
        <div class="progress" style="height: 8px;">
          <div class="progress-bar ${progressColor}" role="progressbar" style="width: ${g.current_score}%"></div>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function renderGapRadarChart(gaps) {
  const ctx = document.getElementById('chartGapRadar');
  if (!ctx || !gaps) return;

  const labels = gaps.map(g => g.skill_name);
  const currentScores = gaps.map(g => g.current_score);
  const requiredScores = gaps.map(g => g.required_score);

  if (window.gapRadarChartInstance) {
    window.gapRadarChartInstance.destroy();
  }

  window.gapRadarChartInstance = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Current Skill Level',
          data: currentScores,
          backgroundColor: 'rgba(37, 99, 235, 0.25)',
          borderColor: '#2563eb',
          pointBackgroundColor: '#2563eb'
        },
        {
          label: 'Required Benchmark',
          data: requiredScores,
          backgroundColor: 'rgba(14, 165, 233, 0.15)',
          borderColor: '#0ea5e9',
          pointBackgroundColor: '#0ea5e9'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: { min: 0, max: 100 }
      }
    }
  });
}
