/**
 * Skill_Map Dynamic Certificate Renderer & Generator
 */

document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('certificateCanvas')) return;
  renderCertificate('Rahul Sharma', 'Web Development Masterclass', 'CERT-2026-CS101-001', '92.5%');
});

function renderCertificate(recipientName, courseTitle, certNo, score) {
  const canvas = document.getElementById('certificateCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  canvas.width = 800;
  canvas.height = 560;

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Outer Border
  ctx.strokeStyle = '#2563eb';
  ctx.lineWidth = 12;
  ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

  // Inner Gold Border
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 3;
  ctx.strokeRect(32, 32, canvas.width - 64, canvas.height - 64);

  // Header Title
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 28px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('CERTIFICATE OF COMPETENCY', canvas.width / 2, 90);

  ctx.fillStyle = '#64748b';
  ctx.font = '16px Inter, sans-serif';
  ctx.fillText('THIS IS PROUDLY PRESENTED TO', canvas.width / 2, 140);

  // Recipient Name
  ctx.fillStyle = '#2563eb';
  ctx.font = 'bold 36px Inter, sans-serif';
  ctx.fillText(recipientName, canvas.width / 2, 200);

  // Description
  ctx.fillStyle = '#0f172a';
  ctx.font = '16px Inter, sans-serif';
  ctx.fillText(`For successfully demonstrating proficiency in`, canvas.width / 2, 250);

  ctx.fillStyle = '#059669';
  ctx.font = 'bold 24px Inter, sans-serif';
  ctx.fillText(courseTitle, canvas.width / 2, 290);

  ctx.fillStyle = '#64748b';
  ctx.font = '15px Inter, sans-serif';
  ctx.fillText(`Achieved Competency Score: ${score}`, canvas.width / 2, 330);

  // Certificate Number
  ctx.fillStyle = '#94a3b8';
  ctx.font = '13px monospace';
  ctx.fillText(`Certificate No: ${certNo}`, canvas.width / 2, 400);

  // Signatures
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 16px Inter, sans-serif';
  ctx.fillText('Dr. Aris Thorne', 200, 480);
  ctx.font = '12px Inter, sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText('Director of Skill Intelligence', 200, 500);

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 16px Inter, sans-serif';
  ctx.fillText('Prof. Tanmay Vai', 600, 480);
  ctx.font = '12px Inter, sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText('Chief Academic Evaluator', 600, 500);
}
