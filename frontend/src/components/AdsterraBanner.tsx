// components/AdsterraBanner.jsx
import { useEffect, useRef } from "react";

const AdsterraBanner = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const scriptOptions = document.createElement("script");
    scriptOptions.innerHTML = `
    atOptions = {
      'key' : '9f3da66dbdc5ebcc0e0c54ca516a4b33',
      'format' : 'iframe',
      'height' : 250,
      'width' : 300,
      'params' : {}
    };
  `;

    const scriptInvoke = document.createElement("script");
    scriptInvoke.src =
      "https://www.highperformanceformat.com/9f3da66dbdc5ebcc0e0c54ca516a4b33/invoke.js";
    scriptInvoke.async = true;

    ref.current.appendChild(scriptOptions);
    ref.current.appendChild(scriptInvoke);
  }, []);

  return (
    <div
      ref={ref}
      style={{ width: "300px", height: "250px", margin: "20px auto" }}
    />
  );
};

export default AdsterraBanner;
