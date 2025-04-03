# Standard library imports

# Remote library imports
from flask import Flask, render_template
from flask_cors import CORS
from flask_migrate import Migrate
from flask_restful import Api
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from sqlalchemy import MetaData
from flask_bcrypt import Bcrypt
from dotenv import load_dotenv

# Local imports
import os

# Instantiate app, set attributes
load_dotenv()
app = Flask(__name__,
            static_url_path='',
            static_folder='../client/build',
            template_folder='../client/build'
            )
app.config['SECRET_KEY'] = os.getenv("SECRET_KEY", 'cffccf6faa164a4896ad0b2efa28fe7d')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URI', 'sqlite:///app.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.json.compact = False

# Define metadata, instantiate db
metadata = MetaData(naming_convention={
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
})
db = SQLAlchemy(metadata=metadata)
migrate = Migrate(app=app, db=db)
db.init_app(app)

bcrypt = Bcrypt(app)

# Instantiate REST API
api = Api(app)

# Instantiate CORS
CORS(app, supports_credentials=True)

ma = Marshmallow(app)

@app.errorhandler(404)
def not_found(e):
    return render_template("index.html")
