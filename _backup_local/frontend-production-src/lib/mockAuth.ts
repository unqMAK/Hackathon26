// Mock authentication utilities
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'spoc' | 'student' | 'judge' | 'mentor';
  instituteId?: string;
  teamId?: string;
}

export const mockLogin = (email: string, password: string): User | null => {
  // Check for other registered users in localStorage
  let users = [];
  try {
    users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
  } catch (error) {
    console.error('Error parsing registeredUsers:', error);
    users = [];
  }
  const user = users.find((u: any) => u.email === email && u.password === password);

  if (user) {
    const { password, ...userWithoutPassword } = user;
    localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
    return userWithoutPassword;
  }

  return null;
};

export const mockRegister = (userData: any): User | null => {
  let users = [];
  try {
    users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
  } catch (error) {
    console.error('Error parsing registeredUsers:', error);
    users = [];
  }

  // Check if email already exists
  if (users.some((u: any) => u.email === userData.email)) {
    return null;
  }

  const newUser = {
    id: `user-${Date.now()}`,
    ...userData,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  localStorage.setItem('registeredUsers', JSON.stringify(users));

  const { password, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    localStorage.removeItem('user'); // Clear invalid data
    return null;
  }
};

export const logout = () => {
  localStorage.removeItem('user');
};

export const isAuthenticated = (): boolean => {
  return !!getCurrentUser();
};

export const hasRole = (role: User['role']): boolean => {
  const user = getCurrentUser();
  return user?.role === role;
};