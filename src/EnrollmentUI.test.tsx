import React from 'react';
import { render, screen } from '@testing-library/react';
import { EnrollmentUI } from './EnrollmentUI';

it('renders "Welcome to Your Fluent UI App"', () => {
  render(<EnrollmentUI />);
  const linkElement = screen.getByText(/Welcome to Your Fluent UI App/i);
  expect(linkElement).toBeInTheDocument();
});