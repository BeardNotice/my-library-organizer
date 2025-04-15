from models import User, Book, Library
from config import ma

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
    userRating = ma.Method('get_user_rating')
    review_score = ma.Method('calculate_review_score')
    globalRating = ma.Method('calculate_global_rating')
    
    @staticmethod
    def get_average_rating(library_books):
        ratings = [lb.rating for lb in library_books if lb.rating is not None]
        return round(sum(ratings) / len(ratings), 2) if ratings else None

    def get_user_rating(self, obj):
        user_id = self.context.get('user_id')
        if user_id and hasattr(obj, 'library_books'):
            for lb in obj.library_books:
                if lb.library and lb.library.user_id == user_id:
                    return lb.rating
        return None

    def calculate_global_rating(self, obj):
        return self.get_average_rating(obj.library_books)

    def calculate_review_score(self, obj):
        avg = self.get_average_rating(obj.library_books)
        return avg if avg is not None else "not yet rated"

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

#no longer used

# class LibraryBooksSchema(ma.SQLAlchemySchema):
#     class Meta:
#         model = LibraryBooks
#         load_instance = True

#     library_id = ma.auto_field()
#     book_id = ma.auto_field()
#     rating = ma.auto_field()
#     book = ma.Nested(BookSchema(only=("id", "title", "author", "genre")))
