import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ShowData } from './ShowData.jsx';

describe('ShowData', () => {
  it('renders each key and value as a dt/dd pair inside a dl', () => {
    const { container } = render(
      <ShowData data={{ fullName: 'Nguyen Thai', studentId: '24521198' }} />,
    );
    expect(container.querySelector('dl')).not.toBeNull();
    expect(container.querySelectorAll('dt')).toHaveLength(2);
    const term = screen.getByText('fullName');
    expect(term.tagName).toBe('DT');
    expect(term.nextElementSibling.tagName).toBe('DD');
    expect(term.nextElementSibling.textContent).toBe('Nguyen Thai');
  });

  it('stringifies non-string values', () => {
    render(<ShowData data={{ count: 3, active: true }} />);
    expect(screen.getByText('3').tagName).toBe('DD');
    expect(screen.getByText('true').tagName).toBe('DD');
  });
});