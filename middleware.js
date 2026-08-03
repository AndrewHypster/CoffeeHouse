import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token,
  },
});

// Next.js requires `matcher` to be a static literal for build-time analysis.
// Provide the same static routes here as an explicit literal.
export const config = {
  matcher: [
    "/",
    "/poems",
    "/write-poem",
    "/profile",
    "/dashboard",
    "/dashboard/:path*",
  ],
};
