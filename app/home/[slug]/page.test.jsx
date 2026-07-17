import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import FullPost from './page';
import FullPostComponent from '../../../components/fullPost';

vi.mock('../../..//components/fullPost', () => ({
  __esModule: true,
  default: ({ post_id }) => <div data-testid="full-post">Post ID: {post_id}</div>,
}));

describe('FullPost page', () => {
  it('rend FullPostComponent avec le post_id extrait de params.slug', async () => {
    const params = { slug: '42' };
    const { container } = render(await FullPost({ params }));

    expect(screen.getByTestId('full-post')).toHaveTextContent('Post ID: 42');
  });
});