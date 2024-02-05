import React, { useEffect, useState } from "react"
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Container, Col, Row, FormGroup, Card, CardBody, CardTitle } from 'reactstrap'
import {DatePicker} from "reactstrap-date-picker"
import LibraryApi from "../api";


const CheckOutStudent = ({modal, toggle, student , setUpdate}) => {

    const [books, setBooks] = useState([])
    const [selected, setSelected] = useState([])


    useEffect(() => {
        async function getBooks() {
            const newBooks = await LibraryApi.getUnread(student.id);
            const available = newBooks.filter((book) => book.available)
            setBooks(available);
        }
        getBooks()
    }, [])

    const INITIAL_STATE = {
        'student_id': student.id.toString(),
        'date': new Date().toISOString().slice(0, 10),
        'book_id': ""
    }

    const[formData, setFormData] = useState(INITIAL_STATE)

    const handleSubmit = (evt) => {
        evt.preventDefault()
        try{
            LibraryApi.checkOut(formData)
            setFormData(INITIAL_STATE)
            setUpdate(true);
            toggle()
        } catch(e){
            console.log(e)
        }
    }

    const handleDateChange = (v, f) => {
        setFormData(fData => ({
            ...fData,
            'date': f
        }));
        console.log(formData)
    }

    const handleBookChange = (id) => {
        setSelected(id)
        setFormData(fData => ({
            ...fData,
            'book_id': id
        }))
        console.log(formData)
    }

    return(
        <Modal isOpen={modal} toggle={toggle} backdrop={true} size="lg">
            <ModalHeader toggle={toggle}>
                Check-Out
            </ModalHeader>
            <ModalBody>
                <Container>
                    <Row>
                        <Col>
                        <FormGroup id="checkoutForm">
                            <DatePicker name="date" 
                                        id="datePicker"
                                        defaultValue={formData.date}
                                        dateFormat="YYYY-MM-DD"
                                        placeholder="YYYY-MM-DD"
                                        onChange={handleDateChange}
                                        disabled={!formData.student_id}
                                        />
                        </FormGroup>
                        </Col>
                        <Row>
                            {books.map((book) => {
                                return(
                                    <Col sm="3">
                                    <Card   className="my-2"
                                            color="secondary"
                                            outline={!(selected == book.id)}
                                            inverse={(selected == book.id)}
                                            onClick={() => {handleBookChange(book.id.toString())}}>
                                        <img    src={`https://covers.openlibrary.org/b/isbn/${book.isbn}-M.jpg`} 
                                                alt={`${book.title}`}/>
                                        <CardBody>
                                            <CardTitle>{book.title}</CardTitle>
                                            {book.available}
                                        </CardBody>
                                    </Card>
                                    </Col>
                                )
                            })}
                        </Row>
                    </Row>
                </Container>
            </ModalBody>
            <ModalFooter>
                <Button color="primary" onClick={handleSubmit}>Check Out</Button>
                <Button color="secondary" onClick={toggle}>Cancel</Button>
            </ModalFooter>
        </Modal>
    )
}

export default CheckOutStudent
