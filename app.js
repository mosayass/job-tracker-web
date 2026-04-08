const STORAGE_KEY = 'job_tracker_data';

const saveToStorage = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
};

const loadFromStorage = () => {
    const data = localStorage.getItem(STORAGE_KEY);
    jobs = data ? JSON.parse(data) : [];
};

// 1. In-Memory State
let jobs = [];


// 2. DOM Selectors
const listView = document.getElementById('list-view');
const formView = document.getElementById('form-view');
const jobListContainer = document.getElementById('job-list-container');
const jobForm = document.getElementById('job-form');

// Buttons
const navAddBtn = document.getElementById('nav-add-btn');
const cancelBtn = document.getElementById('cancel-btn');

// 3. View Management (Toggling)
const showListView = () => {
    formView.style.display = 'none';
    listView.style.display = 'block';
    navAddBtn.style.display = 'block';
    renderJobs();
};

const showFormView = () => {
    listView.style.display = 'none';
    formView.style.display = 'block';
    navAddBtn.style.display = 'none';
    jobForm.reset();
};

// 4. Rendering Engine (UI Generation)
const renderJobs = () => {
    // Clear current UI
    jobListContainer.innerHTML = '';

    if (jobs.length === 0) {
        jobListContainer.innerHTML = '<p class="empty-state">No jobs yet. Click "+ Add Job" to start.</p>';
        updateStats();
        return;
    }

    // Build Fragment for performance (similar to a batch UI update)
    const fragment = document.createDocumentFragment();

    jobs.forEach((job, index) => {
        const card = document.createElement('div');
        card.className = 'job-card';
        card.innerHTML = `
            <img class="company-logo" src="https://www.google.com/s2/favicons?domain=${new URL(job.url).hostname}&sz=64" alt="${job.company}">
            <div class="job-info">
                <h3>${job.title}</h3>
                <p>${job.company}</p>
            </div>
            <select class="status-badge status-${job.status.toLowerCase()}" data-index="${index}">
                <option value="Applied" ${job.status === 'Applied' ? 'selected' : ''}>Applied</option>
                <option value="Interview" ${job.status === 'Interview' ? 'selected' : ''}>Interview</option>
                <option value="Accepted" ${job.status === 'Accepted' ? 'selected' : ''}>Accepted</option>
                <option value="Rejected" ${job.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
            </select>
            <button class="delete-btn" data-index="${index}" style="background:none; border:none; cursor:pointer; margin-left:10px;">🗑️</button>
        `;
        fragment.appendChild(card);
    });

    jobListContainer.appendChild(fragment);
    updateStats();
};

// Placeholder for Stats logic
const updateStats = () => {
    const counts = { Applied: 0, Interview: 0, Accepted: 0 };
    jobs.forEach(j => counts[j.status]++);
    
    document.getElementById('stat-applied').textContent = counts.Applied;
    document.getElementById('stat-interview').textContent = counts.Interview;
    document.getElementById('stat-accepted').textContent = counts.Accepted;
};

// 5. Event Listeners
navAddBtn.addEventListener('click', showFormView);
cancelBtn.addEventListener('click', showListView);

jobForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const newJob = {
        id: Date.now(), // Unique ID for future CRUD ops
        title: document.getElementById('job-title').value,
        company: document.getElementById('company-name').value,
        url: document.getElementById('job-url').value,
        status: 'Applied' // Default starting status
    };

    jobs.push(newJob);
    saveToStorage();
    showListView();
});

jobListContainer.addEventListener('click', (e) => {
    const index = e.target.dataset.index;

    // Handle Delete
    if (e.target.classList.contains('delete-btn')) {
        if (confirm('Delete this job?')) {
            jobs.splice(index, 1);
            saveToStorage();
            renderJobs();
        }
    }
});

jobListContainer.addEventListener('change', (e) => {
    // Handle Status Change
    if (e.target.classList.contains('status-badge')) {
        const index = e.target.dataset.index;
        jobs[index].status = e.target.value;
        saveToStorage();
        renderJobs(); // Re-render to update badge color and stats
    }
});

loadFromStorage();
showListView();