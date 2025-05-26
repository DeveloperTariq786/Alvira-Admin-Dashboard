export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
export interface ResendOtpResponse {
  success: boolean;
  message: string;
  phone: string;
}

export interface VerifyPhonePayload {
  phone: string;
  verificationToken: string;
}

export interface VerifyPhoneResponse {
  id: string;
  name: string;
  phone: string;
  role: string;
  isPhoneVerified: boolean;
  token: string;
}

export const resendOtp = async (phone: string): Promise<ResendOtpResponse> => {
  const response = await fetch(`${API_BASE_URL}/users/resend-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ phone }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to resend OTP');
  }
  return response.json();
};

export const verifyPhone = async (payload: VerifyPhonePayload): Promise<VerifyPhoneResponse> => {
  const response = await fetch(`${API_BASE_URL}/users/verify-phone`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to verify phone');
  }
  const data = await response.json();
  if (data.token) {
    localStorage.setItem('authToken', data.token);
  }
  return data;
};

export const getToken = (): string | null => {
  return localStorage.getItem('authToken');
};

export const removeToken = (): void => {
  localStorage.removeItem('authToken');
}; 