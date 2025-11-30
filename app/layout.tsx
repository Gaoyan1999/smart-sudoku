import './global.css';
import { Banner } from './ui/banner';
import { SudokuProvider } from './context/sudoku-provider';
import { AuthProvider } from './context/auth-provider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <AuthProvider>
          <SudokuProvider>
            <Banner />
            {children}
          </SudokuProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
