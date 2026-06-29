import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-warm-beige/10 glass py-6 md:py-8 px-4 mt-4 md:mt-10 w-full">
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex flex-row items-center justify-between w-full gap-2 sm:gap-6 md:gap-8 mb-4 md:mb-6 pb-2">
          
          {/* Logo/Brand */}
          <Link 
            href="/" 
            className="flex items-center justify-center gap-1.5 sm:gap-3 flex-shrink-0 bg-dark-bg-primary/80 border border-warm-beige/20 hover:border-[#ffb347] px-2 py-1.5 sm:px-4 sm:py-2.5 md:px-6 md:py-3.5 rounded-xl sm:rounded-2xl group transition-all duration-300 shadow-sm"
          >
            <div className="relative w-3.5 h-3.5 sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
              <Image
                src="/logo.png"
                alt="Okuma Köşesi Logo"
                width={24}
                height={24}
                className="w-full h-full object-contain brightness-0 invert"
                style={{
                  mixBlendMode: 'screen',
                  filter: 'brightness(0) invert(1)',
                }}
              />
            </div>
            <span className="text-[9px] sm:text-sm md:text-base font-serif font-medium text-white/90 group-hover:text-white whitespace-nowrap tracking-wide">
              Okuma Köşesi
            </span>
          </Link>

          {/* Links and Copyright */}
          <div className="flex flex-row flex-wrap items-center justify-center sm:justify-end gap-x-4 sm:gap-x-8 gap-y-2 text-[10px] sm:text-[13px] md:text-[15px] font-sans text-text-medium ml-auto">
            <Link href="/about" className="hover:text-white transition-colors duration-200 whitespace-nowrap">
              Hakkında
            </Link>
            <Link href="/contact" className="hover:text-white transition-colors duration-200">
              İletişim
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors duration-200">
              Gizlilik
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors duration-200">
              Kullanım Şartları
            </Link>
          </div>
        </div>

        <div className="border-t border-warm-beige/10 pt-4 md:pt-6 text-center text-[11px] sm:text-xs md:text-[13px] text-text-medium/50 font-sans leading-relaxed w-full">
          <p className="max-w-3xl mx-auto">
            Odaklanarak okumak, derinleşmek ve keşfetmek için tasarlanmış dijital çalışma alanınız. Bu platformda yer alan okuma süreleri ve analizler kullanıcının kişisel verilerinden derlenmektedir.
          </p>
        </div>
      </div>
    </footer>
  );
};
