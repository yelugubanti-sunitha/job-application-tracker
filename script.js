const jobForm = document.getElementById("jobForm");
const jobContainer = document.getElementById("jobContainer");
const searchInput = document.getElementById("searchInput");
const filterButtons = document.querySelectorAll(".filter-btn");
const exportBtn = document.getElementById("exportBtn");
const clearAllBtn = document.getElementById("clearAllBtn");
const darkModeToggle = document.getElementById("darkModeToggle");

document.addEventListener("DOMContentLoaded", loadJobs);
searchInput.addEventListener("keyup", searchJobs);
exportBtn.addEventListener("click", exportToCSV);
clearAllBtn.addEventListener("click", clearAllJobs);
darkModeToggle.addEventListener("click", toggleDarkMode);

filterButtons.forEach(button => {
  button.addEventListener("click", function () {
    filterJobs(this.dataset.status);
  });
});

jobForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const companyName = document.getElementById("company").value;
  const jobRole = document.getElementById("role").value;
  const jobStatus = document.getElementById("status").value;
  const resumeFile = document.getElementById("resume").files[0];

  let resumeName = "";
  let resumeURL = "";

  if (resumeFile) {
    resumeName = resumeFile.name;
    resumeURL = URL.createObjectURL(resumeFile);
  }

  const job = {
    companyName,
    jobRole,
    jobStatus,
    resumeName,
    resumeURL,
    date: new Date().toLocaleDateString()  
  };

  saveJob(job);
  displayJob(job);
  updateDashboard();
  checkEmptyState();

  jobForm.reset();
});

function saveJob(job) {
  let jobs = JSON.parse(localStorage.getItem("jobs")) || [];
  jobs.push(job);
  localStorage.setItem("jobs", JSON.stringify(jobs));
}


function loadJobs() {
  let jobs = JSON.parse(localStorage.getItem("jobs")) || [];

  jobs.reverse().forEach(displayJob);

  updateDashboard();
  checkEmptyState();
}

function displayJob(job) {

  const row = document.createElement("tr");

  let statusBadge = "";

 if (job.jobStatus === "Applied") {
  statusBadge = `<span class="badge text-bg-light border">Applied</span>`;
}

if (job.jobStatus === "Interview") {
  statusBadge = `<span class="badge bg-warning-subtle text-dark">Interview</span>`;
}

if (job.jobStatus === "Rejected") {
  statusBadge = `<span class="badge bg-danger-subtle text-dark">Rejected</span>`;
}

if (job.jobStatus === "Selected") {
  statusBadge = `<span class="badge bg-success-subtle text-dark">Selected</span>`;
}
 

  let resumeHTML = "No Resume";

if (job.resumeName) {
  resumeHTML = `
    <div class="d-flex flex-column">
      <span>${job.resumeName}</span>
      <a href="${job.resumeURL}" download class="download-link">Download</a>
    </div>
  `;
}

  row.innerHTML = `
    <td>${job.companyName}</td>
    <td>${job.jobRole}</td>
    <td>${statusBadge}</td>
    <td>${resumeHTML}</td>
    <td>${job.date}</td>   
    <td class="text-nowrap">
  <button class="btn btn-sm btn-warning edit-btn">Edit</button>
  <button class="btn btn-sm btn-danger delete-btn">Delete</button>
</td>
  `;

  row.querySelector(".delete-btn").addEventListener("click", function () {

    const confirmDelete = confirm("Are you sure you want to delete this job?");

    if (confirmDelete) {
      deleteJob(job);
      row.remove();
      updateDashboard();
      checkEmptyState();
    }

  });

  row.querySelector(".edit-btn").addEventListener("click", function () {

    document.getElementById("company").value = job.companyName;
    document.getElementById("role").value = job.jobRole;
    document.getElementById("status").value = job.jobStatus;

    deleteJob(job);
    row.remove();

  });

  jobContainer.appendChild(row);
}

