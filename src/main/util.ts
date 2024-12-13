/* eslint import/prefer-default-export: off */
import { URL } from 'url';
import path from 'path';

export function resolveHtmlPath(htmlFileName: string) {
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || 1212;
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  }
  console.log('resolveHtmlPath', __dirname, htmlFileName, path.resolve(__dirname, '../renderer/', htmlFileName), `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`);
  return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
}
