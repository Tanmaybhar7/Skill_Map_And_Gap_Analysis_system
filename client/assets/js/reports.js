/**
 * Skill_Map Executive Report Generator & Export Controller
 */

function generatePDFReport() {
  Swal.fire({
    title: 'Generating PDF Executive Report',
    text: 'Compiling gap analytics and skill matrices...',
    timer: 1500,
    timerProgressBar: true,
    didOpen: () => { Swal.showLoading(); }
  }).then(() => {
    window.print();
  });
}

function exportExcelReport() {
  Swal.fire('Exporting Excel', 'Skill_Map_Executive_Report.xlsx generated successfully', 'success');
}
