const issuesContainer = document.getElementById("issues-container");

const totalIssuesElement = document.getElementById("total-issues");
const openIssuesElement = document.getElementById("open-issues");
const inProgressIssuesElement = document.getElementById(
    "in-progress-issues"
);
const criticalIssuesElement = document.getElementById("critical-issues");
const resolvedIssuesElement = document.getElementById("resolved-issues");

const issueFormSection = document.getElementById("issue-form-section");
const issueForm = document.getElementById("issue-form");
const formMessage = document.getElementById("form-message");

const openFormButton = document.getElementById("open-form-button");
const closeFormButton = document.getElementById("close-form-button");

const searchInput = document.getElementById("search-input");
const statusFilter = document.getElementById("status-filter");
const priorityFilter = document.getElementById("priority-filter");
const clearFiltersButton = document.getElementById(
    "clear-filters-button"
);


async function loadDashboard() {
    try {
        const response = await fetch("/api/dashboard");

        if (!response.ok) {
            throw new Error("Unable to load dashboard data.");
        }

        const dashboard = await response.json();

        totalIssuesElement.textContent = dashboard.total_issues;
        openIssuesElement.textContent = dashboard.open_issues;
        inProgressIssuesElement.textContent =
            dashboard.in_progress_issues;
        criticalIssuesElement.textContent = dashboard.critical_issues;
        resolvedIssuesElement.textContent = dashboard.resolved_issues;
    } catch (error) {
        console.error(error);
    }
}


function buildIssueQuery() {
    const queryParameters = new URLSearchParams();

    const searchValue = searchInput.value.trim();
    const statusValue = statusFilter.value;
    const priorityValue = priorityFilter.value;

    if (searchValue) {
        queryParameters.set("search", searchValue);
    }

    if (statusValue) {
        queryParameters.set("status", statusValue);
    }

    if (priorityValue) {
        queryParameters.set("priority", priorityValue);
    }

    const queryString = queryParameters.toString();

    return queryString
        ? `/api/issues?${queryString}`
        : "/api/issues";
}


async function loadIssues() {
    issuesContainer.innerHTML = "<p>Loading issues...</p>";

    try {
        const response = await fetch(buildIssueQuery());

        if (!response.ok) {
            throw new Error("Unable to load operational issues.");
        }

        const issues = await response.json();

        renderIssues(issues);
    } catch (error) {
        issuesContainer.innerHTML = `
            <p class="error-state">
                ${escapeHtml(error.message)}
            </p>
        `;
    }
}


function renderIssues(issues) {
    if (issues.length === 0) {
        issuesContainer.innerHTML = `
            <p class="empty-state">
                No issues match the current filters.
            </p>
        `;
        return;
    }

    issuesContainer.innerHTML = issues
        .map((issue) => createIssueCard(issue))
        .join("");
}


function createIssueCard(issue) {
    return `
        <article class="issue-card">
            <div class="issue-card-header">
                <div>
                    <h3>${escapeHtml(issue.title)}</h3>
                    <p>
                        ${escapeHtml(issue.property_name)}
                    </p>
                </div>

                <span class="badge ${getPriorityClass(issue.priority)}">
                    ${formatLabel(issue.priority)}
                </span>
            </div>

            <div class="issue-meta">
                <span class="badge ${getStatusClass(issue.status)}">
                    ${formatLabel(issue.status)}
                </span>

                <span class="badge">
                    ${escapeHtml(issue.category)}
                </span>

                <span class="badge">
                    Reported by ${escapeHtml(issue.reported_by)}
                </span>
            </div>

            <p class="issue-description">
                ${escapeHtml(issue.description)}
            </p>

            <div class="issue-actions">
                ${
                    issue.status !== "IN_PROGRESS"
                        ? `
                            <button
                                class="action-button"
                                onclick="updateIssueStatus(
                                    ${issue.id},
                                    'IN_PROGRESS'
                                )"
                            >
                                Mark In Progress
                            </button>
                        `
                        : ""
                }

                ${
                    issue.status !== "RESOLVED"
                        ? `
                            <button
                                class="action-button"
                                onclick="updateIssueStatus(
                                    ${issue.id},
                                    'RESOLVED'
                                )"
                            >
                                Resolve
                            </button>
                        `
                        : ""
                }

                <button
                    class="action-button delete-button"
                    onclick="deleteIssue(${issue.id})"
                >
                    Delete
                </button>
            </div>
        </article>
    `;
}


function getPriorityClass(priority) {
    if (priority === "CRITICAL") {
        return "badge-critical";
    }

    if (priority === "HIGH") {
        return "badge-high";
    }

    return "";
}


function getStatusClass(status) {
    if (status === "OPEN") {
        return "badge-open";
    }

    if (status === "IN_PROGRESS") {
        return "badge-progress";
    }

    if (status === "RESOLVED") {
        return "badge-resolved";
    }

    return "";
}


function formatLabel(value) {
    return value
        .toLowerCase()
        .split("_")
        .map((word) => {
            return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(" ");
}


async function createIssue(event) {
    event.preventDefault();

    formMessage.textContent = "Saving issue...";

    const formData = new FormData(issueForm);

    const issueData = {
        title: formData.get("title"),
        property_name: formData.get("property_name"),
        category: formData.get("category"),
        priority: formData.get("priority"),
        status: formData.get("status"),
        description: formData.get("description"),
        reported_by: formData.get("reported_by")
    };

    try {
        const response = await fetch("/api/issues", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(issueData)
        });

        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(
                responseData.error || "Unable to create issue."
            );
        }

        issueForm.reset();
        issueFormSection.classList.add("hidden");
        formMessage.textContent = "";

        await refreshApplication();
    } catch (error) {
        formMessage.textContent = error.message;
    }
}


async function updateIssueStatus(issueId, newStatus) {
    try {
        const response = await fetch(`/api/issues/${issueId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                status: newStatus
            })
        });

        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(
                responseData.error || "Unable to update issue."
            );
        }

        await refreshApplication();
    } catch (error) {
        window.alert(error.message);
    }
}


async function deleteIssue(issueId) {
    const confirmed = window.confirm(
        "Are you sure you want to delete this issue?"
    );

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(`/api/issues/${issueId}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            const responseData = await response.json();

            throw new Error(
                responseData.error || "Unable to delete issue."
            );
        }

        await refreshApplication();
    } catch (error) {
        window.alert(error.message);
    }
}


async function refreshApplication() {
    await Promise.all([
        loadDashboard(),
        loadIssues()
    ]);
}


function escapeHtml(value) {
    const element = document.createElement("div");
    element.textContent = value ?? "";

    return element.innerHTML;
}


openFormButton.addEventListener("click", () => {
    issueFormSection.classList.remove("hidden");
    issueFormSection.scrollIntoView({
        behavior: "smooth"
    });
});


closeFormButton.addEventListener("click", () => {
    issueFormSection.classList.add("hidden");
    formMessage.textContent = "";
});


issueForm.addEventListener("submit", createIssue);


searchInput.addEventListener("input", loadIssues);
statusFilter.addEventListener("change", loadIssues);
priorityFilter.addEventListener("change", loadIssues);


clearFiltersButton.addEventListener("click", () => {
    searchInput.value = "";
    statusFilter.value = "";
    priorityFilter.value = "";

    loadIssues();
});


refreshApplication();