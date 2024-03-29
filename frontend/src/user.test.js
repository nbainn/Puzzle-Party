import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

// Create a new instance of axios-mock-adapter
const mock = new MockAdapter(axios);

describe('User Authentication Tests', () => {
  // Mock user data
  const newUser = {
    email: 'testuser@example.com',
    password: 'password123',
    nickname: 'testuser',
    userColor: '#FFFFFF'
  };
  let token;
  let userId;

  // Reset the mock after each test
  afterEach(() => {
    mock.reset();
  });

  // Test user signup
  test('User signup', async () => {
    mock.onPost('/signup').reply(201, {
      token: 'mock_token',
      userId: 'mock_userId'
    });

    const signupResponse = await axios.post('/signup', newUser);
    expect(signupResponse.status).toBe(201);
    expect(signupResponse.data).toHaveProperty('token');
    expect(signupResponse.data).toHaveProperty('userId');
    token = signupResponse.data.token; // Save the token for later tests
    userId = signupResponse.data.userId;
  });

  // Test user login
  test('User login', async () => {
    mock.onPost('/login').reply(200, {
      token: 'mock_token',
      userId: 'mock_userId'
    });

    const loginResponse = await axios.post('/login', {
      email: newUser.email,
      password: newUser.password,
    });
    expect(loginResponse.status).toBe(200);
    expect(loginResponse.data).toHaveProperty('token');
    expect(loginResponse.data).toHaveProperty('userId');
  });

  // Test Google OAuth login
  test('Google OAuth login', async () => {
    const googleToken = 'mock_google_oauth_token';
    mock.onPost('/googleLogin').reply(200, {
      token: 'mock_google_token'
    });

    const googleLoginResponse = await axios.post('/googleLogin', { token: googleToken });
    expect(googleLoginResponse.status).toBe(200);
    expect(googleLoginResponse.data).toHaveProperty('token');
  });

  // Test fetching user profile
  test('Fetch user profile', async () => {
    mock.onGet('/user/profile').reply(200, {
      email: newUser.email,
      name: newUser.nickname
    });

    const profileResponse = await axios.get('/user/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    expect(profileResponse.status).toBe(200);
    expect(profileResponse.data).toHaveProperty('email', newUser.email);
    expect(profileResponse.data).toHaveProperty('name', newUser.nickname);
  });
});
