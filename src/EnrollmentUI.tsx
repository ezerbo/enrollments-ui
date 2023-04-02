import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './EnrollmentUI.css';
import { Home } from './Home/Home';

export class EnrollmentUI extends React.Component {

    render() {
        return (
            <BrowserRouter>
                <Routes>
                    <Route path='/' element={ <Home/> }/>
                </Routes>
            </BrowserRouter>
        );
    }

}
