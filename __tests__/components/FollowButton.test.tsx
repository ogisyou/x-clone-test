import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import FollowButton from '@/app/components/common/FollowButton';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  doc: jest.fn(),
  updateDoc: jest.fn(),
  arrayUnion: jest.fn(),
  arrayRemove: jest.fn(),
}));

describe('FollowButton', () => {
  const mockUserId = 'user123';
  const mockFollowing = new Set(['user456']);
  const mockOnFollowChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (getAuth as jest.Mock).mockReturnValue({
      currentUser: { uid: 'currentUser123' },
    });
    (getFirestore as jest.Mock).mockReturnValue({});
    (doc as jest.Mock).mockReturnValue({});
    (updateDoc as jest.Mock).mockResolvedValue({});
  });

  it('renders correctly when not following', () => {
    const { getByText } = render(
      <FollowButton
        userId={mockUserId}
        following={new Set()}
        onFollowChange={mockOnFollowChange}
      />
    );
    expect(getByText('フォロー')).toBeInTheDocument();
  });

  it('renders correctly when following', () => {
    const { getByText } = render(
      <FollowButton
        userId={mockUserId}
        following={new Set([mockUserId])}
        onFollowChange={mockOnFollowChange}
      />
    );
    expect(getByText('フォロー中')).toBeInTheDocument();
  });

  it('handles follow action correctly', async () => {
    const { getByText } = render(
      <FollowButton
        userId={mockUserId}
        following={new Set()}
        onFollowChange={mockOnFollowChange}
      />
    );
    
    fireEvent.click(getByText('フォロー'));

    await waitFor(() => {
      expect(updateDoc).toHaveBeenCalledTimes(2);
      expect(mockOnFollowChange).toHaveBeenCalledWith(mockUserId, true);
    });

    expect(getByText('フォロー中')).toBeInTheDocument();
  });

  it('handles unfollow action correctly', async () => {
    const { getByText } = render(
      <FollowButton
        userId={mockUserId}
        following={new Set([mockUserId])}
        onFollowChange={mockOnFollowChange}
      />
    );
    
    fireEvent.click(getByText('フォロー中'));

    await waitFor(() => {
      expect(updateDoc).toHaveBeenCalledTimes(2);
      expect(mockOnFollowChange).toHaveBeenCalledWith(mockUserId, false);
    });

    expect(getByText('フォロー')).toBeInTheDocument();
  });

  it('displays error message when user is not logged in', async () => {
    (getAuth as jest.Mock).mockReturnValue({ currentUser: null });

    const { getByText } = render(
      <FollowButton
        userId={mockUserId}
        following={new Set()}
        onFollowChange={mockOnFollowChange}
      />
    );
    
    fireEvent.click(getByText('フォロー'));

    await waitFor(() => {
      expect(getByText('ユーザーがログインしていません')).toBeInTheDocument();
    });
  });
});