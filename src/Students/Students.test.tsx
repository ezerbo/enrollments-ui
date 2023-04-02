import React from 'react';
import { render, screen } from '@testing-library/react';
import { Students } from "./Students";

it('renders "Welcome to Your Fluent UI App"', () => {
  render(<Students onCountChange={null}/>);
  const linkElement = screen.getByText(/Welcome to Your Fluent UI App/i);
  expect(linkElement).toBeInTheDocument();
});