import { withAuth } from "next-auth/middleware";
import { NextRequest } from "next/server";

export default withAuth(
  function middleware(req: NextRequest) {
    const token = req.nextauth.token;
    
    // Se acessa /dashboard
    if (req.nextUrl.pathname.startsWith("/dashboard")) {
      // Só médicos (role = "doctor" ou "staff")
      if (token?.role !== "doctor") {
        return Response.redirect(new URL("/paciente", req.url));
      }
    }
    
    // Se acessa /paciente (login obrigatório)
    if (req.nextUrl.pathname.startsWith("/paciente") && req.nextUrl.pathname !== "/paciente") {
      // Só pacientes
      if (token?.role !== "patient") {
        return Response.redirect(new URL("/dashboard", req.url));
      }
    }
  },
  {
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/paciente/:path*",
    "/api/patients/:path*",
    "/api/sessions/:path*",
    "/api/analytics/:path*",
    "/api/analyze/:path*",
    "/api/doctors/:path*",
  ],
};
