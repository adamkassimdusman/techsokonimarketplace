export const isAdmin = (role: string | undefined) =>
  role === "admin" || role === "super_admin";
