import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import AsyncState from './AsyncState';

describe('AsyncState', () => {
  test('provides a retry action for failed requests', () => {
    const markup = renderToStaticMarkup(<AsyncState error="Network unavailable" onRetry={() => {}} />);
    expect(markup).toContain('Network unavailable');
    expect(markup).toContain('Try again');
  });

  test('renders an explicit empty state', () => {
    const markup = renderToStaticMarkup(<AsyncState empty="No records" />);
    expect(markup).toContain('No records');
  });
});
