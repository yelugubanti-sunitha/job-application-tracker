
const jobForm = document.getElementById("jobForm");
const jobContainer = document.getElementById("jobContainer");


document.addEventListener("DOMContentLoaded", loadJobs);


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
    resumeURL
  };

  saveJob(job);
  displayJob(job);

  jobForm.reset();
});


function saveJob(job) {
  let jobs = JSON.parse(localStorage.getItem("jobs")) || [];
  jobs.push(job);
  localStorage.setItem("jobs", JSON.stringify(jobs));
}


function loadJobs() {
  let jobs = JSON.parse(localStorage.getItem("jobs")) || [];
  jobs.forEach(displayJob);
}


function displayJob(job) {
  const jobCard = document.createElement("div");
  jobCard.className = "job-card";

  let statusColor = "";
  if (job.jobStatus === "Applied") statusColor = "blue";
  if (job.jobStatus === "Interview") statusColor = "orange";
  if (job.jobStatus === "Selected") statusColor = "green";
  if (job.jobStatus === "Rejected") statusColor = "red";

  let resumeHTML = "<p>No resume uploaded</p>";
  if (job.resumeName) {
    resumeHTML = `
      <p>
        Resume:
        <a href="${job.resumeURL}" target="_blank">View Resume</a>
      </p>
    `;
  }

  jobCard.innerHTML = `
    <h3>${job.companyName}</h3>
    <p><strong>Role:</strong> ${job.jobRole}</p>
    <p><strong>Status:</strong>
      <span style="color:${statusColor}; font-weight:bold;">
        ${job.jobStatus}
      </span>
    </p>
    ${resumeHTML}
    <button class="delete-btn">Delete</button>
  `;

  jobCard.querySelector(".delete-btn").addEventListener("click", function () {
    deleteJob(job);
    jobCard.remove();
  });

  jobContainer.appendChild(jobCard);
}


function deleteJob(jobToDelete) {
  let jobs = JSON.parse(localStorage.getItem("jobs")) || [];
  jobs = jobs.filter(job => job.companyName !== jobToDelete.companyName);
  localStorage.setItem("jobs", JSON.stringify(jobs));
}
