import './global.css';
import { Banner } from './ui/banner';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <Banner />
        {children}
      </body>
    </html>
  );
}
