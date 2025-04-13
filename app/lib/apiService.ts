// lib/fetcher.ts
class UnauthorizedError extends Error {
    constructor() {
      super('Unauthorized');
      this.name = 'UnauthorizedError';
    }
  }
  
  const fetcher = async (url: string) => {
    try {
      const res = await fetch(url, {
        credentials: 'include',
      });
  
      if (!res.ok) {
        if (res.status === 401) {
          throw new UnauthorizedError();
        }
        console.warn(`Failed to fetch: ${res.statusText}`);
        return [];
      }
  
      const data = await res.json();
      return data || [];
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error; // Let the component handle this
      }
  
      console.error("Error fetching data:", error);
      return [];
    }
  };
  
  export { fetcher, UnauthorizedError };
  