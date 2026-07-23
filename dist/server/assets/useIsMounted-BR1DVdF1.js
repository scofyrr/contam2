import { U as reactExports } from "./server-C-mhO3-H.js";
function useIsMounted() {
  const [mounted, setMounted] = reactExports.useState(false);
  reactExports.useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}
export {
  useIsMounted as u
};
