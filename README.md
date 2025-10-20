# TimeMatrix Timetabling Engine

TimeMatrix is a modern, web-based constraint satisfaction solver designed to build and refine clash-free schedules. It provides a fully interactive and responsive interface to model constraints, visualize results, and receive intelligent feedback from the automated scheduling engine.

## ✨ Features

This project includes a rich user interface with a wide range of features to make schedule management intuitive and efficient.

* **Interactive Data Management:** A unified, tabbed "Command Center" to manage all scheduling entities (Teachers, Groups, Topics, etc.).
* **Full CRUD Operations:** Complete **Add**, **Edit**, and **Remove** functionality for all data types, managed through a clean table-based interface.
* **Dark Mode & Light Mode:** A sleek, user-toggleable theme for comfortable viewing in any lighting condition.
* **Fully Responsive Design:** The layout is optimized to work seamlessly on all devices, from mobile phones to large desktops.
* **Instant Conflict Checker:** Provides real-time warnings to the user if they attempt to create an obvious scheduling conflict while creating classes.
* **Intelligent Solver Visualization:**
    * **Color-Coding:** Scheduled classes are color-coded by teacher for easy, at-a-glance readability.
    * **Compromise Highlighting:** A warning icon (⚠️) appears on classes that were not placed in their user-preferred timeslot.
    * **Unscheduled List:** A clear "Results" card displays any classes the solver was unable to place on the schedule.
* **Interactive Scheduling:** Users can manually place unscheduled classes onto the grid by clicking on empty slots and selecting from a pop-up list.
* **Data Persistence:** Import and Export your entire setup as a JSON file for backups and collaboration.

## 🛠️ Tech Stack

* **Frontend:** React, TypeScript, Tailwind CSS, Vite
* **UI Components:** shadcn/ui
* **Backend (Prototype):** Node.js, Express

## 🚀 Getting Started

To get the frontend running locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/not-amarnath/timetable.git](https://github.com/not-amarnath/timetable.git)
    ```
2.  **Navigate to the client directory:**
    ```bash
    cd timetable/client
    ```
3.  **Install the dependencies:**
    ```bash
    npm install
    ```
4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:8080` (or a similar port).

## API & Solver Logic

The backend provides a greedy constraint-based solver API (`POST /api/solve`) that validates inputs, scores preferences, and respects hard constraints like teacher/group double-booking. It prioritizes classes with the tightest constraints first to produce reasonable schedules quickly.

## License

MIT