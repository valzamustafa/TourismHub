// C:\Users\altin\TourismHub\client\src\components\admin\utils\tokenRefresh.ts

export const checkSessionExpiry = (): boolean => {
  try {

    const expiryStr = localStorage.getItem('refreshTokenExpiry');
    
 
    if (!expiryStr) {
      return false;
    }
    

    const expiryDate = new Date(expiryStr);
    const now = new Date();
    
  
    const isExpired = now >= expiryDate;
    
    console.log('Session expiry check:', {
      expiry: expiryDate.toISOString(),
      now: now.toISOString(),
      isExpired: isExpired,
      hoursRemaining: (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60)
    });
    
    return isExpired;
  } catch (error) {
    console.error('Error checking session expiry:', error);
    return false;
  }
};


export const clearSessionData = (): void => {
  console.log('Clearing session data...');
  

  const rememberedEmail = localStorage.getItem('rememberedEmail');
  

  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  localStorage.removeItem('accessTokenExpiry');
  localStorage.removeItem('refreshTokenExpiry');
  

  if (rememberedEmail) {
    localStorage.setItem('rememberedEmail', rememberedEmail);
  }
};


export const handleExpiredSession = (): void => {
  if (checkSessionExpiry()) {
    console.log('Session has expired!');
    clearSessionData();
    

    if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
      setTimeout(() => {
        alert('Your session has expired. Please login again.');
        window.location.href = '/login';
      }, 100);
    }
  }
};



export const setupSessionChecker = (): (() => void) => {
  console.log('Setting up session expiry checker...');
  
  handleExpiredSession();
  

  const interval = setInterval(handleExpiredSession, 5 * 60 * 1000);
  

  return () => {
    clearInterval(interval);
    console.log('Session checker stopped');
  };
};