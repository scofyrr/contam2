import { U as reactExports } from "./server-Bo29azLP.js";
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
