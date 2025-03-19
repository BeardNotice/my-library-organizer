#!/usr/bin/env python3

# Standard library imports

# Remote library imports
from flask import request, session, make_response
from flask_restful import Resource
from sqlalchemy.exc import IntegrityError

# Local imports
from config import app, db, api
# Add your model imports
from models import User, Library, Book, LibraryBooks


# Views go here!
@app.before_request
def login_check():
    open_access_list = ['signup', 'login', 'check_session']

    if (request.endpoint) not in open_access_list and (not session.get('user_id')):
        return {'error': '401 unauthorized'}, 401

class Signup(Resource):
    def post(self):
        data = request.get_json()
        username = data.get("username")
        email = data.get("email")
        password = data.get("password")

        if not username or not email or not password:
            return {"error": "Missing requried fields"}, 400
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
            return user.to_dict(), 201
        except IntegrityError:
            return {'error': '401 Unauthorized'}, 401
    
class Login(Resource):
    def post(self):
        data = request.get_json()
        username = data.get("username")
        password = data.get("password")

        user = User.query.filter(User.username == username).first()
        if user:
            if user.authenticate(password):
                session['user_id'] = user.id
                return user.to_dict(), 200
        return {'error': '401 Unauthorized'}, 401

class Logout(Resource):
    def delete(self):
        session['user_id'] = None
        return {}, 204
    
class CheckSession(Resource):
    def get(self):
        user_id = session['user_id']
        if user_id:
            user = User.query.filter(User.id == user_id).first()
            return user.to_dict(), 200
        return {}, 401
    
class LibraryIndex(Resource):
    def get(self):

        user = User.query.filter(User.id == session['user_id']).first()
        return [library.to_dict() for library in user.libraries], 200
    
    def post(self):
        user_id = session.get('user_id')
        if not user_id:
            return {"error": "Unauthorized"}, 401
        data = request.get_json()
        name = data['name']

        try:
            library = Library(name=name, user_id=session['user_id'])
            db.session.add(library)
            db.session.commit()
            return library.to_dict(), 201
        except IntegrityError:
            return {'error': "422 Unprocessable Entity"}, 422

class LibraryByID(Resource):
    def get(self, id):
        library_list = Library.query.filter_by(id=id).first().to_dict()
        return make_response(library_list, 200)

api.add_resource(Signup, "/signup", endpoint='signup')
api.add_resource(Login, "/login", endpoint='login')
api.add_resource(Logout, '/logout', endpoint='logout')
api.add_resource(CheckSession, "/check_session", endpoint="check_session")
api.add_resource(LibraryIndex, "/library", endpoint="library")
api.add_resource(LibraryByID, "/library/<int:id>")
if __name__ == '__main__':
    app.run(port=5555, debug=True)

