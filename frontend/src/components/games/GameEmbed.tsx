interface GameEmbedProps {
  title: string;
  entryPath: string;
}

// ====================================================================================================== //
//        Giochi esterni (Phaser, Godot, Unity WebGL...) buildati dentro public/embedded-games/<nome>/.
//        Cartella separata da /games per non entrare in conflitto con le rotte SPA dei giochi.
//        L attributo sandbox isola il gioco dal resto del sito: niente accesso a cookie o storage
//        del dominio principale, niente navigazione forzata della pagina.
// ====================================================================================================== //
export default function GameEmbed({ title, entryPath }: GameEmbedProps) {
  const src = entryPath.startsWith("http")
    ? entryPath
    : `/embedded-games/${entryPath.replace(/^\/+/, "")}`;

  return (
    <div className="w-full overflow-hidden rounded-xl border border-slate-700 bg-slate-950">
      <iframe
        src={src}
        title={title}
        className="aspect-[4/3] w-full border-0"
        sandbox="allow-scripts allow-pointer-lock allow-same-origin"
        allow="autoplay; fullscreen; gamepad"
        loading="lazy"
      />
    </div>
  );
}
