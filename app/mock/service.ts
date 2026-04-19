const delay = (ms = 600) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockSubmit = async <T>(result: T, ms = 700): Promise<T> => {
  await delay(ms);
  return result;
};

export const mockFetch = async <T>(result: T, ms = 400): Promise<T> => {
  await delay(ms);
  return result;
};