function deleteJob(jobToDelete) {
  let jobs = JSON.parse(localStorage.getItem("jobs")) || [];

  jobs = jobs.filter(job => job.companyName !== jobToDelete.companyName);

  localStorage.setItem("jobs", JSON.stringify(jobs));
}

function updateDashboard() {

let jobs = JSON.parse(localStorage.getItem("jobs")) || [];

let applied = jobs.filter(job => job.jobStatus === "Applied").length;
let interview = jobs.filter(job => job.jobStatus === "Interview").length;
let selected = jobs.filter(job => job.jobStatus === "Selected").length;
let rejected = jobs.filter(job => job.jobStatus === "Rejected").length;

let total = jobs.length || 1;

document.getElementById("totalCount").textContent = jobs.length;
document.getElementById("appliedCount").textContent = applied;
document.getElementById("interviewCount").textContent = interview;
document.getElementById("selectedCount").textContent = selected;
document.getElementById("rejectedCount").textContent = rejected;

document.getElementById("appliedBar").style.width = (applied / total * 100) + "%";
document.getElementById("interviewBar").style.width = (interview / total * 100) + "%";
document.getElementById("selectedBar").style.width = (selected / total * 100) + "%";
document.getElementById("rejectedBar").style.width = (rejected / total * 100) + "%";
renderChart();
}

function checkEmptyState() {

  let jobs = JSON.parse(localStorage.getItem("jobs")) || [];

  const emptyMessage = document.getElementById("emptyMessage");

  if (jobs.length === 0) {
    emptyMessage.style.display = "block";
  } else {
    emptyMessage.style.display = "none";
  }

}

function searchJobs() {

  const searchValue = searchInput.value.toLowerCase();

  const rows = jobContainer.querySelectorAll("tr");

  rows.forEach(row => {

    const company = row.children[0].textContent.toLowerCase();
    const role = row.children[1].textContent.toLowerCase();

    if (company.includes(searchValue) || role.includes(searchValue)) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }

  });

}

function filterJobs(status) {

  const rows = jobContainer.querySelectorAll("tr");

  rows.forEach(row => {

    const jobStatus = row.children[2].textContent.trim();

    if (status === "All" || jobStatus.includes(status)) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }

  });

}

function exportToCSV() {

  let jobs = JSON.parse(localStorage.getItem("jobs")) || [];

  if (jobs.length === 0) {
    alert("No data to export");
    return;
  }

  let csv = "Company,Role,Status,Resume,Date\n";

  jobs.forEach(job => {

    csv += `${job.companyName},${job.jobRole},${job.jobStatus},${job.resumeName || "No Resume"},${job.date}\n`;

  });

  const blob = new Blob([csv], { type: "text/csv" });

  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "job_applications.csv";

  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);

}

function clearAllJobs() {

  const confirmClear = confirm("Are you sure you want to delete all applications?");

  if (!confirmClear) return;

  localStorage.removeItem("jobs");

  jobContainer.innerHTML = "";

  updateDashboard();
  checkEmptyState();

}

function toggleDarkMode() {

  document.body.classList.toggle("dark-mode");

}


let chart;

function renderChart() {

let jobs = JSON.parse(localStorage.getItem("jobs")) || [];

let applied = jobs.filter(job => job.jobStatus === "Applied").length;
let interview = jobs.filter(job => job.jobStatus === "Interview").length;
let selected = jobs.filter(job => job.jobStatus === "Selected").length;
let rejected = jobs.filter(job => job.jobStatus === "Rejected").length;

const data = {
labels: ["Applied", "Interview", "Selected", "Rejected"],
datasets: [{
data: [applied, interview, selected, rejected],
backgroundColor: [
"#facc15",
"#38bdf8",
"#4ade80",
"#f87171"
]
}]
};

const config = {
type: "pie",
data: data
};

if(chart){
chart.destroy();
}

chart = new Chart(
document.getElementById("statusChart"),
config
);

}