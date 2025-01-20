document.addEventListener("DOMContentLoaded", () => {
    const apiUrl = "https://kabayan.top/backend/tasks.php";

    fetch(apiUrl)
        .then((response) => response.json())
        .then((tasks) => {
            const taskList = document.getElementById("task-list");
            tasks.forEach((task) => {
                const li = document.createElement("li");
                li.textContent = `${task.description} - ${task.points} points`;
                taskList.appendChild(li);
            });
        })
        .catch((error) => console.error("Error fetching tasks:", error));
});
