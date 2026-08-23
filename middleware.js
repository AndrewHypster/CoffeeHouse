import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      if (!token) return false;

      if (req.nextUrl.pathname.startsWith("/dashboard")) {
        return token.role === "admin";
      }

      return true;
    },
  },
});

// Next.js requires `matcher` to be a static literal for build-time analysis.
// Use explicit routes here for middleware.
export const config = {
  matcher: [
  "/write-poem",
  "/write-box",
  "/profile",
  "/leaders",
  "/dashboard",
  "/dashboard/:path*",
]
};
