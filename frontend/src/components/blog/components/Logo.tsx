export default function Logo() {
  return (
    <div className="w-14 h-14 md:w-20 md:h-20 flex-shrink-0">
      <img
        className="rounded-full w-full h-full object-cover hover:opacity-90 transition-opacity"
        src="/logo.png"
        alt="logo"
        loading="lazy"
      />
    </div>
  );
}
