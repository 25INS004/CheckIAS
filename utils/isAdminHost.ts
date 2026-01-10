export const isAdminHost = () => {
  if (typeof window === 'undefined') return false
  return window.location.hostname.startsWith('admin.')
}

export const normalizeAdminPath = () => {
  const { pathname, search } = window.location;

  if (pathname.startsWith("/admin")) {
    const newPath = pathname.replace(/^\/admin/, "") || "/";
    window.history.replaceState(null, "", newPath + search);
  }

  return null;
};
