import { CssBaseline } from "@mui/material";
import ThemeRegistry from "@/components/ThemeRegistry";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Campus Notifications",
  description: "Campus notification platform - Placements, Events, Results",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <ThemeRegistry>
          <CssBaseline />
          <Navbar />
          {children}
        </ThemeRegistry>
      </body>
    </html>
  );
}
