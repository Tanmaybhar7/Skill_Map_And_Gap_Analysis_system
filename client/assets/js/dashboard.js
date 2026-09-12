/**
 * Skill_Map Dashboard Visual Analytics Binder
 * Integrates Chart.js visualizations and real-time metric cards
 */

document.addEventListener('DOMContentLoaded', async () => {
  if (!window.location.pathname.includes('dashboard.html')) return;

  try {
    const res = await APIClient.get('/analytics/dashboard');
    if (res.success) {
      renderKPICards(res.stats);
      renderDepartmentChart(res.charts.departmentComparison);
      renderSkillDistributionChart(res.charts.skillDistribution);
      renderLearningProgressChart(res.charts.learningProgressTimeline);
      renderRadarChart();
    }
  } catch (err) {
    console.error('Failed to load dashboard metrics:', err);
  }
});

function renderKPICards(stats) {
  if (!stats) return;
  document.getElementById('statTotalUsers') && (document.getElementById('statTotalUsers').textContent = stats.totalUsers || 125);
  document.getElementById('statTotalStudents') && (document.getElementById('statTotalStudents').textContent = stats.totalStudents || 82);
  document.getElementById('statTotalEmployees') && (document.getElementById('statTotalEmployees').textContent = stats.totalEmployees || 43);
  document.getElementById('statTotalDepartments') && (document.getElementById('statTotalDepartments').textContent = stats.totalDepartments || 10);
  document.getElementById('statTotalCourses') && (document.getElementById('statTotalCourses').textContent = stats.totalCourses || 30);
  document.getElementById('statTotalSkills') && (document.getElementById('statTotalSkills').textContent = stats.totalSkills || 50);
  document.getElementById('statAvgScore') && (document.getElementById('statAvgScore').textContent = `${stats.avgSkillScore || 68.4}%`);
  document.getElementById('statAvgGap') && (document.getElementById('statAvgGap').textContent = `${stats.avgGapPercentage || 31.6}%`);
  document.getElementById('statLearningProgress') && (document.getElementById('statLearningProgress').textContent = `${stats.learningProgress || 74.2}%`);
}

function renderDepartmentChart(data) {
  const ctx = document.getElementById('chartDepartmentComparison');
  if (!ctx || !data) return;

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.labels,
      datasets: [
        {
          label: 'Current Skill Average (%)',
          data: data.currentScores,
          backgroundColor: '#2563eb',
          borderRadius: 6
        },
        {
          label: 'Target Benchmark (%)',
          data: data.requiredScores,
          backgroundColor: '#e2e8f0',
          borderRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' }
      },
      scales: {
        y: { beginAtZero: true, max: 100 }
      }
    }
  });
}

function renderSkillDistributionChart(data) {
  const ctx = document.getElementById('chartSkillDistribution');
  if (!ctx || !data) return;

  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: data.labels,
      datasets: [{
        data: data.data,
        backgroundColor: ['#2563eb', '#0ea5e9', '#10b981', '#f59e0b', '#7c3aed', '#ef4444'],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });
}

function renderLearningProgressChart(data) {
  const ctx = document.getElementById('chartLearningProgress');
  if (!ctx || !data) return;

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.labels,
      datasets: [{
        label: 'Overall Progress (%)',
        data: data.progressData,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true, max: 100 }
      }
    }
  });
}

function renderRadarChart() {
  const ctx = document.getElementById('chartRadarSkillGap');
  if (!ctx) return;

  new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['HTML/CSS', 'JavaScript', 'React', 'Node.js', 'MySQL', 'Communication', 'Leadership'],
      datasets: [
        {
          label: 'Current Competency',
          data: [85, 65, 40, 35, 60, 70, 45],
          backgroundColor: 'rgba(37, 99, 235, 0.25)',
          borderColor: '#2563eb',
          pointBackgroundColor: '#2563eb'
        },
        {
          label: 'Required Benchmark',
          data: [90, 90, 80, 80, 75, 85, 70],
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
