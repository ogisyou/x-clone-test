import '@testing-library/jest-dom';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      // Add other custom matchers from @testing-library/jest-dom as needed
    }
  }
}

export {};