#!/usr/bin/env python3

# Standard library imports
from random import randint, choice as rc

# Remote library imports
from faker import Faker

# Local imports
from app import app
from models import db, User, Library

if __name__ == '__main__':
    fake = Faker()
    with app.app_context():
        print("Starting seed...")
        # Seed code goes here!

        db.session.query(Library).delete()
        db.session.query(User).delete()
        db.session.commit()

        users = []

        for _ in range(5):
            username = fake.user_name()
            email = fake.email()
            password = "password123"

            user = User(username=username, email=email)
            user.password_hash = password
            db.session.add(user)
            users.append(user)

        db.session.commit()

        for user in users:
            for _ in range(2):
                library_name = f"{user.username}'s {fake.word().capitalize()} Library"
                library = Library(name=library_name, user=user)
                db.session.add(library)
        
            db.session.commit()

        print("Seeding complete!")