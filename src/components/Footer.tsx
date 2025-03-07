import { COURSE_CREDITS } from "@/lib/config";
import { AuthAction } from "./AuthAction";

export default function Footer() {
  return (
    <footer>
      <p>
        <AuthAction /> © {new Date().getFullYear()} Kal-Cali. All rights
        reserved.{" "}
      </p>
    </footer>
  );
}
