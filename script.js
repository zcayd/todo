document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const taskInput = document.getElementById('task-input');
    const taskCategoryInput = document.getElementById('task-category');
    const taskPriorityInput = document.getElementById('task-priority');
    const taskDueDateInput = document.getElementById('task-due-date');
    const addTaskForm = document.getElementById('add-task-form');
    const taskList = document.getElementById('task-list');
    const noTasksMessage = document.getElementById('no-tasks-message');

    // Filters
    const searchInput = document.getElementById('search-input');
    const filterStatus = document.getElementById('filter-status');
    const filterCategory = document.getElementById('filter-category');
    const filterDateStart = document.getElementById('filter-date-start');
    const filterDateEnd = document.getElementById('filter-date-end');
    const clearFiltersBtn = document.getElementById('clear-filters-btn');

    // Edit Modal
    const editModal = document.getElementById('edit-modal');
    const editTaskForm = document.getElementById('edit-task-form');
    const editTaskIdInput = document.getElementById('edit-task-id');
    const editTaskInput = document.getElementById('edit-task-input');
    const editTaskCategoryInput = document.getElementById('edit-task-category');
    const editTaskPriorityInput = document.getElementById('edit-task-priority');
    const editTaskDueDateInput = document.getElementById('edit-task-due-date');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');

    // Theme Toggle
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)');

    // --- State ---
    let tasks = [];
    let draggedItem = null; // For drag and drop

    // --- Utility Functions ---
    const generateId = () => `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const formatDate = (dateString) => {
        if (!dateString) return ' Sin fecha ';
        try {
            const date = new Date(dateString + 'T00:00:00'); // Ensure correct parsing as local date
            if (isNaN(date)) return 'Invalid Date';
            return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
        } catch (e) {
            console.error("Error formatting date:", dateString, e);
            return 'Invalid Date';
        }
    };

    const getDueDateStatus = (dueDate) => {
        if (!dueDate) return { class: '', text: '' };
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Compare dates only
        const taskDueDate = new Date(dueDate + 'T00:00:00');
        if (isNaN(taskDueDate)) return { class: '', text: '' };

        const oneDay = 24 * 60 * 60 * 1000;
        const diffDays = Math.round((taskDueDate - today) / oneDay);

        if (diffDays < 0) {
            return { class: 'overdue', text: ' VENCIDA ' };
        } else if (diffDays === 0) {
            return { class: 'upcoming', text: ' HOY ' };
        } else if (diffDays <= 3) { // Example: Upcoming within 3 days
            return { class: 'upcomings', text: ` FALTA ${diffDays} DIA${diffDays > 1 ? 'S ' : ' '}` };
        }
        return { class: '', text: '' }; // Not overdue or upcoming soon
    };


    // --- LocalStorage ---
    const saveTasks = () => {
        try {
            localStorage.setItem('tasks', JSON.stringify(tasks));
        } catch (e) {
            console.error("Error saving tasks to localStorage:", e);
            alert("Could not save tasks. Local storage might be full or disabled.");
        }
    };

    const loadTasks = () => {
        try {
            const storedTasks = localStorage.getItem('tasks');
            if (storedTasks) {
                tasks = JSON.parse(storedTasks);
                // Basic validation/migration if structure changes over time
                tasks = tasks.map(task => ({
                    id: task.id || generateId(), // Ensure ID exists
                    text: task.text || '',
                    category: task.category || 'otras',
                    priority: task.priority || 'media',
                    dueDate: task.dueDate || null,
                    completed: typeof task.completed === 'boolean' ? task.completed : false,
                    createdAt: task.createdAt || new Date().toISOString() // Add createdAt if missing
                }));
            } else {
                tasks = [];
            }
        } catch (e) {
            console.error("Error loading tasks from localStorage:", e);
            tasks = []; // Reset to empty array on error
            alert("Could not load tasks. Previous data might be corrupted.");
        }
    };


    // --- Task Rendering ---
    const renderTasks = (tasksToRender = tasks) => {
        taskList.innerHTML = ''; // Clear existing list
        noTasksMessage.classList.toggle('hidden', tasksToRender.length > 0);

        if (tasksToRender.length === 0 && tasks.length > 0) {
            noTasksMessage.textContent = "No hay tareas que coincidan con los filtros actuales.";
        } else if (tasksToRender.length === 0) {
            noTasksMessage.textContent = "No tasks found. Try adding some!";
        }


        tasksToRender.forEach((task, index) => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            li.setAttribute('data-id', task.id);
            li.setAttribute('data-priority', task.priority);
            li.setAttribute('draggable', true); // Make item draggable

            const dueDateStatus = getDueDateStatus(task.dueDate);

            li.innerHTML = `
                <div class="task-details">
                <div>
                
                    <button class="complete-btn" aria-label="${task.completed ? 'Mark as Pending' : 'Mark as Complete'}">
                        <i class="fas ${task.completed ? 'fa-undo' : 'fa-check'}"></i>
                    </button>
                    
                    <span class="task-text">${task.text}</span>
                </div>

                
                    <div class="task-meta">
                        <span class="category">
                            
                            <span class="category-badge category-${task.category}">${task.category}</span>
                        </span>
                        <span class="due-date ${dueDateStatus.class}">
                            <i class="fas fa-calendar-alt"></i> ${formatDate(task.dueDate)} ${dueDateStatus.text ? `(${dueDateStatus.text})` : ''}
                        </span>
                    </div>
                </div>
                <div class="task-actions">

                <button class="edit-btn" aria-label="Edit Task">
                        <i class="fas fa-pencil-alt"></i>
                    </button>
                
                

                    <button class="delete-btn" aria-label="Delete Task">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;

            // Add 'adding' class for animation, remove after animation completes
            li.classList.add('adding');
            li.addEventListener('animationend', () => li.classList.remove('adding'), { once: true });


            // Add event listeners directly to buttons
            li.querySelector('.complete-btn').addEventListener('click', () => toggleCompleteTask(task.id));
            li.querySelector('.edit-btn').addEventListener('click', () => openEditModal(task.id));
            li.querySelector('.delete-btn').addEventListener('click', () => deleteTaskWithAnimation(task.id, li));

            // Drag and Drop Event Listeners
            li.addEventListener('dragstart', handleDragStart);
            li.addEventListener('dragover', handleDragOver);
            li.addEventListener('dragleave', handleDragLeave);
            li.addEventListener('drop', handleDrop);
            li.addEventListener('dragend', handleDragEnd);

            taskList.appendChild(li);
        });
    };

    // --- CRUD Operations ---
    const addTask = (e) => {
        e.preventDefault();
        const text = taskInput.value.trim();
        if (!text) return; // Don't add empty tasks

        const newTask = {
            id: generateId(),
            text: text,
            category: taskCategoryInput.value,
            priority: taskPriorityInput.value,
            dueDate: taskDueDateInput.value || null, // Store as null if empty
            completed: false,
            createdAt: new Date().toISOString()
        };

        tasks.unshift(newTask); // Add to the beginning of the array
        saveTasks();
        applyFiltersAndRender(); // Render with filters applied
        addTaskForm.reset(); // Clear the form
        taskPriorityInput.value = 'media'; // Reset priority to default
    };

    const deleteTask = (id) => {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        applyFiltersAndRender();
    };

    const deleteTaskWithAnimation = (id, listItem) => {
        listItem.classList.add('deleting');
        // Wait for animation to finish before removing from data and DOM
        listItem.addEventListener('animationend', () => {
            deleteTask(id); // This will re-render, removing the element properly
        }, { once: true });
        // Fallback if animationend doesn't fire (e.g., display: none)
        setTimeout(() => {
            if (document.body.contains(listItem)) { // Check if still in DOM
                deleteTask(id);
            }
        }, 500); // Slightly longer than animation duration
    };


    const toggleCompleteTask = (id) => {
        tasks = tasks.map(task =>
            task.id === id ? { ...task, completed: !task.completed } : task
        );
        saveTasks();
        applyFiltersAndRender();
    };

    // --- Edit Modal Logic ---
    const openEditModal = (id) => {
        const task = tasks.find(task => task.id === id);
        if (!task) return;

        editTaskIdInput.value = task.id;
        editTaskInput.value = task.text;
        editTaskCategoryInput.value = task.category;
        editTaskPriorityInput.value = task.priority;
        editTaskDueDateInput.value = task.dueDate || ''; // Set to empty string if null

        editModal.classList.remove('hidden');
        editTaskInput.focus(); // Focus the input field
        // Trap focus within the modal (basic implementation)
        editModal.addEventListener('keydown', trapFocus);
    };

    const closeEditModal = () => {
        editModal.classList.add('hidden');
        editTaskForm.reset();
        editModal.removeEventListener('keydown', trapFocus);
    };

    const saveEditedTask = (e) => {
        e.preventDefault();
        const id = editTaskIdInput.value;
        const newText = editTaskInput.value.trim();
        if (!newText) return; // Don't save empty task text

        tasks = tasks.map(task =>
            task.id === id ? {
                ...task,
                text: newText,
                category: editTaskCategoryInput.value,
                priority: editTaskPriorityInput.value,
                dueDate: editTaskDueDateInput.value || null
            } : task
        );

        saveTasks();
        closeEditModal();
        applyFiltersAndRender();
    };

    // Basic focus trapping for modal accessibility
    const trapFocus = (e) => {
        if (e.key !== 'Tab') return;
        const focusableElements = editModal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) { // Shift + Tab
            if (document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
            }
        } else { // Tab
            if (document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
            }
        }
    };

    // Close modal on escape key
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !editModal.classList.contains('hidden')) {
            closeEditModal();
        }
    });
    // Close modal if clicking outside the content
    editModal.addEventListener('click', (e) => {
        if (e.target === editModal) { // Check if click was on the overlay itself
            closeEditModal();
        }
    });


    // --- Filtering and Searching ---
    const applyFiltersAndRender = () => {
        const searchTerm = searchInput.value.toLowerCase();
        const statusFilter = filterStatus.value;
        const categoryFilter = filterCategory.value;
        const dateStart = filterDateStart.value;
        const dateEnd = filterDateEnd.value;

        let filteredTasks = tasks.filter(task => {
            // Text Search
            const matchesSearch = task.text.toLowerCase().includes(searchTerm);

            // Status Filter
            const matchesStatus = statusFilter === 'all' ||
                (statusFilter === 'completed' && task.completed) ||
                (statusFilter === 'pending' && !task.completed);

            // Category Filter
            const matchesCategory = categoryFilter === 'all' || task.category === categoryFilter;

            // Date Range Filter
            let matchesDate = true;
            if (task.dueDate) {
                const taskDate = new Date(task.dueDate + 'T00:00:00'); // Ensure local date comparison
                if (!isNaN(taskDate)) {
                    if (dateStart) {
                        const startDate = new Date(dateStart + 'T00:00:00');
                        if (!isNaN(startDate) && taskDate < startDate) {
                            matchesDate = false;
                        }
                    }
                    if (dateEnd && matchesDate) { // Only check end date if start date matches (or no start date)
                        const endDate = new Date(dateEnd + 'T00:00:00');
                        if (!isNaN(endDate) && taskDate > endDate) {
                            matchesDate = false;
                        }
                    }
                } else {
                    // If task date is invalid, maybe exclude it based on filters?
                    // Or include it? Decide based on desired behavior.
                    // Here, we'll include it unless explicitly filtered out by other means.
                }

            } else if (dateStart || dateEnd) {
                // If filtering by date, tasks without a due date don't match
                matchesDate = false;
            }


            return matchesSearch && matchesStatus && matchesCategory && matchesDate;
        });

        renderTasks(filteredTasks);
    };

    const clearFilters = () => {
        searchInput.value = '';
        filterStatus.value = 'all';
        filterCategory.value = 'all';
        filterDateStart.value = '';
        filterDateEnd.value = '';
        applyFiltersAndRender();
    };

    // --- Drag and Drop Handlers ---
    function handleDragStart(e) {
        draggedItem = this; // `this` is the li element being dragged
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', this.dataset.id);
        // Add slight delay to allow browser to render drag image before applying class
        setTimeout(() => {
            this.classList.add('dragging');
        }, 0);
    }

    function handleDragOver(e) {
        e.preventDefault(); // Necessary to allow dropping
        e.dataTransfer.dropEffect = 'move';
        const targetItem = e.target.closest('.task-item');
        if (targetItem && targetItem !== draggedItem) {
            // Add visual cue to the item being hovered over
            taskList.querySelectorAll('.task-item').forEach(item => item.classList.remove('drag-over'));
            targetItem.classList.add('drag-over');
        }
        // Optional: Add class to container for general feedback
        // taskList.classList.add('drag-container-over');
    }

    function handleDragLeave(e) {
        // Remove visual cue if leaving an item or the container itself
        const targetItem = e.target.closest('.task-item');
        if (targetItem) {
            targetItem.classList.remove('drag-over');
        }
        // Check if the related target (where the mouse moved to) is outside the list
        if (!taskList.contains(e.relatedTarget)) {
            // taskList.classList.remove('drag-container-over');
            taskList.querySelectorAll('.task-item').forEach(item => item.classList.remove('drag-over'));
        }
    }

    function handleDrop(e) {
        e.preventDefault();
        e.stopPropagation(); // Prevent potential bubbling issues

        const targetItem = e.target.closest('.task-item');
        if (!targetItem || targetItem === draggedItem) {
            // Dropped on self or outside a valid target
            return;
        }

        const draggedId = e.dataTransfer.getData('text/plain');
        const targetId = targetItem.dataset.id;

        // Find original indices
        const draggedIndex = tasks.findIndex(task => task.id === draggedId);
        const targetIndex = tasks.findIndex(task => task.id === targetId);

        if (draggedIndex === -1 || targetIndex === -1) {
            console.error("Could not find dragged or target task in array.");
            return; // Should not happen if IDs are correct
        }

        // Remove dragged item and insert it before the target item
        const [movedTask] = tasks.splice(draggedIndex, 1);
        // Adjust targetIndex if the dragged item was before the target
        const adjustedTargetIndex = draggedIndex < targetIndex ? targetIndex - 1 : targetIndex;
        tasks.splice(adjustedTargetIndex, 0, movedTask);


        // Clean up visual cues
        targetItem.classList.remove('drag-over');
        // taskList.classList.remove('drag-container-over');


        saveTasks();
        applyFiltersAndRender(); // Re-render the list in the new order
    }

    function handleDragEnd(e) {
        this.classList.remove('dragging');
        taskList.querySelectorAll('.task-item').forEach(item => item.classList.remove('drag-over'));
        // taskList.classList.remove('drag-container-over');
        draggedItem = null; // Reset dragged item
    }

    // --- Theme Handling ---
    const applyTheme = (theme) => {
        if (theme === 'dark') {
            body.setAttribute('data-theme', 'dark');
            themeToggle.setAttribute('aria-label', 'Switch to light theme');
            localStorage.setItem('theme', 'dark');
        } else {
            body.removeAttribute('data-theme');
            themeToggle.setAttribute('aria-label', 'Switch to dark theme');
            localStorage.setItem('theme', 'light');
        }
    };

    const toggleTheme = () => {
        const currentTheme = localStorage.getItem('theme') || (systemPrefersDark.matches ? 'dark' : 'light');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
        // Store explicit user choice to override system preference
        localStorage.setItem('themePreference', newTheme);
    };

    // Initialize theme based on stored preference or system setting
    const initializeTheme = () => {
        const storedTheme = localStorage.getItem('theme'); // Check for explicit setting first
        const storedPreference = localStorage.getItem('themePreference'); // Check if user manually set it

        if (storedPreference) {
            applyTheme(storedPreference);
        } else if (storedTheme) { // Fallback to older 'theme' key if preference not set
            applyTheme(storedTheme);
        } else {
            // If no preference stored, use system setting
            applyTheme(systemPrefersDark.matches ? 'dark' : 'light');
        }
    };

    // Listen for changes in system preference
    systemPrefersDark.addEventListener('change', (e) => {
        // Only change if the user hasn't explicitly set a theme
        if (!localStorage.getItem('themePreference')) {
            applyTheme(e.matches ? 'dark' : 'light');
        }
    });


    // --- Initial Load & Event Listeners ---
    initializeTheme(); // Set theme first
    loadTasks();
    applyFiltersAndRender(); // Initial render based on loaded tasks and default filters

    addTaskForm.addEventListener('submit', addTask);
    editTaskForm.addEventListener('submit', saveEditedTask);
    cancelEditBtn.addEventListener('click', closeEditModal);
    themeToggle.addEventListener('click', toggleTheme);

    // Filter event listeners
    searchInput.addEventListener('input', applyFiltersAndRender);
    filterStatus.addEventListener('change', applyFiltersAndRender);
    filterCategory.addEventListener('change', applyFiltersAndRender);
    filterDateStart.addEventListener('change', applyFiltersAndRender);
    filterDateEnd.addEventListener('change', applyFiltersAndRender);
    clearFiltersBtn.addEventListener('click', clearFilters);

    // --- Reminder Notifications (Simple Visual Cue) ---
    // The visual cue (overdue/upcoming classes) is handled within renderTasks based on getDueDateStatus.
    // Browser notifications are more complex and require user permission.
    // A simple check on load:
    const checkUpcomingTasks = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const upcoming = tasks.filter(task => {
            if (!task.completed && task.dueDate) {
                const taskDueDate = new Date(task.dueDate + 'T00:00:00');
                if (!isNaN(taskDueDate)) {
                    const diffTime = taskDueDate - today;
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    return diffDays === 0; // Due today
                }
            }
            return false;
        });

        if (upcoming.length > 0 && Notification.permission === "granted") {
            new Notification("Todo App Reminder", {
                body: `Tienes ${upcoming.length} tarea(s) para hoy!`,
                icon: './favicon.ico' // Optional: Add an icon
            });
        } else if (Notification.permission !== "denied") {
            // Optionally request permission if not already denied
            // Notification.requestPermission().then(permission => {
            //     if (permission === "granted" && upcoming.length > 0) {
            //          new Notification("Todo App Reminder", { body: `You have ${upcoming.length} task(s) due today!` });
            //     }
            // });
            console.log("Notifications permission not granted. Visual cues will be used instead.");
        }
    };

    // Check reminders shortly after load (allow time for permission prompt if needed)
    setTimeout(checkUpcomingTasks, 3000);

    // You might want to periodically check or check when the window gains focus
    // window.addEventListener('focus', checkUpcomingTasks);

}); // End DOMContentLoaded