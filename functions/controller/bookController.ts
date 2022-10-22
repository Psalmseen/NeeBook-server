import { Request, Response, NextFunction } from 'express';
import Book from '../model/bookModel';
export const getBooksController = async (
  _: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const book = await Book.find({});
    res.status(200).json({ message: 'Successful', status: 200, data: book });
  } catch (error) {
    next(error);
  }
};

export const getBooksCategoriesController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const allBooks = await Book.find({});
    const getItemsInGenre = (genre: string) =>
      allBooks.filter((el) => el.genre.includes(genre));

    const category = [
      {
        name: 'Best sellers',
        value: allBooks
          .map((el) => el)
          .sort((x, y) => (x.rents > y.rents ? -1 : 1))
          .slice(0, 10),
      },
      { name: 'Horror', value: getItemsInGenre('Horror') },
      { name: 'Thriller', value: getItemsInGenre('Thriller') },
      { name: 'Comedy', value: getItemsInGenre('Comedy') },
    ];

    res.status(200).json({
      status: 200,
      message: 'Successfully fetched movies by category',
      data: category,
    });
  } catch (err) {}
};
export const postBookController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { title, author, imageUrl, description, review, rents, genre } =
    req.body;
  try {
    const book = await Book.findOne({ title });
    if (book) {
      res.status(203).json({
        status: 203,
        message: `The book ${title
          .split(' ')
          .map((el: string) => el.toLowerCase())
          .join(' ')} exists in the data base`,
      });
    } else {
      const newbook = new Book({
        title,
        author,
        imageUrl,
        description,
        review,
        rents,
        genre,
      });
      await newbook.save();
      res.status(200).json({
        status: 200,
        message: `the book ${title} was added successfully`,
      });
    }
  } catch (err) {
    throw err;
  }
};

export const getBookController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  const book = await Book.findById(id);

  if (!book) {
    return res.status(404).json({ message: 'Book not found' });
  }

  res.status(200).json({ message: 'Successful', data: book });
};
