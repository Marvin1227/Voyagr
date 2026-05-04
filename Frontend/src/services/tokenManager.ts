let token: string | null = null;

export const getAccessToken = (): string | null => token;
export const setAccessToken = (t: string | null): void => { token = t; };
