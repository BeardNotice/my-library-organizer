#!/usr/bin/env python3

# Standard library imports

from flask import request, session, make_response
from flask_restful import Resource
from sqlalchemy.exc import IntegrityError
# Local imports
from config import app, db, api
from models import User, Library, Book, LibraryBooks
from schemas import UserSchema, LibrarySchema, BookSchema


# Set additional cookie parameters for secure deployment
# Configure these directly instead of using before_first_request which is deprecated
app.config['SESSION_COOKIE_SECURE'] = app.config.get('ENV') == 'production'
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'

# Views go here!
# Block requests to protected endpoints unless user is logged in
@app.before_request
def login_check():
    # Allow CORS preflight through without auth
    if request.method =='OPTIONS':
        return
    open_access_list = [
        'signup', 'login', 'logout', 'user_session',
        'libraries', 'library', 'library_books', 'library_book_review',
        'books', 'static', 'many_ratings', 'min_rating'
    ]

    if (request.endpoint) not in open_access_list and (not session.get('user_id')):
        return {'error': '401 unauthorized'}, 401
    
# Handle new user signup and start session
class Signup(Resource):
    def post(self):
        # Read incoming sign-up data
        data = request.get_json()
        username = data.get("username")
        email = data.get("email")
        password = data.get("password")

        if not username or not email or not password:
            return {"error": "Missing required fields"}, 400
        conflict = User.query.filter(
            (User.username == username) | (User.email == email)
        ).first()
        if conflict:
            if conflict.username == username:
                return {'error': 'Username already taken'}, 409
            return {'error': 'Email already registered'}, 409
        
        user = User(username=username, email=email)
        user.password_hash = password

        try:
            db.session.add(user)
            db.session.commit()

            session["user_id"] = user.id
            # Set cookie parameters for better cross-domain compatibility
            response = make_response(UserSchema().dump(user))
            response.status_code = 201
            return response
        except IntegrityError:
            return {'error': '401 Unauthorized'}, 401
# Authenticate existing user and start session
class Login(Resource):
    def post(self):
        data = request.get_json()
        username = data.get("username")
        password = data.get("password")

        user = User.query.filter(User.username == username).first()
        if not user:
            return {"error": "username does not exist"}, 401

        if not user.authenticate(password):
            return {"error": "password incorrect"}, 401

        session['user_id'] = user.id
        # Explicit cookie creation for better cross-domain compatibility
        response = make_response(UserSchema().dump(user))
        response.status_code = 200
        return response
# Log out current user
class Logout(Resource):
    def delete(self):
        session['user_id'] = None
        return {}, 204
# Return logged-in user and their libraries with ratings
class SessionUser(Resource):
    def get(self):
        user_id = session.get('user_id')
        user = None
        if user_id:
            user = db.session.get(User, user_id)

        if not user:
            return {"error": "unauthorized"}, 401

        # Serialize user info
        user_schema = UserSchema()
        user_data = user_schema.dump(user)

        # Serialize libraries with nested books and ratings using LibrarySchema
        library_schema = LibrarySchema(many=True, context={'user_id': user.id})
        libraries_data = library_schema.dump(user.libraries)

        return {"user": user_data, "libraries": libraries_data}, 200
    
# Create a new library for the current user
class LibraryCollection(Resource):
    def post(self):
        user_id = session.get('user_id')
        user = db.session.get(User, user_id)
        if not user:
            return {"error": "Unauthorized"}, 401
        data = request.get_json()
        name = data.get('name')
        private = data.get('private', False)
        if not name:
            return {"error": "Missing required field"}, 400

        try:
            library = Library(name=name, user_id=user.id, private=private)
            db.session.add(library)
            db.session.commit()
            library_schema = LibrarySchema()
            return library_schema.dump(library), 201
        except IntegrityError:
            return {'error': "422 Unprocessable Entity"}, 422

# Handle rename and delete of a library
class LibraryResource(Resource):
    def patch(self, id):
        user_id = session.get('user_id')
        library = db.session.get(Library, id)
        if not library or library.user_id != user_id:
            return {"error": "Library not found or access unauthorized"}, 404
        data = request.get_json()
        name = data.get("name")
        if not name:
            return {"error": "Missing required field 'name'"}, 400
        library.name = name
        db.session.commit()
        library_schema = LibrarySchema()
        return library_schema.dump(library), 200

    def delete(self, id):
        user_id = session.get('user_id')
        library = db.session.get(Library, id)
        if not library or library.user_id != user_id:
            return {"error": "Library not found or access unauthorized"}, 404
        db.session.delete(library)
        db.session.commit()
        return {}, 204

# Manage library contents: add books to a library
class LibraryBookList(Resource):
    def post(self, id):
        user_id = session.get('user_id')
        library = db.session.get(Library, id)
        if not library or library.user_id != user_id:
            return {"error": "Library not found or access unauthorized"}, 404

        data = request.get_json() or {}
        book_id = data.get('book_id')
        rating = data.get('rating')

        if not book_id:
            return {"error": "Missing required field 'book_id'"}, 400
        book = db.session.get(Book, book_id)
        if not book:
            return {"error": "Book not found"}, 404

        if rating is not None:
            try:
                rating = int(rating)
            except (ValueError, TypeError):
                return {"error": "Invalid rating provided"}, 400
            if rating < 1 or rating > 5:
                return {"error": "Rating must be between 1 and 5"}, 400

        # Prevent duplicate
        existing = LibraryBooks.query.filter_by(library_id=id, book_id=book_id).first()
        if existing:
            return {"error": "Book already exists in this library."}, 409

        library.books.append(book)
        lb = LibraryBooks.query.filter_by(library_id=id, book_id=book_id).first()
        if rating is not None:
            lb.rating = rating
        db.session.commit()

        book_schema = BookSchema(context={'user_id': session.get('user_id')})
        return book_schema.dump(book), 201
