import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
});

export const metadata = {
  title: "InterviewFlow — Technical Interview Platform",
  description: "The smarter way to conduct technical interviews",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${jakarta.variable} font-sans h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
