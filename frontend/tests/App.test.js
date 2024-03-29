// these tests aren't fully functional yet, as I wasn't able to figure out getting the renderWithProviders function working properly; needs work

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';
import { AuthProvider } from '../src/AuthContext';
import axios from 'axios';

jest.mock('axios');

// Helper function to render the App with Router and AuthProvider
const renderWithProviders = (ui, { route = '/' } = {}) => {
  return render(
    <AuthProvider>
      {ui}
    </AuthProvider>
  );
};

describe('App Component', () => {

  test('renders LandingPage at root route', () => {
    renderWithProviders(<App />);
    expect(screen.getByText('Welcome to Puzzle Party')).toBeInTheDocument();
  });

  test('navigates to SignupPage when clicking on Sign Up link', () => {
    renderWithProviders(<App />);
    const signupLink = screen.getByText(/Sign Up/i);
    fireEvent.click(signupLink);
    expect(screen.getByText('Create Account')).toBeInTheDocument();
  });

  test('redirects to LandingPage when trying to access protected route without authentication', () => {
    renderWithProviders(<App />, { route: '/home' });
    expect(screen.getByText('Welcome to Puzzle Party')).toBeInTheDocument();
  });

  // Test for checking a login scenario
  test('navigates to HomePage after successful login', async () => {
    // Mock the useAuth hook to simulate a logged-in user
    jest.mock("./hooks/useAuth", () => ({
      useAuth: () => ({
        isAuthenticated: true,
        isGuest: false,
      }),
    }));
  
    renderWithProviders(<App />);
  
    // Check for an element unique to HomePage
    await waitFor(() => {
      expect(screen.getByText('Unique Text on HomePage')).toBeInTheDocument();
    });
  });
  
  // Test for navigating to RoomPage
  test('navigates to RoomPage when authenticated and room ID is provided', () => {
    // Mock the useAuth hook to simulate a logged-in user
    jest.mock("./hooks/useAuth", () => ({
      useAuth: () => ({
        isAuthenticated: true,
        isGuest: false,
      }),
    }));
  
    renderWithProviders(<App />, { route: '/room/12345' });
  
    expect(screen.getByText('Room:')).toBeInTheDocument();
  });

  // Test for signing up a new user
  test('allows a user to sign up', async () => {
    renderWithProviders(<App />, { route: '/signup' });
    axios.post.mockResolvedValueOnce({
      data: {
        token: 'fake_token',
        userId: '123',
        nickname: 'newnickname',
        userColor: '#FF5733',
      },
    });

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const nicknameInput = screen.getByLabelText(/nickname/i);
    const colorInput = screen.getByLabelText(/favorite color/i);
    const signupButton = screen.getByText('Create Account');

    fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'newpassword' } });
    fireEvent.change(nicknameInput, { target: { value: 'newnickname' } });
    fireEvent.change(colorInput, { target: { value: '#FF5733' } });
    fireEvent.click(signupButton);

    await waitFor(() => {
      expect(screen.getByText('Welcome to Puzzle Party')).toBeInTheDocument();
    });
  });
/*
  // Test for chat functionality in RoomPage
  test('allows sending messages in a chatbox when in a room', async () => {
    AuthContext.Provider.value = { isAuthenticated: true, ablyClient:  Mock Ably Client  };

    renderWithProviders(<App />, { route: '/room/12345' });
    const messageInput = screen.getByPlaceholderText('Type here...');
    const sendButton = screen.getByRole('button', { name: 'Send' });

    fireEvent.change(messageInput, { target: { value: 'Hello, World!' } });
    fireEvent.click(sendButton);

    // Verify that the message was sent (requires mocking Ably Client)
  });
*/
/*
  test('allows creating a new puzzle room', async () => {
    renderWithProviders(<App />, { route: '/create-room' });

    // Fill out the form for creating a room
    const roomInput = screen.getByLabelText('Room Name');
    const createButton = screen.getByText('Create Room');

    fireEvent.change(roomInput, { target: { value: 'New Room' } });
    fireEvent.click(createButton);

    // Verify room creation logic (e.g., API call mock, navigation to the new room)
  });
*/
/*
  test('allows updating user profile', async () => {
    // Assuming you have a route for profile page
    renderWithProviders(<App />, { route: '/profile' });
  
    const nicknameInput = screen.getByLabelText('Nickname');
    const saveButton = screen.getByText('Save Profile');
  
    fireEvent.change(nicknameInput, { target: { value: 'Updated Nickname' } });
    fireEvent.click(saveButton);
  
    // Verify profile update logic (e.g., API call mock)
  });
*/

});