# Update or remove a specific book rating in a library
class LibraryBookDetail(Resource):
    # Update a book's rating in a specific library, enforcing 1–5 range
    def patch(self, library_id, book_id):
        user_id = session.get('user_id')
        user = db.session.get(User, user_id)
        if not user:
            return {"error": "Unauthorized"}, 401
        library = db.session.get(Library, library_id)
        if not library or library.user_id != user.id:
            return {"error": "Unauthorized or library not found"}, 404
        data = request.get_json()
        try:
            rating = int(data.get("rating"))
        except (ValueError, TypeError):
            return {"error": "Invalid rating provided"}, 400
        if rating is None:
            return {"error": "Rating is required"}, 400
        if rating < 1 or rating > 5:
            return {"error": "Rating must be between 1 and 5"}, 400

        library_books = db.session.query(LibraryBooks).join(Library).filter(
            LibraryBooks.book_id == book_id,
            Library.user_id == user.id
        ).all()
        if not library_books:
            return {"error": "No library associations found for this book for the current user"}, 404

        for lb in library_books:
            lb.rating = rating

        db.session.commit()
        updated_book = db.session.get(Book, book_id)
        updated_book_json = BookSchema(context={'user_id': user.id}).dump(updated_book)
        return updated_book_json, 200

    def delete(self, library_id, book_id):
        user_id = session.get('user_id')
        library = db.session.get(Library, library_id)
        if not library or library.user_id != user_id:
            return {"error": "Library not found or access unauthorized"}, 401
        library_book = LibraryBooks.query.filter_by(library_id=library_id, book_id=book_id).first()
        if not library_book:
            return {"error": "Library book association not found"}, 404
        book = db.session.get(Book, book_id)
        if library and book and book in library.books:
            library.books.remove(book)
        db.session.delete(library_book)
        db.session.commit()
        return {}, 204
# Fetch full book list with user and global ratings
class BookCollection(Resource):
    # Return full catalog of books, including user-specific and global ratings
    def get(self):
        books = Book.query.all()
        user_id = session.get('user_id')
        book_schema = BookSchema(many=True, context={'user_id': user_id})
        return book_schema.dump(books), 200

    def post(self):
        """Create a new global Book."""
        data = request.get_json() or {}
        title = data.get('title')
        author = data.get('author')
        genre = data.get('genre')
        published_year = data.get('published_year')

        if not title:
            return {"error": "Missing required field 'title'"}, 400
        if not author:
            author = "Unknown"
        # Validate published_year
        if published_year is not None:
            try:
                published_year = int(published_year)
            except (ValueError, TypeError):
                return {"error": "Invalid published_year"}, 400
        book = Book(title=title, author=author, genre=genre, published_year=published_year)
        db.session.add(book)
        db.session.commit()
        book_schema = BookSchema()
        return book_schema.dump(book), 201
    
class Rating(Resource):
    def get(self, count):
        all_books = Book.query.all()
        filtered = [book for book in all_books if len(book.library_books) >= count]
        schema = BookSchema(many=True)
        return schema.dump(filtered)
    
##Create a new resource called TopRatedBooks that returns all distinct books that have at least one rating of 5, using the LibraryBooks association table.
## query the model for all instances
## create a list comprehension that references the query (gets all)
## create a nested list comprehension using any() which can then reference the association to librarybooks.
## looks like "for every item in Book.query.all() if any book.library_books for each book.library_books .rating  is >= rating passed in, return that."
## create the schema
## return the schema
class MinRating(Resource):
    def get(self, rating):
        books = Book.query.all()
        selected = [book for book in books if any(librarybook.rating >= rating for librarybook in book.library_books)]
        schema = BookSchema(many=True)
        return schema.dump(selected)
        

api.add_resource(Signup, "/api/signup", endpoint='signup')
api.add_resource(Login, "/api/login", endpoint='login')
api.add_resource(Logout, "/api/logout", endpoint='logout')
api.add_resource(SessionUser, "/api/user_session", endpoint="user_session")
api.add_resource(LibraryCollection, "/api/libraries", endpoint="libraries")
api.add_resource(LibraryResource, "/api/libraries/<int:id>", endpoint="library")
api.add_resource(LibraryBookList, "/api/libraries/<int:id>/books", endpoint="library_books")
api.add_resource(LibraryBookDetail, "/api/libraries/<int:library_id>/books/<int:book_id>", endpoint="library_book_review")
api.add_resource(BookCollection, "/api/books", endpoint="books")
api.add_resource(Rating, "/api/many_ratings/<int:count>", endpoint="many_ratings")
api.add_resource(MinRating, "/api/min_rating/<int:rating>", endpoint='min_rating')
if __name__ == '__main__':
    app.run(port=5555, debug=True)
