  
# My Library Organizer

[![React](https://img.shields.io/badge/React-17.0.2-blue?logo=react)](https://reactjs.org/) [![Python](https://img.shields.io/badge/Python-3.8-blue?logo=python)](https://www.python.org/)

My Library Organizer is a full-stack web application designed to help you manage and organize your personal book collection. This application provides secure user authentication, robust library management, and detailed book handling features such as adding books, editing library details, rating books, and deleting entries. It combines a Flask API backend with a React frontend to create a seamless experience for end users. The app uses SQLAlchemy for data management, Formik and Yup for client-side form validation, and React Router for client-side navigation.

The following sections describe each important file in the project and their key functions. The descriptions are ordered by their relevance to the end user, starting with the routes that define how you interact with the application, followed by the models that underpin the data structure.

## Features

- **User Authentication:** Sign up, log in, and log out securely.
- **Library Management:** Create, update, and delete libraries. (Each library has a name between 3 and 100 characters.)
- **Book Management:** Add new books to your library, view book details, and remove books as needed.
- **Book Reviews & Ratings:** Submit star ratings (1-5) for books and view global ratings aggregated from all reviews.
- **Responsive Interface:** Clean and intuitive React frontend with multiple routes.
- **Form Validation:** Robust form handling and validation using Formik and Yup.

## Technologies Used

- **Backend:** Flask, Flask-RESTful, SQLAlchemy, Flask-Migrate, Marshmallow, Flask-CORS, Flask-Bcrypt.
- **Frontend:** React, React Router, Formik, Yup, CSS.
- **Database:** SQLite (via SQLAlchemy).

## Project Structure

```
.
├── client
│   ├── node_modules
│   ├── package-lock.json
│   ├── package.json
│   ├── public
│   ├── README.md
│   └── src
│       ├── components
│       │   ├── AutocompleteBookSelect.js   // Provides an autocomplete dropdown for selecting books by fetching data from the backend.
│       │   ├── BookCard.js                   // Displays book details, ratings, and a delete option (if authenticated). Contains small functions for handling star ratings.
│       │   ├── CreateLibrary.js              // Contains a modal form (using Formik) to create new libraries with validation.
│       │   ├── FormField.js                  // A reusable component for rendering input fields along with validation error messages.
│       │   ├── Library.js                    // Renders a library’s details along with its associated books.
│       │   ├── Modal.js                      // A generic modal component used throughout the app to display popups.
│       │   ├── NavBar.js                     // Displays the top navigation bar with routes for Home, Books, Login, and Logout.
│       │   └── ValidationSchema.js           // Defines Yup validation schemas for libraries, signup forms, and new book forms.
│       ├── pages
│       │   ├── BookIndex.js                  // Lists all books and provides options to add a book to a library.
│       │   ├── ErrorPage.js                  // A fallback error page (404) for undefined routes.
│       │   ├── LibraryRedirect.js            // Redirects users from generic library routes to the home page.
│       │   ├── Login.js                      // Implements the login page and handles user authentication.
│       │   ├── NewBook.js                    // Provides a form to add new books to a library, integrating with the autocomplete component.
│       │   └── Signup.js                     // Contains the signup form and handles user registration.
│       └── App.js                            // The root component that sets up session context and renders the NavBar and main content via React Router.
├── CONTRIBUTING.md                         // Guidelines for contributing to this project.
├── LICENSE.md                              // MIT License details.
├── Pipfile                                 // Python dependency management for the server.
├── Pipfile.lock                            // Locked dependencies for reproducibility.
├── README.md                               // (This file) Contains project overview and file-by-file documentation.
├── requirements.txt                        // Additional dependency listings.
├── Procfile                                // Contains deployment instructions for the Flask backend and React frontend using Gunicorn. (Located at the project root.)
└── server
    ├── app.py                              // Main Flask application file with API endpoints for authentication, library CRUD operations, book management, and reviews. Each function (such as signup, login, and delete) includes inline commentary on its role.
    ├── config.py                           // Configures the Flask app (database URI, secret key, CORS, migrations, etc.) and initializes key extensions like SQLAlchemy, Marshmallow, and Flask-Bcrypt.
    ├── instance                            // Contains instance-specific configurations (not typically edited by end users).
    ├── migrations                          // Auto-generated files for database migrations (can be ignored for manual edits).
    ├── models.py                           // Defines the SQLAlchemy models (User, Library, Book, LibraryBooks) including relationships, validations, and helper methods (like password hashing in the User model).
    └── seed.py                             // A script to seed the database with initial data for testing and development.
```

### Detailed File Descriptions

## Server Files

# app.py
This is the main entry point of the Flask API. It registers various resources (endpoints) using Flask-RESTful. Each route is tied to functions that handle user authentication (signup, login, logout, session checking), library management (listing, creating, updating, and deleting libraries), book management (adding books to libraries and updating their ratings), and book reviews. Every function includes a brief comment describing its role and error handling. For example, the LibraryBooksResource.delete function ensures that only owners can delete a library by verifying the user’s session.

# config.py
This file sets up configuration parameters for the Flask application, such as the secret key, database URI, and other settings necessary for Flask, CORS, SQLAlchemy, and Flask-Migrate. It also initializes instances of the required libraries. Functions and configurations here are critical for ensuring the backend works as expected.

# models.py
Models are defined here using SQLAlchemy. The User, Library, Book, and LibraryBooks classes outline the structure of your database. Each model includes validation functions, such as checking the length of a library name or ensuring the published year of a book is not in the future. Small helper methods, like the password setter in the User model, ensure that data integrity and security are maintained.

# seed.py
This script seeds your database with initial data, which is useful for testing and development. It creates initial users, libraries, and books so that you have a starting point to interact with your application.

# Procfile
This file, located at the project root, provides instructions for deployment, specifying how to run both the Flask backend and the React frontend using Gunicorn. This is particularly useful when deploying the application to platforms like Render or Heroku.

## Client Files

# App.js
This is the root component of the React frontend. It creates a session context to track if a user is logged in, fetches session information from the backend, and renders the NavBar along with the main content based on the current route. Small helper functions within this file manage session checking and error handling.

# routes.js
Defines all client-side routes using React Router. Routes include paths for Home, Login, Signup, library creation, and book management. This file orchestrates navigation between different pages and ensures that the correct components are rendered for each route.

## Components

# AutocompleteBookSelect.js
Fetches available books from the backend and renders a searchable, autocomplete dropdown using the react-select library. It simplifies book selection when adding books to a library.

# BookCard.js
Displays individual book details, such as title, author, and ratings. It includes functionality for rating a book via a star rating system and a delete button for removing a book (which sends a DELETE request to the appropriate endpoint). Each helper function inside (like handleDelete) includes a small comment explaining its role.

# CreateLibrary.js
This component provides a modal form for creating new libraries. It leverages Formik for form management and Yup for validation. Inline, each function is commented to explain the process of handling form submission, validating inputs, and making the POST request to the backend.

# FormField.js
A simple, reusable component for rendering form fields along with their validation error messages. It abstracts away common boilerplate code so that forms remain clean and maintainable.

# Library.js
Renders a single library’s details, including its list of books. It checks if the library exists and, if so, iterates over the associated books to display them using the BookCard component.

# Modal.js
A generic modal component used across the application to display pop-up content. It handles overlay clicks to allow users to dismiss the modal.

# NavBar.js
Implements the top navigation bar with links to Home, Books, and authentication options (Login/Logout). It contains functions to handle user logout and navigation between different routes.

# ValidationSchema.js
Contains Yup validation schemas for different forms in the application. Each schema (for libraries, sign-up, and new books) is defined with appropriate constraints and error messages to ensure data integrity.

## Pages

# BookIndex.js
This page displays a list of all books and includes options to filter, add to libraries, and view global and user-specific ratings. It orchestrates the interaction between the book list, autocomplete component, and modal dialogs for adding books.

# ErrorPage.js
A simple component that displays a 404 error message when the user navigates to an undefined route.

# LibraryRedirect.js
Automatically redirects users from generic library routes to the home page. This helps in maintaining a clean user flow and avoiding dead-end routes.

# Login.js
Provides a login form that handles user authentication. The form submission function sends credentials to the backend and handles errors by displaying appropriate messages to the user.

# NewBook.js
Offers a form for adding a new book to a library. It supports both entering new book details and selecting an existing book from the autocomplete component. Functions in this file validate and prepare data before sending it to the backend.

# Signup.js
Implements the user registration form. It collects user details, validates them using Yup, and sends the data to the backend to create a new user account.

## Additional Resources
	•	Flask Documentation: https://flask.palletsprojects.com/
	•	React Documentation: https://reactjs.org/docs/getting-started.html
	•	Formik Documentation: https://formik.org/docs/overview
	•	Yup Documentation: https://github.com/jquense/yup
	•	SQLAlchemy Documentation: https://www.sqlalchemy.org/

## Installation

### Backend

1. Navigate to the `server` directory.
2. Install dependencies:
   ```bash
   pipenv install
   ```
3. Activate the virtual environment:
   ```bash
   pipenv shell
   ```
4. Set up the database:
   ```bash
   flask db init
   flask db upgrade head
   ```
5. (Optional) Seed the database:
   ```bash
   python seed.py
   ```

### Frontend

1. Navigate to the `client` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the React development server:
   ```bash
   npm start
   ```

## Running the Application

- **Backend:** Start the Flask server by running:
  ```bash
  python app.py
  ```
  Alternatively, use your Procfile if deploying to a platform like Render or Heroku.
  
- **Frontend:** In the `client` directory, run:
  ```bash
  npm start
  ```

## Usage

- **Authentication:** Users can sign up and log in to manage their libraries.
- **Library Operations:** Once logged in, create a library, add books, update library names, or delete libraries.
- **Book Operations:** Add new books to a library, rate books using a star-based system, and view global ratings aggregated from user reviews.

## Contributing

Contributions are welcome! Please fork this repository and submit a pull request with your changes.

## License

This project is licensed under the [Learn.co Educational Content License](LICENSE.md).