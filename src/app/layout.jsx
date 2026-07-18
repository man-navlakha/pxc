import "../App.css";
import "../index.css";
import "../new.css";

export const metadata = {
  title: "Pixel Class",
  description: "Your ultimate study companion. Study smarter, not harder.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
