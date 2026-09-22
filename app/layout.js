import "./globals.css";

export const metadata = {
  title: "A beautiful beginning · JSW One Homes",
  description:
    "See your family in front of the home you've always dreamed of. Add your elevation and a family photo for your first glimpse, ready to frame and cherish.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
