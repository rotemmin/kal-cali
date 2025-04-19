export function validateEmail(email: string): { isValid: boolean; reason?: string } {
    if (!email || email.trim() === '') {
        return { isValid: false, reason: 'נא להזין כתובת אימייל' };
      }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { isValid: false, reason: 'פורמט אימייל לא תקין' };
      }
    
    return { isValid: true };
}