declare module 'marked' {
  export function marked(input: string, options?: any): string;
  export const parse: (input: string, options?: any) => string;
}
