import React from 'react';
import { render, screen } from '@testing-library/react';
import { Courses } from "./Courses";

it('renders "Welcome to Your Fluent UI App"', () => {
  render(<Courses />);
  const linkElement = screen.getByText(/Welcome to Your Fluent UI App/i);
  expect(linkElement).toBeInTheDocument();
});