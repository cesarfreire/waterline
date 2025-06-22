import { auth } from "@/auth";

export default auth((req) => {
  if (!req.auth && req.nextUrl.pathname === "/api/action") {
    // If the user is not authenticated and trying to access the action API, return an error
    return new Response(JSON.stringify({ error: "Unauthorized access" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
});
