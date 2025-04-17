#!/usr/bin/env python3

# Standard library imports

# Remote library imports
from flask import request, session, make_response
from flask_restful import Resource
from sqlalchemy.exc import IntegrityError

# Local imports
from config import app, db, api
# Add your model imports
from models import User, Library, Book, LibraryBooks, UserSchema, LibrarySchema, BookSchema

def get_current_user():
    return db.session.get(User, session.get('user_id'))

def get_library_by_id(library_id, require_owner=False):
    """Fetch a library by ID. If require_owner is True, ensure the current user owns the library."""
    library = db.session.get(Library, library_id)
    if not library:
        return None
    if library.private and library.user_id != session.get('user_id'):
        return None
    if require_owner and library.user_id != session.get('user_id'):
        return None
    return library

# Views go here!
@app.before_request
def login_check():
    
    if request.method =='OPTIONS':
        return
    open_access_list = ['signup', 'login', 'check_session', 'books', 'index', 'static']

    if (request.endpoint) not in open_access_list and (not session.get('user_id')):
        return {'error': '401 unauthorized'}, 401
    
class Index(Resource):
    def get(self):
        return app.send_static_file('index.html')


class Signup(Resource):
    def post(self):
        data = request.get_json()
        username = data.get("username")
        email = data.get("email")
        password = data.get("password")

        if not username or not email or not password:
            return {"error": "Missing required fields"}, 400
        existing_user = User.query.filter_by(username=username).first()
        existing_email = User.query.filter_by(email=email).first()
        if existing_user:
            return {'error': 'Username already taken'}, 409
        if existing_email:
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

class Logout(Resource):
    def delete(self):
        session['user_id'] = None
        return {}, 204
    
class CheckSession(Resource):
    def get(self):
        user_id = session.get('user_id')
        if user_id:
            user = User.query.filter(User.id == user_id).first()
            user_schema = UserSchema()
            return user_schema.dump(user), 200
        return {}, 401
    
class LibraryIndex(Resource):
    def get(self):
        user = get_current_user()
        if not user:
            return {"error": "User not authenticated"}, 401
        library_schema = LibrarySchema(context={'user_id': session.get('user_id')}, many=True)
        return library_schema.dump(user.libraries), 200
    
    def post(self):
        user = get_current_user()
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


class LibraryBooksResource(Resource):
    def put(self, id):
        library = get_library_by_id(id)
        if not library:
            return {"error": "Library not found or access unauthorized"}, 404
        data = request.get_json()
        name = data.get("name")
        if not name:
            return {"error": "Missing required field 'name'"}, 400
        library.name = name
        db.session.commit()
        library_schema = LibrarySchema()
        return library_schema.dump(library), 200
    

    def get(self, id):
        library = get_library_by_id(id)
        if not library:
            return {"error": "Library not found"}, 404

        library_schema = LibrarySchema()
        return make_response(library_schema.dump(library), 200)
    
    def post(self, id):
        library = get_library_by_id(id)
        if not library:
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
        
        book = Book.query.filter(Book.id == book_id).first()
        if not book:
            book = Book(title=title, author=author, genre=genre, published_year=published_year)
            db.session.add(book)
            db.session.commit()
        
        if book not in library.books:
            library.books.append(book)

        library_book = LibraryBooks.query.filter_by(library_id=id, book_id=book.id).first()
        if library_book:
            library_book.rating = rating

        db.session.commit()
        library_schema = LibrarySchema(context={'user_id': session.get('user_id')})
        return library_schema.dump(library), 201

    def delete(self, id):
        library = get_library_by_id(id, require_owner=True)
        if not library:
            return {"error": "Library not found or access unauthorized"}, 404
        db.session.delete(library)
        db.session.commit()
        return {}, 204
    
class LibraryBookReview(Resource):
    def put(self, library_id, book_id):
        user = get_current_user()
        if not user:
            return {"error": "Unauthorized"}, 401
        library = Library.query.filter_by(id=library_id, user_id=user.id).first()
        if not library:
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
        user = get_current_user()
        if not user:
            return {"error": "Unauthorized"}, 401
        library = get_library_by_id(library_id, require_owner=True)
        if not library:
            return {"error": "Unauthorized or library not found"}, 401
        library_book = LibraryBooks.query.filter_by(library_id=library_id, book_id=book_id).first()
        if not library_book:
            return {"error": "Library book association not found"}, 404
        book = db.session.get(Book, book_id)
        if library and book and book in library.books:
            library.books.remove(book)
        db.session.delete(library_book)
        db.session.commit()
        return {}, 204
            
class BooksIndex(Resource):
    def get(self):
        books = Book.query.all()
        user_id = session.get('user_id')
        book_schema = BookSchema(many=True, context={'user_id': user_id})
        return book_schema.dump(books), 200

api.add_resource(Index, "/")
api.add_resource(Signup, "/api/signup", endpoint='signup')
api.add_resource(Login, "/api/login", endpoint='login')
api.add_resource(Logout, '/logout', endpoint='logout')
api.add_resource(CheckSession, "/check_session", endpoint="check_session")
api.add_resource(LibraryIndex, "/api/library", endpoint="library")
## Removed LibraryByID resource; its functionality is now handled by LibraryBooksResource
api.add_resource(LibraryBooksResource, "/api/library/<int:id>/books")
api.add_resource(LibraryBookReview, "/api/library/<int:library_id>/books/<int:book_id>")
api.add_resource(BooksIndex, "/api/books", endpoint="books")
if __name__ == '__main__':
    app.run(port=5555, debug=True)
