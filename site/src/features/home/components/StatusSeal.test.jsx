import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import StatusSeal from './StatusSeal.jsx';

test('displays an unavailable state rather than a pending trail on error', () => {
  render(<StatusSeal error />);
  expect(screen.getByRole('status')).toHaveTextContent('Indisponível');
  expect(screen.queryByText('Pendente')).not.toBeInTheDocument();
});
