import Navbar from "./Navbar";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 py-4 px-8 bg-slate-100 shadow-md border-b border-slate-100">
      <div className="max-w-[1400px] mx-auto flex justify-center items-center">
        <Navbar />
      </div>
    </header>
  );
}
