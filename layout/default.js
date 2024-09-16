import "../app/globals.css";

import Footer from "../components/footer";

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="bg-background min-h-screen">
      <body>
        {children}
        <Footer />
      </body>
    </html>
  );
}
