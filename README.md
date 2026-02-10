 Interactive Question Management Sheet

 Project Overview

The Interactive Question Management Sheet is a web-based application designed to organize questions in a structured and user-friendly way.
It allows users to manage Topics, Sub-topics, and Questions using a clean UI with modern interactions.

The application uses a given dataset and displays it hierarchically, while also allowing users to modify, reorder, and manage content interactively.


 Objectives

Organize questions under topics and sub-topics

Provide an intuitive UI for managing large datasets

Allow dynamic reordering using drag-and-drop

Ensure the dataset is displayed correctly on every reload


 Features

 Core Features

 Topic Management

Add and delete topics

Sub-topic Management

Add and delete sub-topics under topics

Question Management

Add and delete questions under sub-topics

Drag and Drop Reordering

Reorder topics

Reorder sub-topics within a topic

Reorder questions within a sub-topic

Dataset Integration

Loads and displays the given dataset correctly

Dataset is normalized into a hierarchical structure

UI & UX

Clean, modern card-based layout

Responsive design (works on laptop and large screens)

Clear visual hierarchy for better readability

Dataset Handling

The provided dataset is nested and non-hierarchical.
To handle this, the dataset is:

Extracted from the correct nested field

Normalized into the following structure:

Topic → Sub-topic → Question


Dynamically rendered in the UI

This logic is implemented in:

src/utils/parseSheetData.js

Tech Stack

Frontend: React (Vite)

Styling: Tailwind CSS

Drag & Drop: @dnd-kit

Language: JavaScript (ES6+)

Build Tool: Vite

Project Structure
project-root/
│
├── src/
│   ├── data/
│   │   └── sheet.json          # Given dataset
│   ├── utils/
│   │   └── parseSheetData.js   # Dataset normalization logic
│   ├── App.jsx                 # Main application logic
│   └── main.jsx
│
├── public/
├── package.json
├── vite.config.js
└── README.md

Submission Notes

node_modules is excluded using .gitignore

Dataset is always visible on refresh to ensure consistent evaluation

The project focuses on clarity, correctness, and usability

👨‍💻 Author

Aswanth A
