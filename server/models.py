from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.ext.hybrid import hybrid_property
import re
from sqlalchemy.orm import validates
import datetime
from marshmallow import pre_dump

from config import db, bcrypt, ma


# Models go here!

class User(db.Model, SerializerMixin):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), unique=True, nullable=False)
    email = db.Column(db.String(50), unique=True, nullable=False)
    _password_hash = db.Column(db.String(128), nullable=False)
    
    libraries = db.relationship("Library", back_populates="user", cascade="all, delete-orphan")

    @validates('email')
    def validate_email(self, key, address):
        if not re.match(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$", address):
            raise ValueError("Provided email is not valid.")
        return address

    @hybrid_property
    def password_hash(self):
        raise AttributeError('Password hashes may not be viewed')
    
    @password_hash.setter
    def password_hash(self, password):
        password_hash = bcrypt.generate_password_hash(password.encode('utf-8'))
        self._password_hash = password_hash.decode('utf-8')

    def authenticate(self, password):
        return bcrypt.check_password_hash(self._password_hash, password.encode('utf-8'))

class Library(db.Model, SerializerMixin):
    __tablename__ = "libraries"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    private = db.Column(db.Boolean, default=False, nullable=False)
    
    user = db.relationship("User", back_populates="libraries")
    library_books = db.relationship("LibraryBooks", back_populates="library", cascade="all, delete-orphan")
    books = association_proxy("library_books", "book", creator=lambda book_obj: LibraryBooks(book=book_obj))

    @validates('name')
    def validate_name(self, key, name):
        if not (3 <= len(name) <= 100):
            raise ValueError("Library name must be between 3 and 30 characters.")
        return name

class Book(db.Model, SerializerMixin):
    __tablename__ = "books"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    author = db.Column(db.String(50), nullable=False)
    genre = db.Column(db.String(50))
    published_year = db.Column(db.Integer)

    library_books = db.relationship("LibraryBooks", back_populates="book", cascade="all, delete-orphan")
    libraries = association_proxy("library_books", "library", creator=lambda library_obj: LibraryBooks(library=library_obj))

    @validates('published_year')
    def validate_published_year(self, key, year):
        current_year = datetime.datetime.now().year
        if year and year > current_year:
            raise ValueError("Published year cannot be in the future.")
        return year

class LibraryBooks(db.Model, SerializerMixin):
    __tablename__ = "library_books"

    library_id = db.Column(db.Integer, db.ForeignKey("libraries.id"), primary_key=True)
    book_id = db.Column(db.Integer, db.ForeignKey("books.id"), primary_key = True)
    rating = db.Column(db.Integer, nullable=True)

    library = db.relationship("Library", back_populates="library_books")
    book = db.relationship("Book", back_populates="library_books")

    @validates('rating')
    def validate_rating(self, key, rating):
        if rating is not None and (rating < 1 or rating > 5):
            raise ValueError("Rating must be between 1 and 5.")
        return rating
    @property
    def user_id(self):
        return self.library.user_id

class UserSchema(ma.SQLAlchemySchema):
    class Meta:
        model = User
        load_instance = True
        
    id = ma.auto_field()
    username = ma.auto_field()
    email = ma.auto_field()

class BookSchema(ma.SQLAlchemySchema):
    class Meta:
        model = Book
        load_instance = True

    id = ma.auto_field()
    title = ma.auto_field()
    author = ma.auto_field()
    genre = ma.auto_field()
    published_year = ma.auto_field()
    review_score = ma.Method('calculate_review_score')
    globalRating = ma.Method('calculate_global_rating')

    def calculate_review_score(self, obj):
        all_ratings = [lb.rating for lb in obj.library_books if lb.rating is not None]
        rating = sum(all_ratings) / len(all_ratings) if all_ratings else None
        return round(rating, 2) if rating is not None else "not yet rated"
    
    def calculate_global_rating(self, obj):
        all_ratings = [lb.rating for lb in obj.library_books if lb.rating is not None]
        rating = sum(all_ratings) / len(all_ratings) if all_ratings else None
        return round(rating, 2) if rating is not None else None

class LibrarySchema(ma.SQLAlchemySchema):
    class Meta:
        model = Library
        load_instance = True

    id = ma.auto_field()
    name = ma.auto_field()
    user_id = ma.auto_field()
    private = ma.auto_field()
    books = ma.Nested(BookSchema, many=True)

    # @pre_dump
    # def remove_invalid_books(self, data, **kwargs):
    #     data.books = [book for book in data.books if isinstance(book, Book)]
    #     return data

class LibraryBooksSchema(ma.SQLAlchemySchema):
    class Meta:
        model = LibraryBooks
        load_instance = True

    library_id = ma.auto_field()
    book_id = ma.auto_field()
    rating = ma.auto_field()
    book = ma.Nested(BookSchema(only=("id", "title", "author", "genre")))
