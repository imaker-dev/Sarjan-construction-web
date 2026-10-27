import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import LoadingBar from "react-top-loading-bar";

const RouteLoader = () => {
  const location = useLocation();
  const ref = useRef(null);

  useEffect(() => {
    ref.current?.continuousStart();

    const timer = setTimeout(() => {
      ref.current?.complete();
    }, 300);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <LoadingBar
      ref={ref}
      color="var(--color-brand-primary)"
      height={3}
      shadow="0 0 10px var(--color-brand-primary)"
    />
  );
};

export default RouteLoader;
