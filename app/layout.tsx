import './global.css';
import { Banner } from './ui/banner';
import { SudokuProvider } from './context/sudoku-provider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <SudokuProvider>
          <Banner />
          {children}
        </SudokuProvider>
      </body>
    </html>
  );
}
