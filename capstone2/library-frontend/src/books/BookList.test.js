import React from "react";
import { render } from "@testing-library/react";
import BookList from "./BookList";
import StudentContext from "../StudentContext";


const books = {
    books:[{
        id: "101",
        title: "test book",
        isbn: "999-999-9999",
        stage: 2,
        condition: "great",
        available: "good",
    },
    {
        id: "102",
        title: "test book",
        isbn: "999-999-9999",
        stage: 2,
        condition: "great",
        available: "good",
    },
    {
        id: "102",
        title: "test book",
        isbn: "999-999-9999",
        stage: 2,
        condition: "great",
        available: "good",
    }]
};
const students = {
    students: [{
        fist_name: "test",
        last_name: "student",
    },
    {
        fist_name: "test",
        last_name: "student",
        book_id: "101",
    }]
};

// LibraryApi.getAllStudents = jest.fn();
// LibraryApi.getAllBooks = jest.fn(() => books);
// Smoke test
it("renders without crashing", () => {
    render(<StudentContext.Provider value={students}><BookList /></StudentContext.Provider>)
});

// Snapshot
it("matches snapshot", () => {
    const {asFragment} = render(<StudentContext.Provider value={students}><BookList /></StudentContext.Provider>);
    expect(asFragment()).toMatchSnapshot();
});

// test book list contains all books
it("contains all books from test data", () => {
    const {getAllByRole} = render(<StudentContext.Provider value={students}><BookList /></StudentContext.Provider>);
    expect(getAllByRole('heading').length).toEqual(books.books.length);
});


// renders correct number of books