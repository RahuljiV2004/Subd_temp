from datetime import datetime
import bcrypt
from pymongo import MongoClient, ASCENDING
from pymongo.errors import DuplicateKeyError
from bson import ObjectId

# MongoDB connection
client = MongoClient('mongodb://localhost:27017/')
db = client['subdomain_scanner']
users_collection = db['users']

# ✅ Ensure unique email index (DO THIS ONCE)
users_collection.create_index([('email', ASCENDING)], unique=True)

class User:
    def __init__(self, email, password=None, _id=None, password_hash=None, organization=None,
                 created_at=None, last_login=None):
        self.email = email
        if password_hash:
            self.password_hash = password_hash
        elif password:
            self.password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        else:
            raise ValueError("Either password or password_hash must be provided")

        self.organization = organization or email.split('@')[1]
        self.created_at = created_at or datetime.utcnow()
        self.last_login = last_login
        self._id = _id

    @staticmethod
    def find_by_email(email):
        user_data = users_collection.find_one({'email': email})
        if user_data:
            return User(
                email=user_data['email'],
                password_hash=user_data['password_hash'],
                organization=user_data['organization'],
                created_at=user_data['created_at'],
                last_login=user_data.get('last_login'),
                _id=user_data['_id']
            )
        return None

    @staticmethod
    def find_by_id(user_id):
        try:
            user_data = users_collection.find_one({'_id': ObjectId(user_id)})
            if user_data:
                return User(
                    email=user_data['email'],
                    password_hash=user_data['password_hash'],
                    organization=user_data['organization'],
                    created_at=user_data['created_at'],
                    last_login=user_data.get('last_login'),
                    _id=user_data['_id']
                )
        except Exception as e:
            print("Error in find_by_id:", e)
        return None

    def save(self):
        user_data = {
            'email': self.email,
            'password_hash': self.password_hash,
            'organization': self.organization,
            'created_at': self.created_at,
            'last_login': self.last_login
        }
        result = users_collection.insert_one(user_data)
        self._id = result.inserted_id
        return self

    def update(self):
        users_collection.update_one(
            {'_id': self._id},
            {'$set': {'last_login': self.last_login}}
        )

    def check_password(self, password):
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))

    def to_dict(self):
        return {
            'id': str(self._id),
            'email': self.email,
            'organization': self.organization,
            'created_at': self.created_at.isoformat(),
            'last_login': self.last_login.isoformat() if self.last_login else None
        }
