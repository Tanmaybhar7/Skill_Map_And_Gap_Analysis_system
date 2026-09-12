/**
 * Skill_Map User Management Module Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('usersTable')) return;
  loadUsers();

  const userForm = document.getElementById('userForm');
  if (userForm) {
    userForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = {
        name: document.getElementById('userName').value,
        email: document.getElementById('userEmail').value,
        role: document.getElementById('userRole').value,
        department_id: document.getElementById('userDepartment').value,
        designation: document.getElementById('userDesignation').value
      };

      try {
        const res = await APIClient.post('/users', formData);
        if (res.success) {
          Swal.fire('Success', res.message, 'success');
          bootstrap.Modal.getInstance(document.getElementById('addUserModal')).hide();
          userForm.reset();
          loadUsers();
        }
      } catch (err) {
        Swal.fire('Error', err.message || 'Failed to add user', 'error');
      }
    });
  }
});

async function loadUsers() {
  const tbody = document.querySelector('#usersTable tbody');
  if (!tbody) return;

  try {
    const res = await APIClient.get('/users');
    if (res.success && res.users) {
      tbody.innerHTML = '';
      res.users.forEach((u, i) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><strong>${u.user_code || `SM${1001 + i}`}</strong></td>
          <td>
            <div class="d-flex align-items-center">
              <div class="avatar-circle me-2 bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style="width:36px; height:36px; font-weight:700;">
                ${u.name ? u.name.charAt(0) : 'U'}
              </div>
              <div>
                <div class="fw-bold">${u.name}</div>
                <small class="text-muted">${u.email}</small>
              </div>
            </div>
          </td>
          <td><span class="badge ${u.role === 'Admin' ? 'bg-danger' : (u.role === 'Faculty' ? 'bg-primary' : 'bg-info')}">${u.role}</span></td>
          <td>${u.department_name || 'Computer Science'}</td>
          <td>${u.designation || 'Scholar / Engineer'}</td>
          <td class="text-end">
            <button class="btn btn-sm btn-outline-primary me-1" onclick="editUser(${u.id})"><i class="bi bi-pencil"></i></button>
            <button class="btn btn-sm btn-outline-danger" onclick="deleteUser(${u.id})"><i class="bi bi-trash"></i></button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    }
  } catch (err) {
    console.error('Failed to load users:', err);
  }
}

async function deleteUser(id) {
  const confirm = await Swal.fire({
    title: 'Delete User Account?',
    text: 'This action cannot be undone.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    confirmButtonText: 'Yes, Delete'
  });

  if (confirm.isConfirmed) {
    try {
      const res = await APIClient.delete(`/users/${id}`);
      if (res.success) {
        Swal.fire('Deleted!', res.message, 'success');
        loadUsers();
      }
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    }
  }
}

function exportUsersCSV() {
  window.location.href = `${API_BASE_URL}/users/export-csv`;
}
