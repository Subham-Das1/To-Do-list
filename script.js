// Store the last few tasks to prevent consecutive duplicates
var recentTasks = [];
var recentDeletedTasks = []; 

// Load tasks from local storage on page load
document.addEventListener('DOMContentLoaded', function () {
    var savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    savedTasks.forEach(function (task) {
        addTaskToList(task.text, task.date, task.time, task.status);
    });
});

// Placeholder handling
document.getElementById('chatInput').addEventListener('focus', function () {
    this.placeholder = '';
});

document.getElementById('chatInput').addEventListener('blur', function () {
    if (this.value === '') {
        this.placeholder = 'Add items to your to-do list';
    }
});

// Adding task to the list
document.getElementById('addlist').addEventListener('click', function () {
    var dateInput = document.getElementById('date').value;
    var timeInput = document.getElementById('time').value;
    var chatInput = document.getElementById('chatInput').value.trim();

    if (dateInput === '' || chatInput === '' || timeInput === '') {
        alert('Please enter date, time, and task');
    } else {
        var today = new Date().toISOString().split('T')[0];
        var currentTime = new Date().toTimeString().split(' ')[0];

        if (dateInput < today || (dateInput === today && timeInput < currentTime)) {
            alert('Date and time cannot be in the past');
        } else {
            if (recentTasks.includes(chatInput) && !recentDeletedTasks.includes(chatInput)) {
                alert('This task was recently added. Please add a different task.');
            } else {
                addTaskToList(chatInput, dateInput, timeInput, 'pending');
                recentTasks.push(chatInput);
                recentDeletedTasks = recentDeletedTasks.filter(task => task !== chatInput);
                if (recentTasks.length > 2) {
                    recentTasks.shift();
                }
                saveTasksToLocalStorage();
            }
        }
    }
});

// Function to add task to the list
function addTaskToList(text, date, time, status = 'pending') {
    var list = document.getElementById('list');
    var li = document.createElement('li');
    li.className = 'task-item';

    if (text.length > 50) {
        alert("Max characters exceeded!");
        return;
    }

    var taskText = document.createElement('div');
    taskText.className = 'task-text';
    taskText.innerHTML = `${text} in ${date} in ${time}`;

    var actionButtons = document.createElement('div');
    actionButtons.className = 'action-buttons';

    var completedBtn = document.createElement('button');
    completedBtn.textContent = 'Completed';
    completedBtn.className = 'completed';
    completedBtn.addEventListener('click', function () {
        li.style.textDecoration = 'line-through';
        li.style.color = 'green';
        actionButtons.innerHTML = '';
        li.dataset.status = 'completed';
        saveTasksToLocalStorage();
    });

    var couldntCompleteBtn = document.createElement('button');
    couldntCompleteBtn.textContent = "Couldn't Complete";
    couldntCompleteBtn.className = 'couldnt-complete';
    couldntCompleteBtn.addEventListener('click', function () {
        li.style.textDecoration = 'line-through';
        li.style.color = 'red';
        actionButtons.innerHTML = '';
        li.dataset.status = 'couldnt-complete';
        saveTasksToLocalStorage();
    });

    var editBtn = document.createElement('button');
    editBtn.className = 'edit';
    editBtn.innerHTML = '<i class="fas fa-edit"></i>';
    editBtn.addEventListener('click', function () {
        var currentText = text;
        var currentDate = date;
        var currentTime = time;
        var newText = prompt("Update task text:", currentText) || currentText;
        var newDate = prompt("Update date:", currentDate) || currentDate;
        var newTime = prompt("Update time:", currentTime) || currentTime;
        taskText.innerHTML = `${newText} in ${newDate} in ${newTime}`;
        saveTasksToLocalStorage();
    });

    var deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete';
    deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
    deleteBtn.addEventListener('click', function () {
        if (confirm('Are you sure you want to delete this task?')) {
            list.removeChild(li); 
            recentDeletedTasks.push(text);
            recentTasks = recentTasks.filter(task => task !== text); 
            saveTasksToLocalStorage();
        }
    });

    if (status === 'completed') {
        li.style.textDecoration = 'line-through';
        li.style.color = 'green';
    } else if (status === 'couldnt-complete') {
        li.style.textDecoration = 'line-through';
        li.style.color = 'red';
    } else {
        actionButtons.appendChild(completedBtn);
        actionButtons.appendChild(couldntCompleteBtn);
        actionButtons.appendChild(editBtn);
        actionButtons.appendChild(deleteBtn);
    }

    li.appendChild(taskText);
    li.appendChild(actionButtons);
    li.dataset.status = status;
    list.appendChild(li);
}

// Function to save tasks to local storage
function saveTasksToLocalStorage() {
    var tasks = Array.from(document.querySelectorAll('#list .task-item')).map(li => {
        var taskText = li.querySelector('.task-text').textContent;
        var [text, date, time] = taskText.split(' in ');
        return { text, date, time, status: li.dataset.status };
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Event listener for clearing all tasks
document.getElementById('clearAll').addEventListener('click', function () {
    if (confirm('Are you sure you want to clear all tasks?')) {
        localStorage.removeItem('tasks');
        document.getElementById('list').innerHTML = '';
        recentTasks = [];
        recentDeletedTasks = [];
    }
});
