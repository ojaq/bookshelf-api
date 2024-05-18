const { nanoid } = require('nanoid');
const books = require('./books');

/**
 * Handler to add new book
 * @param {*} request
 * @param {*} h
 * @returns {Object} response
 */
const addBookHandler = (request, h) => {
  const {
    name, year, author, summary, publisher, pageCount, readPage, reading,
  } = request.payload;

  //generate a unique id for the new book
  const id = nanoid(16);

  //check if the book is marked as finished based on readpage and pagecount
  const finished = pageCount === readPage;

  //get the current timestamp for insertion and update times
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;

  //create a new book object
  const newBook = {
    id,
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    finished,
    reading,
    insertedAt,
    updatedAt,
  };

  //check if the 'name' field is provided, if not return validation error
  if (typeof name === 'undefined') {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. Mohon isi nama buku',
    });

    response.code(400);
    return response;
  }

  //check if readpage is bigger than pagecount, return validation error
  if (readPage > pageCount) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
    });

    response.code(400);
    return response;
  }

  //add the new book to the books array
  books.push(newBook);

  //check if the book was successfully added and return response
  const isSuccess = books.filter((book) => book.id === id).length > 0;

  if (isSuccess) {
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil ditambahkan',
      data: {
        bookId: id,
      },
    });

    response.code(201);
    return response;
  }

  //if the book was not successfully added, return error response
  const response = h.response({
    status: 'error',
    message: 'Buku gagal ditambahkan',
  });

  response.code(500);
  return response;
};

/**
 * Handler to get all books
 * @param {*} request
 * @param {*} h
 * @returns {Object} response
 */
const getAllBooksHandler = (request, h) => {
  //extract query parameters for filtering
  const { name, reading, finished } = request.query;

  //check if books array is empty, return empty response if so
  if (books.length === 0) {
    const response = h.response({
      status: 'success',
      data: {
        books: [],
      },
    });

    response.code(200);
    return response;
  }

  //initialize the filteres book list with all books
  let filterBook = books;

  //apply filtering based on the 'name' query parameter (case sensitive)
  if (typeof name !== 'undefined') {
    filterBook = books.filter((book) => book.name.toLowerCase().includes(name.toLowerCase()));
  }
  //apply filtering based on the 'reading' query parameter (number comparison)
  if (typeof reading !== 'undefined') {
    filterBook = books.filter((book) => Number(book.reading) === Number(reading));
  }

  //appy filtering based on the 'finished' query parameter (number comparison)
  if (typeof finished !== 'undefined') {
    filterBook = books.filter((book) => Number(book.finished) === Number(finished));
  }

  //create a list of filtered books with id, name, publisher
  const listBook = filterBook.map((book) => ({
    id: book.id,
    name: book.name,
    publisher: book.publisher,
  }));

  //return success response with the filtered list of books
  const response = h.response({
    status: 'success',
    data: {
      books: listBook,
    },
  });

  response.code(200);
  return response;
};

/**
 * Handler to get book by id
 * @param {*} request
 * @param {*} h
 * @returns {Object} response
 */
const getBookByIdHandler = (request, h) => {
  //extract the bookid from request parameters
  const { bookId } = request.params;

  //find book with the specified bookid
  const book = books.filter((n) => n.id === bookId)[0];

  //check if book was found
  if (typeof book !== 'undefined') {
    //if found, create success response with book data
    const response = h.response({
      status: 'success',
      data: {
        book,
      },
    });

    response.code(200);
    return response;
  }

  //if book was not found, create fail response with error message
  const response = h.response({
    status: 'fail',
    message: 'Buku tidak ditemukan',
  });

  response.code(404);
  return response;
};

/**
 * Handler to edit book by id
 * @param {*} request
 * @param {*} h
 * @returns {Object} response
 */
const editBookByIdHandler = (request, h) => {
  //extract the bookid from request parameters
  const { bookId } = request.params;

  //extract request payload data for book update
  const {
    name, year, author, summary, publisher, pageCount, readPage, reading,
  } = request.payload;

  //get current timestamp for updatedat
  const updatedAt = new Date().toISOString();

  //find the index of the book with the specified bookid
  const index = books.findIndex((book) => book.id === bookId);

  //check if the 'name' fieldl is undefined, return validation error response
  if (typeof name === 'undefined') {
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Mohon isi nama buku',
    });

    response.code(400);
    return response;
  }

  //check if readpage is bigger than pagecount and return validation error response
  if (readPage > pageCount) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
    });

    response.code(400);
    return response;
  }

  //check if book was found
  if (index !== -1) {
    //if found, update book data and create success response
    books[index] = {
      ...books[index],
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      reading,
      updatedAt,
    };

    //create success reponse with success message
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil diperbarui',
    });

    response.code(200);
    return response;
  }

  //if book was not found create fail response with error message
  const response = h.response({
    status: 'fail',
    message: 'Gagal memperbarui buku. Id tidak ditemukan',
  });

  response.code(404);
  return response;
};

/**
 * Handler to delete book by id
 * @param {*} request
 * @param {*} h
 * @returns {Object} response
 */
const deleteBookByIdHandler = (request, h) => {
  const { bookId } = request.params;

  //find index of book with specified bookid
  const index = books.findIndex((book) => book.id === bookId);

  //check if book was found
  if (index !== -1) {
    //if found, remove book from 'books' array using splice
    books.splice(index, 1);

    //create success reponse with success message
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil dihapus',
    });

    response.code(200);
    return response;
  }

  //if book was not found, create fail response with error message
  const response = h.response({
    status: 'fail',
    message: 'Buku gagal dihapus. Id tidak ditemukan',
  });

  response.code(404);
  return response;
};

module.exports = {
  addBookHandler,
  getAllBooksHandler,
  getBookByIdHandler,
  editBookByIdHandler,
  deleteBookByIdHandler,
};