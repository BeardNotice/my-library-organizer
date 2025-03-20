#!/usr/bin/env python3

# Standard library imports
from random import randint, choice as rc

# Remote library imports
from faker import Faker

# Local imports
from app import app
from models import db, User, Library, Book

if __name__ == '__main__':
    fake = Faker()
    with app.app_context():
        print("Starting seed...")

        # Drop all tables and recreate them to ensure a clean slate.
        db.drop_all()
        db.create_all()

        users = []
        libraries = []
        books = []

        # Create users
        for _ in range(5):
            username = fake.user_name()
            email = fake.email()
            password = "password123"
            user = User(username=username, email=email)
            user.password_hash = password
            db.session.add(user)
            users.append(user)
        db.session.commit()

        # Create libraries for each user
        for user in users:
            for _ in range(2):
                library_name = f"{user.username}'s {fake.word().capitalize()} Library"
                library = Library(name=library_name, user=user)
                db.session.add(library)
                libraries.append(library)
        db.session.commit()

        # Create books
        for _ in range(10):
            title = fake.sentence(nb_words=3).strip(".")
            author = fake.name()
            genre = fake.word()
            published_year = int(fake.year())
            book = Book(title=title, author=author, genre=genre, published_year=published_year)
            db.session.add(book)
            books.append(book)
        db.session.commit()

        # Associate books with libraries
        for library in libraries:
            num_books = randint(3, 6)
            selected_books = set()
            available_books = set(books)
            while len(selected_books) < num_books and available_books:
                book = rc(list(available_books))
                selected_books.add(book)
                available_books.remove(book)
            for book in selected_books:
                library.books.append(book)
        db.session.commit()

        print("Seeding complete!")