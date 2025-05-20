declare module 'use-react-screenshot' {
  export function useScreenshot(): [
    string | null,
    (target: HTMLElement | null, options?: object) => Promise<string>
  ];
}
