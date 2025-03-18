from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.ext.associationproxy import association_proxy
from marshmallow import Schema, fields, validate

from config import db, bcrypt

# Models go here!

class User(db.Model, SerializerMixin):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), unique=True, nullable=False)
    email = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    
    libraries = db.relationship("Library", back_populates="user", cascade="all, delete-orphan")

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

class Library(db.Model, SerializerMixin):
    __tablename__ = "libraries"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(30), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    
    user = db.relationship("User", back_populates="libraries")
    library_books = db.relationship("LibraryBooks", back_populates="library", cascade="all, delete-orphan")
    books = association_proxy("library_books", "book", creator=lambda book_obj: LibraryBooks(book=book_obj))

class Book(db.Model, SerializerMixin):
    __tablename__ = "books"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    author = db.Column(db.String(50), nullable=False)
    genre = db.Column(db.String(50))
    published_year = db.Column(db.Integer)

    library_books = db.relationship("LibraryBooks", back_populates="book", cascade="all, delete-orphan")
    libraries = association_proxy("library_books", "library", creator=lambda library_obj: LibraryBooks(library=library_obj))

class LibraryBooks(db.Model, SerializerMixin):
    __tablename__ = "library_books"

    library_id = db.Column(db.Integer, db.ForeignKey("libraries.id"), primary_key=True)
    book_id = db.Column(db.Integer, db.ForeignKey("books.id"), primary_key = True)
    rating = db.Column(db.Integer, nullable=True)

    library = db.relationship("Library", back_populates="library_books")
    book = db.relationship("Book", back_populates="library_books")