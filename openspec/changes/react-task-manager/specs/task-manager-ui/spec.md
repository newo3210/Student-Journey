## ADDED Requirements

### Requirement: Task CRUD on the client
The task manager SHALL allow a user to create, edit title, toggle completed, and delete tasks without a backend.

#### Scenario: Create task with valid title
- **WHEN** the user submits a non-empty trimmed title
- **THEN** a new task appears in the list with `completed = false`

#### Scenario: Reject empty title
- **WHEN** the user submits an empty or whitespace-only title
- **THEN** no task is created and a validation message is shown

#### Scenario: Toggle completed
- **WHEN** the user toggles a task
- **THEN** that task’s `completed` flag flips and the UI reflects the new state

#### Scenario: Edit title
- **WHEN** the user saves a new non-empty title for an existing task
- **THEN** the list shows the updated title

#### Scenario: Delete task
- **WHEN** the user deletes a task
- **THEN** the task is removed from the list

### Requirement: Filter tasks
The task manager SHALL filter the visible list by all, active, or completed.

#### Scenario: Filter active
- **WHEN** the user selects the active filter
- **THEN** only tasks with `completed = false` are shown

#### Scenario: Filter completed
- **WHEN** the user selects the completed filter
- **THEN** only tasks with `completed = true` are shown

### Requirement: Persist tasks in localStorage
The task manager SHALL persist tasks so a full page reload restores the previous list.

#### Scenario: Reload restores tasks
- **WHEN** the user has tasks and reloads the page
- **THEN** the same tasks (id, title, completed) are shown again

### Requirement: Modular frontend structure
The application SHALL keep presentational components separate from task feature logic and storage access.

#### Scenario: Storage not called from presentational components
- **WHEN** a reviewer inspects `src/components/`
- **THEN** those files do not import `localStorage` directly; persistence goes through the tasks feature/storage module
