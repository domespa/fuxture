import { useEffect } from "react";

const AdsterraPopunder = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://pl28791758.effectivegatecpm.com/e5/94/ad/e594ad1efb9cbd58cb7f3eb62ace24d1.js";
    script.async = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return null;
};

export default AdsterraPopunder;
