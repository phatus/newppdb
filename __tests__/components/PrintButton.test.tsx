
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PrintButton from '../../src/components/PrintButton';

// Mock window.print
const originalPrint = global.window.print;
beforeAll(() => {
    global.window.print = jest.fn();
});

afterAll(() => {
    global.window.print = originalPrint;
});

describe('PrintButton', () => {
    it('renders correctly', () => {
        render(<PrintButton />);
        const button = screen.getByRole('button', { name: /Cetak Kartu/i });
        expect(button).toBeInTheDocument();
    });

    it('calls window.print when clicked', () => {
        render(<PrintButton />);
        const button = screen.getByRole('button', { name: /Cetak Kartu/i });
        fireEvent.click(button);
        expect(global.window.print).toHaveBeenCalledTimes(1);
    });
});
