  
# My Library Organizer

[![React](https://img.shields.io/badge/React-17.0.2-blue?logo=react)](https://reactjs.org/) [![Python](https://img.shields.io/badge/Python-3.8-blue?logo=python)](https://www.python.org/)

My Library Organizer is a full-stack web application designed to help you manage and organize your personal book collection. With secure user authentication, intuitive library management, and a robust book review and rating system, this app makes it easy to keep track of your favorite books.

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
├── CONTRIBUTING.md
├── LICENSE.md
├── Pipfile
├── Pipfile.lock
├── README.md
├── requirements.txt
└── server
    ├── app.py
    ├── config.py
    ├── instance
    ├── migrations
    ├── models.py
    ├── Procfile
    └── seed.py
```

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

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

This project is licensed under the MIT License.

---

Enjoy organizing your personal library!