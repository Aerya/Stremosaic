import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ReleaseFilters } from './ReleaseFilters';

describe('ReleaseFilters', () => {
  const baseProps = {
    localCatalog: { type: 'series', filters: {} },
    onFiltersChange: vi.fn(),
    isMovie: false,
    countries: [],
    releaseTypes: [],
    tvStatuses: [
      { value: '0', label: 'Returning Series' },
      { value: '3', label: 'Ended' },
    ],
    tvTypes: [
      { value: '4', label: 'Scripted' },
      { value: '3', label: 'Reality' },
    ],
    certOptions: [],
    certCountries: [],
  };

  it('renders only one Any option for show status and show type dropdowns', () => {
    render(<ReleaseFilters {...baseProps} />);

    fireEvent.click(screen.getByRole('combobox', { name: /statut de la série/i }));
    let listbox = screen.getByRole('listbox');
    expect(within(listbox).getAllByText('Tous')).toHaveLength(1);
    fireEvent.mouseDown(document.body);

    fireEvent.click(screen.getByRole('combobox', { name: /type de série/i }));
    listbox = screen.getByRole('listbox');
    expect(within(listbox).getAllByText('Tous')).toHaveLength(1);
  });

  it('updates first-air-year max when current year changes', () => {
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date('2026-04-09T12:00:00Z'));
      const { rerender } = render(<ReleaseFilters {...baseProps} />);

      expect(screen.getByPlaceholderText('e.g. 2019')).toHaveAttribute('max', '2027');

      vi.setSystemTime(new Date('2027-01-15T12:00:00Z'));
      rerender(
        <ReleaseFilters
          {...baseProps}
          localCatalog={{
            type: 'series',
            filters: { ...baseProps.localCatalog.filters, tvStatus: '0' },
          }}
        />
      );

      expect(screen.getByPlaceholderText('e.g. 2019')).toHaveAttribute('max', '2028');
    } finally {
      vi.useRealTimers();
    }
  });

  it('shows regional appearance controls for series', () => {
    render(
      <ReleaseFilters
        {...baseProps}
        countries={[{ iso_3166_1: 'US', english_name: 'United States' }]}
        releaseTypes={[{ value: 4, label: 'Digital' }]}
      />
    );

    expect(screen.getByText('Apparence régionale')).toBeInTheDocument();
    expect(screen.getByText('Type d’apparence régionale')).toBeInTheDocument();
    expect(screen.getByText('Sélectionnez d’abord une région ci-dessus pour filtrer par type de sortie')).toBeInTheDocument();
  });

  it('restricts series regional appearance type options to Premiere, Digital and TV', () => {
    render(
      <ReleaseFilters
        {...baseProps}
        countries={[{ iso_3166_1: 'US', english_name: 'United States' }]}
        localCatalog={{ type: 'series', filters: { region: 'US' } }}
        releaseTypes={[
          { value: 1, label: 'Premiere' },
          { value: 2, label: 'Limited Theatrical' },
          { value: 3, label: 'Theatrical' },
          { value: 4, label: 'Digital' },
          { value: 5, label: 'Physical' },
          { value: 6, label: 'TV' },
        ]}
      />
    );

    fireEvent.click(screen.getByText('Tous types'));
    expect(screen.getByText('Premiere')).toBeInTheDocument();
    expect(screen.getByText('Digital')).toBeInTheDocument();
    expect(screen.getByText('TV')).toBeInTheDocument();
    expect(screen.queryByText('Limited Theatrical')).not.toBeInTheDocument();
    expect(screen.queryByText('Theatrical')).not.toBeInTheDocument();
    expect(screen.queryByText('Physical')).not.toBeInTheDocument();
  });

  it('shows helper text for Show Premiered To and renders timezone as searchable select', () => {
    render(<ReleaseFilters {...baseProps} />);

    expect(screen.getByText('Date maximale de première diffusion à inclure')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /fuseau horaire/i })).toBeInTheDocument();
  });

  it('allows searching timezone by country name', () => {
    render(<ReleaseFilters {...baseProps} />);

    fireEvent.click(screen.getByRole('combobox', { name: /fuseau horaire/i }));
    const searchInput = screen.getByPlaceholderText('Rechercher un fuseau horaire...');
    fireEvent.change(searchInput, { target: { value: 'india' } });

    expect(screen.getByText('Asia/Kolkata')).toBeInTheDocument();
  });
});
