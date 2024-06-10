let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let selectedDate = null;

// Load saved data from localStorage
loadSavedData();
// Load job data for the initial month
loadJobData();

function renderCalendar() {
  const calendarTable = document.getElementById("calendarTable");
  const calendarBody = document.getElementById("calendarBody");
  const monthYearHeader = document.getElementById("monthYearHeader");

  // Clear previous content
  calendarBody.innerHTML = "";

  // Get the first day of the month
  const firstDay = new Date(currentYear, currentMonth, 1);
  const startingDay = firstDay.getDay();

  // Get the last day of the month
  const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Create cells for the days
  let dayCount = 1;
  for (let i = 0; i < 6; i++) {
    const row = document.createElement("tr");

    for (let j = 0; j < 7; j++) {
      const cell = document.createElement("td");

      if ((i === 0 && j < startingDay) || dayCount > lastDay) {
        cell.textContent = "";
      } else {
        cell.textContent = dayCount;
        cell.addEventListener("click", function () {
          selectedDate = new Date(
            currentYear,
            currentMonth,
            parseInt(cell.textContent)
          );
          showJobForm();
        });
        dayCount++;
      }

      row.appendChild(cell);
    }

    calendarBody.appendChild(row);
  }

  // Update the month-year header
  const monthNames = [
    "Siječanj",
    "Veljača",
    "Ožujak",
    "Travanj",
    "Svibanj",
    "Lipanj",
    "Srpanj",
    "Kolovoz",
    "Rujan",
    "Listopad",
    "Studeni",
    "Prosinac",
  ];
  monthYearHeader.textContent = `${monthNames[currentMonth]} ${currentYear}`;
}

function prevMonth() {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  renderCalendar();
  loadJobData();
}

function nextMonth() {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  renderCalendar();
  loadJobData();
}

function showJobForm() {
  const jobForm = document.getElementById("jobForm");
  jobForm.style.display = "block";
}

function addJob() {
  const startTimeInput = document.getElementById("startTime");
  const endTimeInput = document.getElementById("endTime");
  const locationInput = document.getElementById("location");
  const userNotesInput = document.getElementById("userNotes");

  const startTime = startTimeInput.value;
  const endTime = endTimeInput.value;
  const location = locationInput.value;
  const userNotes = userNotesInput.value;

  if (!startTime || !endTime || !location || !selectedDate) {
    alert("Molimo unesite sve podatke.");
    return;
  }

  const startDateTime = new Date(selectedDate);
  const [startHours, startMinutes] = startTime.split(":").map(Number);
  startDateTime.setHours(startHours, startMinutes);

  const endDateTime = new Date(selectedDate);
  const [endHours, endMinutes] = endTime.split(":").map(Number);
  endDateTime.setHours(endHours, endMinutes);

  const totalHours = ((endDateTime - startDateTime) / (1000 * 60 * 60)).toFixed(
    2
  );

  const jobTableBody = document.getElementById("jobTableBody");
  const newRow = jobTableBody.insertRow();

  newRow.insertCell().textContent = selectedDate.toLocaleDateString();
  newRow.insertCell().textContent = startTime;
  newRow.insertCell().textContent = endTime;
  newRow.insertCell().textContent = totalHours;
  newRow.insertCell().textContent = location;
  newRow.insertCell().textContent = userNotes;

  // Add delete button
  const deleteButtonCell = newRow.insertCell();
  const deleteButton = document.createElement("button");
  deleteButton.textContent = "Delete";
  deleteButton.addEventListener("click", function () {
    deleteJob(deleteButton);
  });
  deleteButtonCell.appendChild(deleteButton);

  saveJobData();

  startTimeInput.value = "";
  endTimeInput.value = "";
  locationInput.value = "";
  userNotesInput.value = "";
  selectedDate = null;

  document.getElementById("jobForm").style.display = "none";
  calculateTotalHours();
}

function calculateTotalHours() {
  const jobTableBody = document.getElementById("jobTableBody");
  const rows = jobTableBody.rows;
  let totalHours = 0;

  for (let i = 0; i < rows.length; i++) {
    const cells = rows[i].cells;
    totalHours += parseFloat(cells[3].textContent);
  }

  document.getElementById(
    "totalHoursCell"
  ).textContent = `Ukupno sati: ${totalHours.toFixed(2)}`;
}

function deleteJob(button) {
  const row = button.parentElement.parentElement;
  row.remove();
  saveJobData();
  calculateTotalHours();
}

function saveJobData() {
  const jobTableBody = document.getElementById("jobTableBody");
  const rows = jobTableBody.rows;
  const jobs = [];

  for (let i = 0; i < rows.length; i++) {
    const cells = rows[i].cells;
    const job = {
      date: cells[0].textContent,
      startTime: cells[1].textContent,
      endTime: cells[2].textContent,
      totalHours: cells[3].textContent,
      location: cells[4].textContent,
      userNotes: cells[5].textContent,
    };
    jobs.push(job);
  }

  const data = {
    currentMonth: currentMonth,
    currentYear: currentYear,
    jobs: jobs,
  };

  localStorage.setItem("workHoursData", JSON.stringify(data));
}

function loadJobData() {
  const data = JSON.parse(localStorage.getItem("workHoursData"));
  if (
    !data ||
    data.currentMonth !== currentMonth ||
    data.currentYear !== currentYear
  ) {
    return;
  }

  const jobTableBody = document.getElementById("jobTableBody");
  jobTableBody.innerHTML = "";

  for (const job of data.jobs) {
    const newRow = jobTableBody.insertRow();

    newRow.insertCell().textContent = job.date;
    newRow.insertCell().textContent = job.startTime;
    newRow.insertCell().textContent = job.endTime;
    newRow.insertCell().textContent = job.totalHours;
    newRow.insertCell().textContent = job.location;
    newRow.insertCell().textContent = job.userNotes;

    const deleteButtonCell = newRow.insertCell();
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", function () {
      deleteJob(deleteButton);
    });
    deleteButtonCell.appendChild(deleteButton);
  }

  calculateTotalHours();
}

function loadSavedData() {
  const data = JSON.parse(localStorage.getItem("workHoursData"));
  if (data) {
    currentMonth = data.currentMonth;
    currentYear = data.currentYear;
  }
  renderCalendar();
}

function exportToExcel() {
  const jobTable = document.getElementById("jobTable");
  const workbook = XLSX.utils.table_to_book(jobTable, { sheet: "Sheet1" });
  XLSX.writeFile(workbook, "work_hours.xlsx");
}
