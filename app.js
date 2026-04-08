// JobRepository: Encapsulates all Data Access Logic (DAL)
const JobRepository = {
    STORAGE_KEY: 'job_tracker_pro_data',

    // READ: Get all jobs
    getAll() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    },

    // CREATE: Add a new job with validation
    add(job) {
        const jobs = this.getAll();
        jobs.push({
            ...job,
            id: crypto.randomUUID(), // Better than Date.now()
            createdAt: new Date().toISOString()
        });
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(jobs));
    },

    // UPDATE: Update a specific job field
    update(id, updatedFields) {
        let jobs = this.getAll();
        jobs = jobs.map(job => job.id === id ? { ...job, ...updatedFields } : job);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(jobs));
    },

    // DELETE: Remove job
    delete(id) {
        let jobs = this.getAll();
        jobs = jobs.filter(job => job.id !== id);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(jobs));
    },

    // VALIDATION: Utility for URL integrity
    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }
};



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
const renderJobs = (filterText = '') => {
    let jobs = JobRepository.getAll(); // Fetch from DAL
    if (filterText) {//search& filter functionality
        const query = filterText.toLowerCase();
        jobs = jobs.filter(job => 
            job.company.toLowerCase().includes(query) || 
            job.title.toLowerCase().includes(query)
        );
    }

    jobListContainer.innerHTML = '';
    
    if (jobs.length === 0) {
        jobListContainer.innerHTML = '<p class="empty-state">No jobs yet. Click "+ Add Job" to start.</p>';
        updateStats(jobs);
        return;
    }
    updateStats(jobs);

    const fragment = document.createDocumentFragment();

    jobs.forEach((job) => {
        const card = document.createElement('div');
        card.className = 'job-card';
        card.innerHTML = `
            <img class="company-logo" src="https://www.google.com/s2/favicons?domain=${new URL(job.url).hostname}&sz=64" alt="${job.company}">
            <div class="job-info">
                <h3>${job.title}</h3>
                <p>${job.company}</p>
            </div>
            <select class="status-badge status-${job.status.toLowerCase()}" data-id="${job.id}">
                <option value="Applied" ${job.status === 'Applied' ? 'selected' : ''}>Applied</option>
                <option value="Interview" ${job.status === 'Interview' ? 'selected' : ''}>Interview</option>
                <option value="Accepted" ${job.status === 'Accepted' ? 'selected' : ''}>Accepted</option>
                <option value="Rejected" ${job.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
            </select>
            <button class="delete-btn" data-id="${job.id}" style="background:none; border:none; cursor:pointer; margin-left:10px;">🗑️</button>
        `;
        fragment.appendChild(card);
    });

    jobListContainer.appendChild(fragment);
};
 

const updateStats = (jobsData) => {
    const counts = { Applied: 0, Interview: 0, Accepted: 0 };
    jobsData.forEach(j => {
        if (counts[j.status] !== undefined) counts[j.status]++;
    });
    
    document.getElementById('stat-applied').textContent = counts.Applied;
    document.getElementById('stat-interview').textContent = counts.Interview;
    document.getElementById('stat-accepted').textContent = counts.Accepted;
};

// Event Listeners
navAddBtn.addEventListener('click', showFormView);
cancelBtn.addEventListener('click', showListView);

jobForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const urlInput = document.getElementById('job-url').value;

    // Validation Challenge: Ensuring data integrity
    if (!JobRepository.isValidUrl(urlInput)) {
        alert("Please enter a valid URL (e.g., https://google.com)");
        return;
    }

    const newJob = {
        title: document.getElementById('job-title').value,
        company: document.getElementById('company-name').value,
        url: urlInput,
        status: 'Applied'
    };

    JobRepository.add(newJob); // DAL Call
    showListView();
});

jobListContainer.addEventListener('click', (e) => {
    const id = e.target.dataset.id;
    if (e.target.classList.contains('delete-btn')) {
        if (confirm('Delete this job?')) {
            JobRepository.delete(id);
            renderJobs();
        }
    }
});

jobListContainer.addEventListener('change', (e) => {
    if (e.target.classList.contains('status-badge')) {
        const id = e.target.dataset.id;
        JobRepository.update(id, { status: e.target.value });
        renderJobs();
    }
});
const searchInput = document.getElementById('search-input');

searchInput.addEventListener('input', (e) => {
    renderJobs(e.target.value);
});

showListView();