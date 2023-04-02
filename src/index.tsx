import React from 'react';
import ReactDOM from 'react-dom';
import { EnrollmentUI } from './EnrollmentUI';
import { mergeStyles } from '@fluentui/react';
import reportWebVitals from './reportWebVitals';

export const ENROLLMENTS_API_URL = process.env.REACT_APP_ENROLLMENTS_API_URL;
export const GRADES_API_URL = process.env.REACT_APP_GRADES_API_URL;
export const TUITION_API_URL = process.env.REACT_APP_TUITION_API_URL;

// Inject some global styles
mergeStyles({
  ':global(body,html,#root)': {
    margin: 0,
    padding: 0,
    height: '100vh',
  },
});

ReactDOM.render(<EnrollmentUI />, document.getElementById('root'));

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
