'use client';

interface NavbarProps {
  userName: string;
  onLogout: () => void;
  onMenuToggle?: () => void;
}

export default function Navbar({ userName, onLogout, onMenuToggle }: NavbarProps) {
  return (
    <header className="bg-white shadow-sm h-16 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-3">
        {/* Hamburger Menu Button for Mobile */}
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="lg:hidden w-10 h-10 flex items-center justify-center text-zinc-600 hover:text-zinc-800 hover:bg-zinc-100 rounded-md"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        {/* Bos birakildi - Panel yazisi kaldirildi */}
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-zinc-600 hidden sm:inline">Hosgeldin, {userName}</span>
        <span className="text-sm text-zinc-600 sm:hidden">{userName}</span>
        <button
          onClick={onLogout}
          className="px-3 sm:px-4 py-2 text-sm bg-zinc-800 text-white rounded-md hover:bg-zinc-700 transition-colors"
        >
          <span className="hidden sm:inline">Cikis Yap</span>
          <span className="sm:hidden">Cikis</span>
        </button>
      </div>
    </header>
  );
}
