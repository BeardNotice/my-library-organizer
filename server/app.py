#!/usr/bin/env python3

# Standard library imports

from flask import request, session, make_response
from flask_restful import Resource
from sqlalchemy.exc import IntegrityError
# Local imports
from config import app, db, api
from models import User, Library, Book, LibraryBooks, UserSchema, LibrarySchema, BookSchema


# Views go here!
# Block requests to protected endpoints unless user is logged in
@app.before_request
def login_check():
    # Allow CORS preflight through without auth
    if request.method =='OPTIONS':
        return
    open_access_list = ['signup', 'login', 'logout', 'user_session', 'books', 'index', 'static']

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
            user_schema = UserSchema()
            return user_schema.dump(user), 201
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
        user_schema = UserSchema()
        return user_schema.dump(user), 200
# Log out current user
class Logout(Resource):
    def delete(self):
        session['user_id'] = None
        return {}, 204
# Return logged-in user and their libraries with ratings
class CheckSession(Resource):
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
class LibraryIndex(Resource):
##    def get(self):
##        user = get_current_user()
##        if not user:
##            return {"error": "User not authenticated"}, 401
##        library_schema = LibrarySchema(context={'user_id': session.get('user_id')}, many=True)
##        return library_schema.dump(user.libraries), 200

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

# Manage library contents: rename, add books, delete library
class LibraryBooksResource(Resource):
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
    
    def post(self, id):
        user_id = session.get('user_id')
        library = db.session.get(Library, id)
        if not library or library.user_id != user_id:
            return {"error": "Library not found or access unauthorized"}, 404

        data = request.get_json()
        book_id = data.get('book_id')
        title = data.get('title')
        author = data.get('author')
        genre = data.get('genre')
        published_year = data.get('published_year')
        rating = data.get('rating')

        if not title:
            return {"error": "Missing required field 'title'"}, 400
        if not author:
            author = "Unknown"

        if rating is not None and (rating < 1 or rating > 5):
            return {"error": "Rating must be between 1 and 5"}, 400

        book = db.session.get(Book, book_id)
        if not book:
            book = Book(title=title, author=author, genre=genre, published_year=published_year)
            db.session.add(book)

        if book not in library.books:
            library.books.append(book)

        library_book = LibraryBooks.query.filter_by(library_id=id, book_id=book.id).first()
        if library_book:
            library_book.rating = rating

        db.session.commit()
        library_schema = LibrarySchema(context={'user_id': session.get('user_id')})
        return library_schema.dump(library), 201

    def delete(self, id):
        user_id = session.get('user_id')
        library = db.session.get(Library, id)
        if not library or library.user_id != user_id:
            return {"error": "Library not found or access unauthorized"}, 404
        db.session.delete(library)
        db.session.commit()
        return {}, 204
# Update or remove a specific book rating in a library
class LibraryBookReview(Resource):
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
class BooksIndex(Resource):
    def get(self):
        books = Book.query.all()
        user_id = session.get('user_id')
        book_schema = BookSchema(many=True, context={'user_id': user_id})
        return book_schema.dump(books), 200

api.add_resource(Signup, "/api/signup", endpoint='signup')
api.add_resource(Login, "/api/login", endpoint='login')
api.add_resource(Logout, "/api/logout", endpoint='logout')
api.add_resource(CheckSession, "/api/user_session", endpoint="user_session")
api.add_resource(LibraryIndex, "/api/libraries", endpoint="libraries")
api.add_resource(LibraryBooksResource, "/api/libraries/<int:id>/books", endpoint="library_books")
api.add_resource(LibraryBookReview, "/api/libraries/<int:library_id>/books/<int:book_id>", endpoint="library_book_review")
api.add_resource(BooksIndex, "/api/books", endpoint="books")
if __name__ == '__main__':
    app.run(port=5555, debug=True)
