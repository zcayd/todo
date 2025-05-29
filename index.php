<!DOCTYPE html>
<html lang="en">

<head>

    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="shortcut icon" href="img/to-do.png" type="image/x-icon">

    <link rel="manifest" href="manifest.json">
    <title>To-Do App</title>

    <link rel="stylesheet" href="style.css">

    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

</head>

<body>
    <div class="app-container">
        <header>
            <h1>Mis Tareas</h1>
            <button id="theme-toggle" aria-label="Toggle dark/light theme">
                <i class="fas fa-sun"></i> <!-- Sun icon for light mode -->
                <i class="fas fa-moon"></i> <!-- Moon icon for dark mode -->
            </button>
        </header>
        <section class="controls">

            <button class="accordion accagregar">AGREGAR</button>
            <div class="panel">

                <form id="add-task-form">
                    <input type="text" id="task-input" placeholder="Agregar tarea ..." required
                        aria-label="New task description">
                    <div class="task-options">
                        <select id="task-category" aria-label="Task category" required>
                            <option value="visita">Visitas</option>
                            <option value="personal">Personales</option>
                            <option value="trabajo">Trabajo</option>
                            <option value="compra">Compras</option>
                            <option value="otras">Otras</option>
                        </select>
                        <select id="task-priority" aria-label="Task priority">
                            <option value="baja">Baja</option>
                            <option value="media" selected>Media</option>
                            <option value="alta">Alta</option>
                        </select>
                        <input type="date" id="task-due-date" aria-label="Task due date">
                    </div>
                    <button type="submit" class="add-btn" aria-label="Add Task"><i class="fas fa-plus"></i> AGREGAR
                    </button>
                </form>
            </div>


            <button class="accordion accfiltrar">FILTRAR</button>
            <div class="panel">
                <div class="filters">
                    <input type="text" id="search-input" placeholder="Buscar Tareas ..." aria-label="Search tasks">
                    <select id="filter-status" aria-label="Filter by status">
                        <option value="all">Todos los Estados</option>
                        <option value="pending">Pendiente</option>
                        <option value="completed">Completado</option>
                    </select>
                    <select id="filter-category" aria-label="Filter by category">
                        <option value="all">Todas las Categorias</option>
                        <option value="visita">Visitas</option>
                        <option value="personal">Personales</option>
                        <option value="trabajo">Trabajo</option>
                        <option value="compra">Compras</option>
                        <option value="otras">Otras</option>
                    </select>
                    <div>
                        <input type="date" id="filter-date-start" aria-label="Filter start date">
                        <input type="date" id="filter-date-end" aria-label="Filter end date">
                    </div>

                    <button id="clear-filters-btn" aria-label="Clear Filters"><i class="fas fa-times"></i> Borrar
                        Filtro</button>
                </div>
            </div>
        </section>

        <section class="task-list-section">
            <h2>Tareas</h2>
            <ul id="task-list" aria-live="polite">
                <!-- Tasks will be dynamically inserted here -->
            </ul>
            <p id="no-tasks-message" class="hidden">No se encontraron tareas. ¡Intenta agregar algunas o ajustar los
                filtros !!!</p>
        </section>

    </div>

    <!-- Edit Task Modal -->
    <div id="edit-modal" class="modal hidden" role="dialog" aria-modal="true" aria-labelledby="edit-modal-title">
        <div class="modal-content">
            <h2 id="edit-modal-title">Editar Tarea</h2>
            <form id="edit-task-form">
                <input type="hidden" id="edit-task-id">
                <label for="edit-task-input">Tarea:</label>
                <input type="text" id="edit-task-input" required>

                <label for="edit-task-category">Categoria:</label>
                <select id="edit-task-category">
                    <option value="visita">Visitas</option>
                    <option value="personal">Personales</option>
                    <option value="trabajo">Trabajo</option>
                    <option value="compra">Compras</option>
                    <option value="otras">Otras</option>
                </select>

                <label for="edit-task-priority">Prioridad:</label>
                <select id="edit-task-priority">
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                </select>

                <label for="edit-task-due-date">Fecha:</label>
                <input type="date" id="edit-task-due-date">

                <div class="modal-actions">
                    <button type="submit" class="save-btn">Guardar</button>
                    <button type="button" id="cancel-edit-btn">Cancelar</button>
                </div>
            </form>
        </div>
    </div>
    <footer class="footer">
        <p>AZ | DC © 2025</p>
    </footer>
    <script src="script.js"></script>
    <script>
        var acc = document.getElementsByClassName("accordion");
        var i;

        for (i = 0; i < acc.length; i++) {
            acc[i].addEventListener("click", function () {
                this.classList.toggle("active");
                var panel = this.nextElementSibling;
                if (panel.style.maxHeight) {
                    panel.style.maxHeight = null;
                } else {
                    panel.style.maxHeight = panel.scrollHeight + "px";
                }
            });
        }
    </script>
</body>

</html>