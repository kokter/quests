import { useState, useEffect } from "react";

export function useIsMobile(breakpoint = 990) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    console.log(window.innerWidth);
    const checkScreen = () => {
      setIsMobile(window.innerWidth <= breakpoint);
    };

    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, [breakpoint]);

  return isMobile;
}
