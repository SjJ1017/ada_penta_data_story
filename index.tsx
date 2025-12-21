import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  TrendingUp, 
  Activity, 
  BookOpen, 
  Target, 
  Zap, 
  BarChart2, 
  Info,
  ArrowDown,
  Quote,
  Underline
} from 'lucide-react';

// --- Components ---

const ScrollProgress = () => {
  const [scroll, setScroll] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scroll = `${totalScroll / windowHeight}`;
      setScroll(Number(scroll));
    }
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-1 z-[60] bg-transparent">
      <div 
        className="h-full bg-gradient-to-r from-blue-600 to-red-500 transition-all duration-150 ease-out"
        style={{ width: `${scroll * 100}%` }}
      />
    </div>
  );
};

const ScrollChart = ({ scrollPath }: { scrollPath: number[] }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Handle dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'BUTTON' || (e.target as HTMLElement).tagName === 'svg' || (e.target as HTMLElement).tagName === 'path') {
      return; // Don't drag when clicking buttons or SVG
    }
    
    e.preventDefault();
    setIsDragging(true);
    
    // Get current position of the element
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const currentX = position?.x ?? rect.left;
      const currentY = position?.y ?? rect.top;
      
      setDragStart({
        x: e.clientX - currentX,
        y: e.clientY - currentY
      });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  // Generate SVG path
  const generatePath = () => {
    if (scrollPath.length < 2) return '';
    
    const width = 200;
    const height = 100;
    const totalPoints = scrollPath.length;
    const points = scrollPath.map((value, index) => {
      const x = (index / Math.max(totalPoints - 1, 1)) * width;
      const y = height - (value / 100) * height;
      return { x, y };
    });

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }
    return path;
  };

  const currentValue = scrollPath[scrollPath.length - 1] || 0;
  const previousValue = scrollPath[scrollPath.length - 2] || 0;
  const isGoingUp = currentValue > previousValue;

  return (
    <>
      {/* Main Chart Container */}
      {isVisible && (
        <div 
          ref={containerRef}
          className="fixed z-50 group"
          style={{
            bottom: position === null ? '2rem' : 'auto',
            right: position === null ? '2rem' : 'auto',
            left: position !== null ? `${position.x}px` : 'auto',
            top: position !== null ? `${position.y}px` : 'auto',
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
          onMouseDown={handleMouseDown}
        >
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/50 overflow-hidden transition-all duration-300 hover:shadow-xl">
            {/* Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-slate-600" />
                  <span className="text-xs font-bold tracking-wider text-slate-600 uppercase">Reading Flow</span>
                  <span className="text-[10px] text-slate-400 italic">(drag to move)</span>
                </div>
                <button 
                  onClick={() => setIsVisible(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
          
          {/* Current Value Display */}
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {currentValue.toFixed(1)}%
            </span>
            <span className={`text-sm font-medium flex items-center gap-1 ${isGoingUp ? 'text-green-600' : 'text-red-600'}`}>
              {isGoingUp ? '↑' : '↓'}
              {Math.abs(currentValue - previousValue).toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Chart Area */}
        <div className="p-4 bg-white">
          <svg 
            width="200" 
            height="100" 
            className="w-full"
            style={{ display: 'block' }}
          >
            {/* Grid Lines */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="200" height="100" fill="url(#grid)" />
            
            {/* Area under the curve */}
            {scrollPath.length > 1 && (
              <path
                d={`${generatePath()} L 200 100 L 0 100 Z`}
                fill="url(#gradient)"
                opacity="0.2"
              />
            )}
            
            {/* Gradient definition */}
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={isGoingUp ? '#10b981' : '#ef4444'} />
                <stop offset="100%" stopColor={isGoingUp ? '#10b981' : '#ef4444'} stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Line */}
            {scrollPath.length > 1 && (
              <path
                d={generatePath()}
                fill="none"
                stroke={isGoingUp ? '#10b981' : '#ef4444'}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Current point indicator */}
            {scrollPath.length > 0 && (
              <circle
                cx={200}
                cy={100 - (currentValue / 100) * 100}
                r="3"
                fill={isGoingUp ? '#10b981' : '#ef4444'}
                className="animate-pulse"
              />
            )}
          </svg>
        </div>

        {/* Footer Stats */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex justify-between text-xs text-slate-500">
          <span>Start: 0%</span>
          <span>End: 100%</span>
        </div>
      </div>
    </div>
      )}

      {/* Reopen button when closed */}
      {!isVisible && (
        <button
          onClick={() => setIsVisible(true)}
          className="fixed bottom-8 right-8 p-3 bg-white rounded-full shadow-lg border border-slate-200 hover:shadow-xl transition-all hover:scale-110"
          title="Show Reading Flow"
        >
          <Activity className="w-5 h-5 text-slate-600" />
        </button>
      )}
    </>
  );
};

const Section = ({ 
  id, 
  title, 
  subtitle, 
  children, 
  dark = false,
  icon: Icon,
  chapterNumber,
  compact = false
}: { 
  id: string, 
  title: string, 
  subtitle?: string, 
  children?: React.ReactNode, 
  dark?: boolean,
  icon?: React.ElementType,
  chapterNumber?: string,
  compact?: boolean
}) => (
  <section 
    id={id} 
    className={`relative ${compact ? 'min-h-[60vh] py-20' : 'min-h-screen py-32'} px-6 md:px-12 flex flex-col items-center overflow-hidden ${
      dark ? 'bg-slate-900 text-slate-200' : 'bg-white text-slate-800'
    }`}
  >
    {/* Background Decoration */}
    <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
      <div className={`absolute -top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full blur-[100px] opacity-30 ${dark ? 'bg-blue-900' : 'bg-blue-50'}`}></div>
      <div className={`absolute top-[40%] -left-[10%] w-[400px] h-[400px] rounded-full blur-[80px] opacity-30 ${dark ? 'bg-red-900' : 'bg-red-50'}`}></div>
    </div>

    <div className="relative z-10 w-full max-w-7xl">
      <div className="mb-16">
        <div className="flex items-center gap-4 mb-4">
          <span className={`text-xs font-bold tracking-[0.2em] uppercase px-3 py-1 rounded-full border ${
            dark ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-500'
          }`}>
            {chapterNumber || "Part"}
          </span>
          <div className={`h-px flex-grow ${dark ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
        </div>
        
        <h2 className={`text-5xl md:text-7xl font-black font-serif leading-tight mb-4 ${
            dark ? 'text-white' : 'text-slate-900'
        }`}>
          {title}
        </h2>
        
        {subtitle && (
          <p className={`text-xl md:text-2xl font-light italic ${dark ? 'text-blue-300' : 'text-blue-700'}`}>
            {subtitle}
          </p>
        )}
      </div>

      <div className={`prose prose-lg md:prose-xl lg:prose-2xl max-w-none ${dark ? 'prose-invert' : ''} leading-loose font-sans font-light`}>
        {children}
      </div>
    </div>
  </section>
);

const ChartPlaceholder = ({ title, type, caption, dark }: { title: string, type: string, caption?: string, dark?: boolean }) => (
  <div className={`my-20 not-prose`}>
    <div className={`relative overflow-hidden rounded-2xl border transition-all duration-500 group shadow-lg ${
      dark 
        ? 'border-slate-700 bg-slate-800/50 hover:border-slate-600' 
        : 'border-slate-200 bg-white hover:border-slate-300'
    }`}>
      {/* Fake UI Bar */}
      <div className={`flex items-center px-4 py-3 border-b ${dark ? 'border-slate-700 bg-slate-800' : 'border-slate-100 bg-slate-50'}`}>
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
          <div className="w-3 h-3 rounded-full bg-amber-400/80"></div>
          <div className="w-3 h-3 rounded-full bg-green-400/80"></div>
        </div>
        <div className={`mx-auto text-xs font-mono opacity-60 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
          figure_output.png
        </div>
      </div>

      <div className="relative p-16 flex flex-col items-center justify-center text-center min-h-[400px]">
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-[0.05]" 
             style={{ 
               backgroundImage: `linear-gradient(${dark ? '#fff' : '#000'} 1px, transparent 1px), linear-gradient(90deg, ${dark ? '#fff' : '#000'} 1px, transparent 1px)`, 
               backgroundSize: '20px 20px' 
             }}>
        </div>

        <BarChart2 className={`w-12 h-12 mb-6 opacity-80 ${dark ? 'text-blue-400' : 'text-blue-600'}`} />
        <h3 className={`text-2xl font-bold font-serif mb-4 ${dark ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
        <span className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider mb-8 ${
          dark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
        }`}>
          {type}
        </span>
        {caption && (
          <p className={`max-w-lg text-sm leading-relaxed opacity-70 ${dark ? 'text-slate-300' : 'text-slate-600'}`}>
            {caption}
          </p>
        )}
      </div>
    </div>
  </div>
);

const AnalogyBox = ({ title, children }: { title: string, children?: React.ReactNode }) => (
  <div className="my-8 not-prose relative">
    <div className="absolute -left-4 -top-4 text-amber-300 opacity-50 z-10">
      <Quote size={64} fill="currentColor" stroke="none" />
    </div>
    <div className="relative bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 p-6 md:p-8 rounded-2xl shadow-sm z-0">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-amber-100 rounded-lg text-amber-700">
          <BookOpen className="w-5 h-5" />
        </div>
        <span className="text-amber-800 font-bold uppercase tracking-wider text-lg">{title}</span>
      </div>
      <div className="text-slate-700 text-lg leading-relaxed space-y-3">
        {children}
      </div>
    </div>
  </div>
);

const MethodologyNote = ({ title, children }: { title: string, children?: React.ReactNode }) => (
  <div className="my-12 p-6 rounded-lg bg-slate-50 border border-slate-200 text-sm">
     <div className="font-bold text-slate-700 mb-2 flex items-center gap-2">
        <Target className="w-4 h-4 text-blue-500" />
        Methodology Note
     </div>
     <div className="text-slate-600 leading-relaxed">
       <strong>{title}:</strong> {children}
     </div>
  </div>
);

const TabIframe = ({ tabs }: { tabs: Array<{ label: string, src: string }> }) => {
  const [activeTab, setActiveTab] = useState(0);

  const getButtonStyle = (index: number) => {
    const isActive = activeTab === index;
    if (index === 0) {
      // Democratic - Blue
      return isActive
        ? 'bg-slate-800 border-blue-900/30 text-blue-400'
        : 'bg-slate-800/50 border-blue-900/20 text-blue-400/60 hover:bg-slate-800 hover:border-blue-900/30';
    } else if (index === 1) {
      // Republican - Red
      return isActive
        ? 'bg-slate-800 border-red-900/30 text-red-400'
        : 'bg-slate-800/50 border-red-900/20 text-red-400/60 hover:bg-slate-800 hover:border-red-900/30';
    } else {
      // Other - Purple
      return isActive
        ? 'bg-slate-800 border-purple-900/30 text-purple-400'
        : 'bg-slate-800/50 border-purple-900/20 text-purple-400/60 hover:bg-slate-800 hover:border-purple-900/30';
    }
  };

  return (
    <div className="my-8 not-prose flex justify-center">
      <div className="w-full max-w-7xl">
        {/* Tab Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`p-6 rounded-xl border font-bold text-lg font-serif transition-all ${getButtonStyle(index)}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      
        {/* Iframe Display */}
        <div className="iframe-wrapper">
          <iframe
            src={tabs[activeTab].src}
            className="plotly-iframe"
            frameBorder="0"
          />
        </div>
      </div>
    </div>
  );
};

const StockCarousel = () => {
  const stocks = [
    { ticker: 'ABM', src: './p4/ABM_arima.png', alt: 'ARIMA counterfactual vs. actual log(close) for ABM' },
    { ticker: 'BHP', src: './p4/BHP_arima.png', alt: 'ARIMA counterfactual vs. actual log(close) for BHP' },
    { ticker: 'CCAP', src: './p4/CCAP_arima.png', alt: 'ARIMA counterfactual vs. actual log(close) for CCAP' },
    { ticker: 'GUG', src: './p4/GUG_arima.png', alt: 'ARIMA counterfactual vs. actual log(close) for GUG' },
    { ticker: 'AEYE', src: './p4/AEYE_arima.png', alt: 'ARIMA counterfactual vs. actual log(close) for AEYE' },
  ];
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % stocks.length);
    }, 3000); 
    return () => clearInterval(timer);
  }, [isPaused, stocks.length]);

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* 图片轮播区域 */}
      <div className="my-6 flex justify-center relative overflow-hidden">
        <div className="relative w-full max-w-2xl overflow-hidden">
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{
              transform: `translateX(-${currentIndex * 100}%)`,
            }}
          >
            {stocks.map((stock, index) => (
              <div
                key={stock.ticker}
                className="w-full flex-shrink-0 px-2"
              >
                <img
                  src={stock.src}
                  alt={stock.alt}
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 圆点指示器 */}
      <div className="flex justify-center gap-2 mt-4">
        {stocks.map((stock, index) => (
          <button
            key={stock.ticker}
            onClick={() => setCurrentIndex(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentIndex
                ? 'w-3 h-3 bg-blue-600'
                : 'w-2 h-2 bg-slate-300 hover:bg-slate-400'
            }`}
            aria-label={`Go to ${stock.ticker}`}
          />
        ))}
      </div>

      {/* 当前股票标签 */}
      <div className="mt-4 text-center">
        <p className="text-sm text-slate-500 mb-2">
          Showing: <span className="font-semibold text-slate-900">{stocks[currentIndex].ticker}</span> ({currentIndex + 1} / {stocks.length})
        </p>
      </div>
    </div>
  );
};

const StockExplorer = () => {
  const [inputValue, setInputValue] = useState("AAPL");
  const [displayTicker, setDisplayTicker] = useState("AAPL");
  const [imgError, setImgError] = useState(false);
  const [imgLoading, setImgLoading] = useState(true);

  const normalized = useMemo(
    () => (displayTicker || "").trim().toUpperCase(),
    [displayTicker]
  );

  const imgSrc = normalized ? `./p4/plots/${normalized}.png` : '';

  // 当 displayTicker 改变时重置状态
  useEffect(() => {
    if (normalized) {
      setImgError(false);
      setImgLoading(true);
    }
  }, [normalized]);

  const handleSearch = () => {
    const trimmed = (inputValue || "").trim().toUpperCase();
    if (trimmed) {
      setDisplayTicker(trimmed);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="my-8 flex justify-center">
      <div className="w-full max-w-7xl">
        <div className="flex flex-col gap-6">
          {/* Top: PCA 3D */}
          <div className="flex items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <iframe
              src="./p4/pca_3d.html"
              title="PCA 3D clustering visualization"
              className="block"
              style={{ height: "780px", width: "100%", maxWidth: "1000px" }}
            />
          </div>

          {/* Bottom: Search + Plot */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center justify-center gap-3 w-full">
                <h4 className="text-slate-900 text-base font-semibold">
                  Stock plot lookup
                </h4>

                <input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="e.g., AAPL"
                  className="w-40 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
                <button
                  onClick={handleSearch}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Search
                </button>
              </div>

              <p className="text-sm text-slate-600 text-center">
                Type a ticker (e.g., AAPL, TSLA) and click Search. We will load <span className="font-mono">{normalized || '...'}.png</span>.
              </p>

              {normalized && (
                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 max-w-2xl w-full min-h-[200px] relative">
                  {imgLoading && !imgError && (
                    <div className="absolute inset-0 flex items-center justify-center p-8">
                      <p className="text-sm text-slate-500">Loading image...</p>
                    </div>
                  )}
                  {imgError && (
                    <div className="absolute inset-0 flex items-center justify-center p-8">
                      <div className="text-center">
                        <p className="text-sm text-red-600 font-semibold mb-2">
                          Image not found
                        </p>
                        <p className="text-xs text-slate-500">
                          The file <span className="font-mono">{normalized}.png</span> does not exist in <span className="font-mono">p4/plots/</span>
                        </p>
                        <p className="text-xs text-slate-400 mt-2">
                          Please check the ticker symbol and try again.
                        </p>
                      </div>
                    </div>
                  )}
                  {!imgError && (
                    <>
                      <img
                        src={imgSrc}
                        alt={`Residual plot for ${normalized}`}
                        className="w-full h-auto"
                        onLoad={() => {
                          setImgLoading(false);
                          setImgError(false);
                        }}
                        onError={() => {
                          setImgLoading(false);
                          setImgError(true);
                        }}
                      />
                      {!imgLoading && (
                        <div className="p-3 text-center bg-slate-50 border-t border-slate-200">
                          <p className="text-sm text-slate-600">
                            Showing: <span className="font-semibold text-slate-900">{normalized}</span>
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

const App = () => {
  const [open, setOpen] = useState(false);
  const [openABM, setOpenABM] = useState(false);
  const [scrollPath, setScrollPath] = useState<number[]>([0]);
  
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Always track scroll progress, even when chart is hidden
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let animationFrameId: number;

    const handleScroll = () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }

      animationFrameId = requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (currentScrollY / maxScroll) * 100;

        setScrollPath(prev => [...prev, scrollPercent]);

        lastScrollY = currentScrollY;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  useEffect(() => {
    // Render math formulas after component mounts
    if (typeof window !== 'undefined' && (window as any).renderMathInElement) {
      (window as any).renderMathInElement(document.body, {
        delimiters: [
          {left: '$$', right: '$$', display: true},
          {left: '$', right: '$', display: false}
        ]
      });
    }
  }, []);

  return (
    <div className="font-sans antialiased text-slate-900 bg-white selection:bg-blue-100 selection:text-blue-900">
      <ScrollProgress />
      <ScrollChart scrollPath={scrollPath} />
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 px-6 py-4 transition-all">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="font-serif font-bold text-xl tracking-tight flex items-center gap-2 text-slate-900">
            <span className="w-3 h-3 rounded-full bg-gradient-to-tr from-blue-600 to-red-500"></span>
            The Market's Vote
          </div>
          <div className="hidden md:flex gap-8 items-center text-sm font-medium text-slate-500">
            {['Intro', 'Macro', 'Sensitivity', 'Leaning', 'Events', 'Conclusion'].map((item) => (
              <button 
                key={item}
                onClick={() => scrollTo(item.toLowerCase() === 'intro' ? 'hero' : item.toLowerCase())}
                className="hover:text-slate-900 transition-colors uppercase tracking-widest text-xs"
              >
                {item}
              </button>
            ))}
            <div className="relative group">
              <button className="hover:text-slate-900 transition-colors uppercase tracking-widest text-xs">
                Resources
              </button>
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2">
                <a 
                  href="https://github.com/SjJ1017/ada_penta_data_story" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                >
                  <div className="font-semibold">Website Repo</div>
                  <div className="text-xs text-slate-500 mt-0.5">Data Story Source</div>
                </a>
                <a 
                  href="https://github.com/epfl-ada/ada-2025-project-penta_data" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                >
                  <div className="font-semibold">Project Repo</div>
                  <div className="text-xs text-slate-500 mt-0.5">Analysis & Code</div>
                </a>
                <a 
                  href="https://www.kaggle.com/datasets/jacksoncrow/stock-market-dataset" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                >
                  <div className="font-semibold">Dataset</div>
                  <div className="text-xs text-slate-500 mt-0.5">Stock Market Data</div>
                </a>
                <a 
                  href="https://github.com/fivethirtyeight/data/tree/master/polls" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                >
                  <div className="font-semibold">Polling Data</div>
                  <div className="text-xs text-slate-500 mt-0.5">FiveThirtyEight Polls</div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="min-h-screen flex flex-col justify-center bg-white relative overflow-hidden px-6 pt-20">
        <div className="absolute top-0 right-0 w-[50vw] h-[50vh] bg-gradient-to-b from-blue-50 to-transparent opacity-60 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[50vw] h-[50vh] bg-gradient-to-t from-red-50 to-transparent opacity-60 blur-3xl rounded-full -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="max-w-5xl mx-auto z-10 w-full">
          <div className="inline-flex items-center gap-3 mb-8 opacity-0 animate-[fadeIn_0.8s_ease-out_forwards]">
            <span className="h-px w-8 bg-slate-300"></span>
            <span className="text-xs font-bold tracking-[0.3em] uppercase text-slate-400">EPFL ADA Project</span>
          </div>
          
          <h1 className="text-7xl md:text-9xl font-black text-slate-900 mb-10 font-serif tracking-tighter leading-[0.85] opacity-0 animate-[slideUp_0.8s_ease-out_0.2s_forwards]">
            The <br/>
            Market's <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-slate-800 to-red-600">
              Vote.
            </span>
          </h1>
          
          <div className="max-w-2xl ml-auto opacity-0 animate-[slideUp_0.8s_ease-out_0.4s_forwards]">
            <p className="text-xl md:text-2xl text-slate-600 mb-12 leading-relaxed font-light border-l-2 border-slate-200 pl-6">
              Every four years, America decides. But while voters shout, the stock market whispers. 
              <span className="block mt-4 text-slate-900 font-medium">We analyzed 34 years of NASDAQ data to decode that whisper.</span>
            </p>
            
            <button 
              onClick={() => scrollTo('prologue')}
              className="group flex items-center gap-4 text-slate-900 hover:text-blue-700 transition-colors"
            >
              <div className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center group-hover:border-blue-600 transition-colors">
                 <ArrowDown className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest">Start Reading</span>
            </button>
          </div>
        </div>
      </section>

      {/* Intro */}
      {/* <Section id="intro" title="Setting the Stage" subtitle="Introduction" chapterNumber="Intro" compact>
        <p>
          <span className="float-left text-7xl font-serif font-bold text-slate-200 leading-[0.8] mr-4 -ml-2 mb-2">T</span>his project looks at 34 years of NASDAQ data alongside election-season signals to understand how markets react when politics gets loud. We start with the big picture, examine which industries are most sensitive, explore how stocks quietly lean across the aisle, and then zoom into specific shocks where the story bends fast. Methods include event-window comparisons, ARIMA-based counterfactuals to estimate “what might have happened,” and clustering of stock-level responses to find common patterns.
        </p>
        <p>
          Think of it as reading the market’s diary through election time: steady pages, anxious lines, and a few chapters written overnight. We won’t promise winners. We’ll show how investors listen—how they price expectations, adjust to surprises, and keep moving as the narrative unfolds.
        </p>
      </Section> */}

      {/* Prologue */}
      <Section id="prologue" title="The Invisible Dialogue" subtitle="Prologue" chapterNumber="00">
        <p>
          <span className="float-left text-7xl font-serif font-bold text-slate-200 leading-[0.8] mr-4 -ml-2 mb-2">I</span>
          <strong>magine the stock market as a seismograph for the national mood.</strong> While political polls capture what people <em>say</em>, stock prices capture what people <em>do</em> with their money. It is the ultimate "skin in the game."
        </p>
        <p style={{ marginBottom: '1rem' }}>
          Our project began with a simple question: <em>Does the drama of the US Presidential Election actually matter to the cold, calculating logic of Wall Street?</em>
        </p>

        <p className="mb-8">
          The answer <em>might</em> lie buried in decades of trading data—if the market truly pays attention. Every election cycle brings its own theater: soaring campaign promises, 
          heated debates, polling swings, and surprise October revelations. But does any of this political noise actually matter to investors? 
          Beneath the headlines, millions are quietly placing their bets—not with votes, but with dollars. If their collective judgment means anything, 
          it should create some kind of measurable signal across thousands of stocks. Perhaps a pattern emerges. Or perhaps the market simply 
          shrugs and moves on, indifferent to the political drama. The question is: <em>which is it?</em>
        </p>


          <p>Among thousands of symbols on exchanges like the NASDAQ, it's crucial to distinguish between <strong>individual stocks</strong> and <strong>Exchange-Traded Funds (ETFs)</strong>. <strong>ETFs</strong> are investment funds—baskets of assets traded like a single stock—that primarily offer instant portfolio diversification. While for research focused on a specific event, such as the US election's impact, <strong>individual stocks are superior</strong>. This is because they offer <strong>direct exposure to specific policy outcomes</strong>, whereas the built-in diversification of ETFs dilutes the direct relationship, making precise analysis much harder. Fortunately, over 70% of the symbols in the dataset are individual stocks, providing a rich foundation for our analysis.
          </p>
          <div className="flex justify-center my-8">
            <iframe src="./p0/etf.html" className="w-full max-w-[70%]" height="500px" scrolling="no"></iframe>
          </div>

          <p>
            The individual stocks belongs to various sectors. This diversity allows us to trace how different industries react to the evolving electoral landscape. Among them, apart from those from <strong style={{ color: '#636efa' }}>Unknown</strong> sector, the top three sectors by number of stocks are <strong style={{ color: '#EF553B' }}>Financial Services</strong>, <strong style={{ color: '#00cc96' }}>Healthcare</strong> and <strong style={{ color: '#ab63fa' }}>Technology</strong>.
          </p>
          <iframe src="./p0/sector.html" width="100%" height="700px" scrolling="no"></iframe>

            <p>However, NASDAQ records different stock from a wide range of time, some stocks are new, while others date back decades. The oldest stock recorded dates back to the 1970's when the world is still in the grip of the <strong>Cold War (1991)</strong>. The stocks at that period may have totally different behaviors compared to those in the <strong>Contemporary Era</strong>. Also the stocks that date back to early ages are much rarer, only less than 20% stocks before peace finally arrived at the end of 1991.</p>
          <div className="my-8 flex justify-center">
            <img src="./p0/cdf.png" alt="CDF Analysis" className="max-w-full h-auto rounded-lg shadow-lg" />
          </div>

      </Section>




 
      {/* Chapter 1: Macro */}
      <Section
        id="macro"
        title="The Bumpy Road"
        subtitle="Macro Analysis"
        dark
        chapterNumber="01"
      >
        <p>
          Elections are often described as moments of uncertainty. New leaders, new
          policies, and shifting expectations all arrive at once. But how does this
          uncertainty actually show up in financial markets?
        </p>

        <p>
          To explore this question, we start from a simple but important distinction:
          <strong> returns </strong> versus <strong> volatility </strong>. These two
          concepts sound technical, but the intuition behind them is surprisingly
          straightforward.
        </p>

        <AnalogyBox title="The Road Trip Analogy">
          <p>
            Think of investing in the stock market as taking a long road trip.
          </p>
          <ul className="list-disc pl-5 space-y-4 marker:text-amber-500">
            <li>
              <strong>Returns are the distance traveled.</strong> Did you move closer
              to your destination, or did you end up going backward?
            </li>
            <li>
              <strong>Volatility is the condition of the road.</strong> Was the ride
              smooth and predictable, or full of bumps, detours, and sudden turns?
            </li>
          </ul>
          <p className="mt-4 font-semibold border-t border-amber-200/50 pt-4">
            The key question of this chapter is not whether the market keeps moving
            forward during elections, but whether the ride becomes more uncomfortable.
          </p>
        </AnalogyBox>

        <p>
          Looking at decades of NASDAQ data, the answer turns out to be surprisingly
          nuanced. On average, election years do not dramatically change how far the
          market travels. Returns remain broadly similar to non-election years.
        </p>

        <p>
          What does change, however, is how the journey feels. As elections approach,
          the market becomes noticeably more volatile. Price movements grow larger,
          reactions become sharper, and investors appear more sensitive to incoming
          news.
        </p>

        {/* ===== Election vs Non-Election (narrow & centered) ===== */}
        <div className="flex justify-center my-10">
          <div className="w-full max-w-3xl aspect-[16/10] rounded-xl overflow-hidden bg-slate-50">
            <iframe
              src="./p1/nasdaq_election_vs_nonelection.html"
              className="w-full h-full border-none"
              title="Election vs Non-Election NASDAQ"
            />
          </div>
        </div>

        {/* ===== Annual Volatility & Returns (paired) ===== */}
        <p>
          Returns tell a more subtle story. Across most cycles, election years are not
          associated with dramatically higher gains. In fact, returns during election
          years often appear slightly lower, though this pattern is far from uniform.
        </p>

        <p>
          Volatility, however, behaves differently. Election years tend to coincide with
          sharper price movements and larger fluctuations, suggesting heightened market
          sensitivity as political uncertainty intensifies.
        </p>

        <div className="my-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="aspect-[16/10] rounded-xl overflow-hidden bg-white shadow-md">
              <iframe
                src="./p1/annual_nasdaq_AnnualVol.html"
                className="w-full h-full border-none"
                title="Annual NASDAQ Volatility"
              />
            </div>

            <div className="aspect-[16/10] rounded-xl overflow-hidden bg-white shadow-md">
              <iframe
                src="./p1/annual_nasdaq_AnnualReturn.html"
                className="w-full h-full border-none"
                title="Annual NASDAQ Return"
              />
            </div>
          </div>

          {/* Caption */}
          <p className="mt-4 text-center text-sm text-slate-500">
            Annual NASDAQ volatility and returns, with election years highlighted.
          </p>
        </div>


        {/* ===== Monthly Patterns ===== */}
        <p>
            Zooming in further, monthly patterns reveal how emotions fluctuate within
            election years. January often stands out with relatively strong performance,
            possibly reflecting early optimism around new leadership and policy
            expectations. In contrast, February frequently shows pullbacks, as initial
            enthusiasm gives way to reassessment and caution.
          </p>

        <div className="my-12 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="aspect-[16/10] rounded-xl overflow-hidden bg-slate-50">
              <iframe
                src="./p1/monthly_return.html"
                className="w-full h-full border-none"
                title="Monthly Returns"
              />
            </div>

            <div className="aspect-[16/10] rounded-xl overflow-hidden bg-slate-50">
              <iframe
                src="./p1/monthly_volatility.html"
                className="w-full h-full border-none"
                title="Monthly Volatility"
              />
            </div>
          </div>
        </div>

{/* 
        <MethodologyNote title="Statistical Validation">
          To ensure that these differences are not driven by random fluctuations, we
          apply statistical tests comparing election and non-election periods. The
          results confirm that the increase in volatility during election windows is
          statistically significant, supporting the interpretation that elections
          meaningfully affect market stability rather than just returns.
        </MethodologyNote> */}

        <p>
          After examining the stock market at an aggregate level, attention shifts to the political
          dimension of the story. Rather than treating an election as a single event, <strong>polling data</strong>
          are used to track how electoral uncertainty evolves over time — week by week and state by state.
        </p>

        <p>
          The intuition is straightforward: larger fluctuations in polls reflect higher levels of electoral
          uncertainty faced by voters — and potentially by investors as well. The focus here is not on
          whether elections matter, but on whether <em>where</em> that uncertainty arises plays a meaningful role.
        </p>


        <div className="bg-white rounded-3xl p-4 md:p-8 shadow-2xl shadow-slate-200/50 border border-slate-100 space-y-6 my-16">
          {(() => {
            const [tab, setTab] = React.useState<'ts' | 'corr'>('ts');

            const charts = {
              ts: {
                src: './p1/swing_state_polling_vs_nasdaq_time_series.html',
                title: 'Swing States: Time Series',
              },
              corr: {
                src: './p1/swing_state_polling_vs_nasdaq_correlation_bars.html',
                title: 'Swing States: Correlation',
              },
            };

            return (
              <>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-serif text-slate-900">
                      Swing States: Politically Crucial, Market-Neutral?
                    </h3>
                    <p className="text-slate-600 text-sm mt-1">
                      Swing states are defined by close elections and high political uncertainty.
                      Intuitively, one might expect these states to exert the strongest influence on
                      financial markets.
                    </p>
                  </div>

                  <div className="flex bg-slate-100 p-1 rounded-xl">
                    {(['ts', 'corr'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                          tab === t
                            ? 'bg-white shadow-sm text-blue-600'
                            : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        {t === 'ts' ? 'TIME SERIES' : 'CORRELATION'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="aspect-[16/9] min-h-[420px] w-full overflow-hidden rounded-xl bg-slate-50">
                  <iframe
                    key={tab}
                    src={charts[tab].src}
                    title={charts[tab].title}
                    className="w-full h-full border-none rounded-xl"
                  />
                </div>

                
              </>
            );
          })()}
        </div>

        <p>
          Although swing states are electorally pivotal, their relationship with stock market
          volatility appears weak and highly unstable. The correlation estimates fluctuate around
          zero and vary substantially across states, offering little evidence of a systematic link
          between local electoral uncertainty and nationwide market dynamics.

          Rather than acting as a direct driver of market behavior, polling volatility in swing
          states seems largely decoupled from financial volatility. This suggests that the market
          does not respond strongly to localized political contests, even when those contests are
          highly competitive.

        </p>

        <div className="bg-white rounded-3xl p-4 md:p-8 shadow-2xl shadow-slate-200/50 border border-slate-100 space-y-6 my-16">
          {(() => {
            const [tab, setTab] = React.useState<'ts' | 'corr'>('ts');

            const charts = {
              ts: {
                src: './p1/solid_state_polling_vs_nasdaq_time_series.html',
                title: 'Solid States: Time Series',
              },
              corr: {
                src: './p1/solid_state_polling_vs_nasdaq_correlation_bars.html',
                title: 'Solid States: Correlation',
              },
            };

            return (
              <>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-serif text-slate-900">
                      Solid States: Quiet Politics, Stronger Signals
                    </h3>
                    <p className="text-slate-600 text-sm mt-1">
                      Solid states experience less electoral competition and lower political
                      uncertainty, yet their polling dynamics may convey broader national signals.
                    </p>
                  </div>

                  <div className="flex bg-slate-100 p-1 rounded-xl">
                    {(['ts', 'corr'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                          tab === t
                            ? 'bg-white shadow-sm text-blue-600'
                            : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        {t === 'ts' ? 'TIME SERIES' : 'CORRELATION'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="aspect-[16/9] min-h-[420px] w-full overflow-hidden rounded-xl bg-slate-50">
                  <iframe
                    key={tab}
                    src={charts[tab].src}
                    title={charts[tab].title}
                    className="w-full h-full border-none rounded-xl"
                  />
                </div>

                
              </>
            );
          })()}
        </div>

        <p>
          Solid states do not exhibit a consistently stronger relationship with stock market
          volatility either. While a few states show moderate positive or negative correlations,
          the overall pattern remains fragmented and lacks a clear directional structure.
        </p>

        <p>
          Taken together, the state-level evidence suggests that correlations between polling
          volatility and market volatility are highly heterogeneous and difficult to interpret
          in isolation. Even in politically stable environments, polling dynamics do not map
          cleanly onto predictable market responses.
        </p>

        {/* ================= Nationwide Map ================= */}
        <div className="bg-white rounded-3xl p-4 md:p-8 shadow-2xl shadow-slate-200/50 border border-slate-100 space-y-6 my-16">
          {(() => {
            const years = [1980, 1984, 1988, 1992, 1996, 2000, 2004, 2008, 2012, 2016];
            const [year, setYear] = React.useState(2016);

            return (
              <>
                <div className="space-y-2">
                  <h3 className="text-2xl font-serif text-slate-900">
                    A Nationwide View: Where Do Politics and Markets Align?
                  </h3>
                  <p className="text-slate-600 text-sm max-w-3xl">
                    To synthesize the state-level patterns, we project the correlation between
                    polling volatility and stock market volatility onto a map of the United
                    States, allowing for a geographic comparison across election cycles.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 bg-slate-100 p-2 rounded-xl w-fit">
                  {years.map((y) => (
                    <button
                      key={y}
                      onClick={() => setYear(y)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        year === y
                          ? 'bg-white shadow-sm text-blue-600'
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {y}
                    </button>
                  ))}
                </div>

                <div className="aspect-[16/9] min-h-[440px] w-full overflow-hidden rounded-xl bg-slate-50">
                  <iframe
                    key={year}
                    src={`./p1/us_map_polling_volatility_${year}.html`}
                    title={`Nationwide map ${year}`}
                    className="w-full h-full border-none rounded-xl"
                  />
                </div>
              </>
            );
          })()}
        </div>

        {/* ================= Yearly National Dynamics ================= */}
        <div className="bg-white rounded-3xl p-4 md:p-8 shadow-2xl shadow-slate-200/50 border border-slate-100 space-y-8 my-16">
          {(() => {
            const years = [1980, 1984, 1988, 1992, 1996, 2000, 2004, 2008, 2012, 2016];
            const [year, setYear] = React.useState(2016);

            return (
              <>
                {/* ===== Section Header ===== */}
                <div className="space-y-2">
                  <h3 className="text-2xl font-serif text-slate-900">
                    Do Polling–Market Relationships Persist Over Time?
                  </h3>
                  <p className="text-slate-600 text-sm">
                    Whether the relationship between polling volatility and market volatility is persistent
                    or merely episodic may be revealed more clearly over time than across space. To explore
                    this possibility, the correlation is traced across election cycles, before zooming in
                    on individual years to examine the underlying national dynamics.
                  </p>
                </div>

                {/* ===== Year Selector ===== */}
                <div className="space-y-2 pt-6">
                  <h4 className="text-lg font-semibold text-slate-800">
                    National Polling vs. Market Volatility (By Year)
                  </h4>
                  <p className="text-slate-600 text-sm">
                    Selecting an election year reveals the time-series comparison between national
                    polling volatility and market volatility during that cycle.
                  </p>

                  <div className="flex flex-wrap gap-2 bg-slate-100 p-2 rounded-xl w-fit">
                    {years.map((y) => (
                      <button
                        key={y}
                        onClick={() => setYear(y)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          year === y
                            ? "bg-white shadow-sm text-blue-600"
                            : "text-slate-400 hover:text-slate-600"
                        }`}
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ===== National Line Plot ===== */}
                <div className="aspect-[16/9] min-h-[440px] w-full overflow-hidden rounded-xl bg-slate-50">
                  <iframe
                    key={year}
                    src={`./p1/national_vs_market_${year}.html`}
                    title={`National polling vs market ${year}`}
                    className="w-full h-full border-none rounded-xl"
                  />
                </div>

                {/* ===== Corr over Time ===== */}
                <div className="space-y-2">
                  <h4 className="text-lg font-semibold text-slate-800">
                    Correlation Across Election Cycles
                  </h4>
                  <p className="text-slate-600 text-sm">
                    The figure below plots the correlation between national polling volatility and NASDAQ
                    volatility across election years, with significance markers indicating statistical
                    strength.
                  </p>

                  <div className="aspect-[16/9] min-h-[420px] w-full overflow-hidden rounded-xl bg-slate-50">
                    <iframe
                      src="./p1/corr_over_time.html"
                      title="Correlation over time"
                      className="w-full h-full border-none rounded-xl"
                    />
                  </div>
                </div>
              </>
            );
          })()}
        </div>

        <p>
          Looking across election years, the geographic pattern of correlations changes a lot.
          Some states show strong positive or negative relationships in certain elections, but
          these patterns do not repeat consistently over time. At the same time, it looks not
          depend on whether these states are swing or solid. In other words, no stable
          geographic map emerges from one cycle to the next. This naturally raises a question:
          are these relationships long-lasting features of elections, or do they appear only
          in specific moments?
        </p>

        <p>
          If any persistence exists, it may be found more in time than in place. Instead of
          showing up as the same states behaving similarly across elections, the link between
          electoral uncertainty and market volatility may become visible when viewed across
          different election cycles. For this reason, attention shifts to how the correlation
          between national polling volatility and market volatility changes from one election
          to the next.
        </p>

        <p>
          The evidence suggests a highly context-dependent relationship.
          Correlations differ not only across states but also across election years. This
          indicates that electoral uncertainty does not generate a single, stable response
          in overall market volatility. Instead, its impact appears to depend on the specific
          political and economic environment of each election cycle.
        </p>

        <p>
          These findings motivate a change in perspective in the next section. Rather than
          focusing on the market as a whole, attention turns to how different industries respond
          during election periods. Sector-level analysis may reveal clearer and more consistent
          patterns than those visible in aggregate market data.
        </p>


 
      </Section>


      {/* Chapter 2: Political Sensitivity & Sector Analysis */}
      <Section id="sensitivity" title="The Sharpest Nerves" subtitle="Political Sensitivity" chapterNumber="02">
        <div className="w-full"> 
          <p className="mb-8">
          <span className="float-left text-7xl font-serif font-bold text-slate-200 leading-[0.8] mr-4 -ml-2 mb-2">A</span>s shown in the previous sections, presidential elections do affect stock markets. Having established this aggregate effect, the market is not uniform; individual stocks and sectors react differently: <strong>Who is affected, how strongly, and in which direction?</strong>
          </p>
          
          <p className="mb-8">
            Treating the market as one single, monolithic entity is a fundamental oversight. The market is not a big blob; it is a collection of distinct industries, each with its own DNA, regulatory landscape, and political stakes. Just as voters take sides based on policy promises, different industries react to the political winds with vastly different temperaments. Accordingly, this section addresses the following question: How politically sensitive are individual stocks, and how does this sensitivity vary across sectors?
          </p>


          <MethodologyNote title="Regression">
            We employ a dual-phase linear regression framework to capture the distinct market dynamics before and after the election. This approach allows us to model cumulative abnormal returns as a function of political and financial variables, estimated using Ordinary Least Squares (OLS). By running regressions at the individual stock level, we uncover how diverse firms respond uniquely to political shifts, while mean-centering and scaling predictors ensures fair comparisons across different variable types.
          </MethodologyNote>
          
          <p className="mb-12 mt-8 text-slate-600 leading-relaxed">
            <strong>Why a Dual-Phase Model?</strong> Because the determinants of market behavior differ before and after the election. Pre-election, the market reacts to polling-based probabilities, reflecting uncertainty and expectations. Post-election, the market reacts to actual outcomes, as policy implications become concrete. Modeling these phases separately allows us to capture these distinct dynamics.
          </p>

          {/* Dual-Phase Interactive Model Specification */}
          <div className="mb-16">
            <h3 className="text-2xl font-serif mb-6 text-slate-900">Model Specification</h3>
            {(() => {
              const [phase, setPhase] = React.useState<'pre' | 'post'>('pre');
              const [activeVar, setActiveVar] = React.useState('AR');
              const [isAutoPlaying, setIsAutoPlaying] = React.useState(true);

              const preVars = {
                'AR': { label: 'CumAR', desc: 'Cumulative Abnormal Return: Firm-specific performance above market expectations.' },
                'alpha': { label: 'α', desc: 'Intercept: The baseline return for stock i during the pre-election window.' },
                'P_Dem_Win': { label: 'P_Dem_Win', desc: 'Polling-based Probability: The calculated likelihood of a Democratic win based on national polls.' },
                'Incumbent': { label: 'Incumbent', desc: 'Incumbency Factor: A dummy variable (1 if Democrats are currently in power).' },
                'Days': { label: 'Days_to_Elect', desc: 'Temporal Proximity: Absolute days until the election, capturing the "heating up" of market sentiment.' },
                'Volat': { label: 'Volatility', desc: 'Financial Control: 20-day rolling standard deviation of abnormal returns.' },
                'Momen': { label: 'Momentum', desc: 'Financial Control: 20-day rolling sum of past returns.' }
              };

              const postVars = {
                'AR': { label: 'CumAR', desc: 'Post-Election Cumulative Abnormal Return: Capturing the market\'s adjustment to the result.' },
                'alpha': { label: 'α', desc: 'Intercept: The baseline return for stock i during the post-election window.' },
                'Winner': { label: 'Winner_Party', desc: 'Outcome Variable: Binary indicator (1 if Democratic candidate won).' },
                'Margin': { label: 'Margin', desc: 'Popular Vote Margin: Reflects the decisiveness of the win and mandate strength.' },
                'Days': { label: 'Days_from_Elect', desc: 'Time Elapsed: Days since the election, tracking the market\'s stabilization period.' },
                'Volat': { label: 'Volatility', desc: 'Financial Control: 20-day rolling standard deviation of abnormal returns.' },
                'Momen': { label: 'Momentum', desc: 'Financial Control: 20-day rolling sum of past returns.' }
              };

              const currentVars = phase === 'pre' ? preVars : postVars;
              const varKeys = Object.keys(currentVars);
              const currentIndex = varKeys.indexOf(activeVar);
              
              const activeColorClass = currentIndex % 2 === 0 ? 'text-blue-400 border-blue-400' : 'text-red-400 border-red-400';
              const labelColorClass = currentIndex % 2 === 0 ? 'text-blue-400' : 'text-red-400';

              React.useEffect(() => {
                if (!isAutoPlaying) return;
                const timer = setInterval(() => {
                  setActiveVar((prev) => {
                    const idx = varKeys.indexOf(prev);
                    return varKeys[(idx + 1) % varKeys.length];
                  });
                }, 2500);
                return () => clearInterval(timer);
              }, [isAutoPlaying, phase, varKeys]);

              return (
                <div 
                  className="bg-slate-900 rounded-2xl p-8 md:p-12 text-white relative overflow-hidden shadow-xl"
                  onMouseEnter={() => setIsAutoPlaying(false)}
                  onMouseLeave={() => setIsAutoPlaying(true)}
                >
                  <div className="flex justify-center gap-4 mb-10 relative z-20">
                    <button onClick={() => { setPhase('pre'); setActiveVar('AR'); }} className={`px-6 py-2 rounded-full font-bold transition-all ${phase === 'pre' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>Pre-Election Phase</button>
                    <button onClick={() => { setPhase('post'); setActiveVar('AR'); }} className={`px-6 py-2 rounded-full font-bold transition-all ${phase === 'post' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400'}`}>Post-Election Phase</button>
                  </div>

                  <div className="relative z-10 text-center">
                    <div className="flex flex-col items-center space-y-8 mb-12 min-h-[140px] justify-center">
                      <div className="flex flex-wrap justify-center items-center gap-2 md:gap-4 text-xl md:text-3xl font-serif">
                        <span onMouseEnter={() => setActiveVar('AR')} className={`cursor-help transition-all duration-500 pb-1 border-b-2 ${activeVar === 'AR' ? `${activeColorClass} scale-110` : 'text-slate-500 border-transparent'}`}>CumAR<sub>i,t</sub></span>
                        <span className="text-slate-600">=</span>
                        <span onMouseEnter={() => setActiveVar('alpha')} className={`cursor-help transition-all duration-500 pb-1 border-b-2 ${activeVar === 'alpha' ? `${activeColorClass} scale-110` : 'text-slate-500 border-transparent'}`}>α<sub>i</sub></span>
                        <span className="text-slate-600">+</span>
                        {phase === 'pre' ? (
                          <>
                            <span onMouseEnter={() => setActiveVar('P_Dem_Win')} className={`cursor-help transition-all duration-500 pb-1 border-b-2 ${activeVar === 'P_Dem_Win' ? `${activeColorClass} scale-110` : 'text-slate-500 border-transparent'}`}>β₁·P_Dem_Win<sub>t</sub></span>
                            <span className="text-slate-600">+</span>
                            <span onMouseEnter={() => setActiveVar('Incumbent')} className={`cursor-help transition-all duration-500 pb-1 border-b-2 ${activeVar === 'Incumbent' ? `${activeColorClass} scale-110` : 'text-slate-500 border-transparent'}`}>β₂·Incumb<sub>t</sub></span>
                          </>
                        ) : (
                          <>
                            <span onMouseEnter={() => setActiveVar('Winner')} className={`cursor-help transition-all duration-500 pb-1 border-b-2 ${activeVar === 'Winner' ? `${activeColorClass} scale-110` : 'text-slate-500 border-transparent'}`}>β₁·Winner<sub>t</sub></span>
                            <span className="text-slate-600">+</span>
                            <span onMouseEnter={() => setActiveVar('Margin')} className={`cursor-help transition-all duration-500 pb-1 border-b-2 ${activeVar === 'Margin' ? `${activeColorClass} scale-110` : 'text-slate-500 border-transparent'}`}>β₂·Margin<sub>t</sub></span>
                          </>
                        )}
                        <span className="text-slate-600">+</span>
                        <span onMouseEnter={() => setActiveVar('Days')} className={`cursor-help transition-all duration-500 pb-1 border-b-2 ${activeVar === 'Days' ? `${activeColorClass} scale-110` : 'text-slate-500 border-transparent'}`}>β₃·Days<sub>t</sub></span>
                      </div>
                      <div className="flex flex-wrap justify-center items-center gap-2 md:gap-4 text-lg md:text-2xl font-serif">
                        <span className="text-slate-600">+</span>
                        <span onMouseEnter={() => setActiveVar('Volat')} className={`cursor-help transition-all duration-500 pb-1 border-b-2 ${activeVar === 'Volat' ? `${activeColorClass} scale-110` : 'text-slate-500 border-transparent'}`}>β₄·Volat<sub>i,t</sub></span>
                        <span className="text-slate-600">+</span>
                        <span onMouseEnter={() => setActiveVar('Momen')} className={`cursor-help transition-all duration-500 pb-1 border-b-2 ${activeVar === 'Momen' ? `${activeColorClass} scale-110` : 'text-slate-500 border-transparent'}`}>β₅·Momen<sub>i,t</sub></span>
                        <span className="text-slate-600">+</span>
                        <span className="text-slate-500 underline decoration-dotted decoration-slate-700">ε<sub>i,t</sub></span>
                      </div>
                    </div>
                    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-xl min-h-[120px] flex items-center gap-6 text-left shadow-inner transition-all duration-500">
                      <div className={`font-bold text-xl font-serif border-r border-slate-700 pr-6 tracking-tighter whitespace-nowrap min-w-[140px] transition-colors duration-500 ${labelColorClass}`}>{currentVars[activeVar].label}</div>
                      <p className="text-slate-300 font-sans leading-relaxed text-sm md:text-base">{currentVars[activeVar].desc}</p>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
          {/* Sensitivity Methodology Box */}
          <AnalogyBox title="Constructing Political Sensitivity">
            <p className="mb-6">
              To summarize political exposure into a single, interpretable measure, we construct a <strong>Political Sensitivity score</strong>:
            </p >
            <div className="bg-white/60 p-6 rounded-xl text-center mb-6 border border-amber-200/50">
              <div className="text-xl text-slate-800">
                {`$$
                \\text{Sensitivity}_i = \\sum_k (\\beta_{k,i} \\times w_{k,i})
                $$`}
              </div>
              <div className="text-sm text-slate-500 font-sans italic mt-4">
                {`$$
                \\text{where } w_{k,i} = \\frac{|t_{k,i}|}{\\sum_k |t_{k,i}|}
                $$`}
              </div>
            </div>
            <p className="mb-4">
              We weight each coefficient by its <strong>statistical significance (t-values)</strong>. Factors with stronger empirical support receive greater weight.
            </p >
          </AnalogyBox>

          <div className="my-16 pl-8 border-l-4 border-blue-600 italic text-2xl md:text-3xl font-serif text-slate-800 leading-tight">
            "When the polls shift, the money moves. We tracked exactly where it goes."
          </div>

          {/* Visualizations Container */}
          <div className="space-y-16">
            
            {/* 1. Interactive Factor Heatmaps */}
            <div className="bg-white rounded-3xl p-4 md:p-8 shadow-2xl shadow-slate-200/50 border border-slate-100 mb-12">
              {(() => {
                const [heatmapTab, setHeatmapTab] = React.useState<'pre' | 'post'>('pre');
                const heatmaps = {
                  'pre': { src: './p2/pre_factor_heatmap.html', title: 'Industry-Political Factor Heatmap: Pre-Election' },
                  'post': { src: './p2/post_factor_heatmap.html', title: 'Industry-Political Factor Heatmap: Post-Election' },
                };

                return (
                  <>
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 px-2">
                      <div>
                        <h3 className="text-2xl font-serif text-slate-900">{heatmaps[heatmapTab]?.title}</h3>
                        <p className="text-slate-500 text-sm">Interactive cross-sectional analysis of standardized beta coefficients.</p>
                      </div>
                      <div className="flex bg-slate-100 p-1 rounded-xl self-start md:self-center">
                        {(Object.keys(heatmaps) as Array<'pre' | 'post'>).map((tab) => (
                          <button key={tab} onClick={() => setHeatmapTab(tab)} className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${heatmapTab === tab ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
                            {tab.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="w-full h-[650px] relative bg-white rounded-xl overflow-hidden border border-slate-50">
                      <iframe key={heatmapTab} src={heatmaps[heatmapTab]?.src} title={heatmaps[heatmapTab]?.title} className="w-full h-full border-none block" scrolling="no" />
                    </div>
                  </>
                );
              })()}
            </div>

            <div className="space-y-12 py-8">
              <div className="max-w-none">
                <p className="text-slate-600 leading-relaxed text-lg mb-8">
                  The heatmaps illustrate how different sectors respond to various political factors. Overall, prior to elections, sectoral reactions are <strong>relatively mild and consistent</strong>, indicating that market participants may only gradually anticipate political outcomes. After elections, however, the implementation of actual policies creates more <strong>heterogeneous impacts</strong>, resulting in the diverse and colorful pattern seen in the post-election data.
                </p>
              </div>

              <div className="max-w-none">
                <h4 className="text-2xl font-serif text-slate-900 mb-6">Industry Policy Anticipation</h4>
                <div className="pl-8 border-l-4 border-slate-200 space-y-6">
                  <p className="text-slate-600 leading-relaxed text-lg">
                    For instance, the negative <strong>Winner_Party coefficient for Healthcare</strong> in the post-election period shows that healthcare stock returns tend to decline when the winning party is Democratic.
                  </p>
                  <p className="text-slate-600 leading-relaxed text-lg">
                    This likely reflects market anticipation of Democratic policies that could impose additional costs or restrictions, such as <strong>stricter pharmaceutical regulations or drug pricing reforms</strong>. Investors price in these regulatory burdens immediately after the election, highlighting how political outcomes translate directly into financial market shifts.
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Aggregated Sensitivity Bar Charts */}
            <div className="bg-white rounded-3xl p-4 md:p-8 shadow-2xl shadow-slate-200/50 border border-slate-100">
              {(() => {
                const [chartTab, setChartTab] = React.useState<'pre' | 'post'>('pre');
                const charts = {
                  'pre': { src: './p2/pre_industry_sensitivity.html', title: 'Pre-Election Sensitivity' },
                  'post': { src: './p2/post_industry_sensitivity.html', title: 'Post-Election Impact' },
                };

                return (
                  <>
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 px-2">
                      <div>
                        <h3 className="text-2xl font-serif text-slate-900">{charts[chartTab]?.title}</h3>
                        <p className="text-slate-500 text-sm">Aggregated Industry Sensitivity Scores (Standardized)</p>
                      </div>
                      <div className="flex bg-slate-100 p-1 rounded-xl">
                        {(Object.keys(charts) as Array<'pre' | 'post'>).map((tab) => (
                          <button key={tab} onClick={() => setChartTab(tab)} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${chartTab === tab ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
                            {tab.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="aspect-[16/10] w-full min-h-[550px] relative overflow-hidden rounded-lg bg-slate-50">
                      <iframe key={chartTab} src={charts[chartTab]?.src} title={charts[chartTab]?.title} className="w-full h-full border-none rounded-lg" />
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Centered Sensitivity Explanation Box */}
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="bg-blue-50/50 p-8 rounded-3xl border border-blue-100">
                <h4 className="text-xl font-serif text-blue-900 mb-4 italic text-center">Understanding Political Sensitivity</h4>
                <p className="text-blue-800/80 text-sm leading-relaxed mb-6 text-center">
                  Political sensitivity measures how much a sector’s stock returns respond to political variables in our regression framework. 
                </p>
                <ul className="grid md:grid-cols-3 gap-6 text-sm text-blue-900/70">
                  <li className="flex flex-col items-center text-center gap-2">
                    <span className="font-bold text-blue-600 text-lg">Positive (+)</span>
                    <span>Moves with the factor (e.g., gains on Democratic win probability).</span>
                  </li>
                  <li className="flex flex-col items-center text-center gap-2">
                    <span className="font-bold text-red-600 text-lg">Negative (-)</span>
                    <span>Moves opposite to the factor (e.g., losses on Democratic win probability).</span>
                  </li>
                  <li className="flex flex-col items-center text-center gap-2 text-slate-600">
                    <span className="font-bold text-lg">Magnitude</span>
                    <span>Larger absolute values indicate stronger reactions to political shifts.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Analysis Prose Sections */}
            <div className="space-y-16 pt-8">
              <div className="max-w-none">
                <h4 className="text-2xl font-serif text-slate-900 mb-4">Overall Patterns</h4>
                <p className="text-slate-600 leading-relaxed text-lg">
                  From the aggregated results, pre-election sensitivity is generally smaller, reflecting cautious positioning as investors anticipate outcomes but uncertainty remains. 
                  Most sectors show sensitivities near zero, with a mix of slightly positive and slightly negative values. Post-election sensitivity tends to be larger, as confirmed outcomes trigger more pronounced adjustments.
                </p>
              </div>

              <div className="max-w-none">
                <h4 className="text-2xl font-serif text-slate-900 mb-4">Industry Reactions</h4>
                <div className="space-y-12 text-slate-600 leading-relaxed text-lg">
                  <p>Interestingly, we can observe two distinctive groups of industries with characteristic behaviors:</p>
                  
                  <div className="pl-8 border-l-4 border-blue-200 space-y-4">
                    <h5 className="text-xl font-bold text-slate-800">Defensive Industries (Utilities, Consumer Defensive)</h5>
                    <p><strong>Pre-election:</strong> These sectors exhibit higher political sensitivity, reflecting investors’ risk-averse behavior. Facing political uncertainty, market participants tend to favor stable, dividend-paying industries as a “safe haven,” causing their stock returns to react more strongly even before the election outcome is known.</p>
                    <p><strong>Post-election:</strong> Sensitivity generally declines as uncertainty resolves. Since defensive industries are less exposed to policy-driven growth opportunities, their reaction to the actual election result is more muted compared to pre-election, stabilizing around their normal return patterns.</p>
                  </div>

                  <div className="pl-8 border-l-4 border-amber-200 space-y-4">
                    <h5 className="text-xl font-bold text-slate-800">Growth Industries (Consumer Cyclical, Technology)</h5>
                    <p><strong>Pre-election:</strong> These sectors show relatively modest sensitivity to political probabilities. Investors focus more on long-term growth potential rather than short-term election probabilities, so stock returns are less affected by shifts in pre-election polls.</p>
                    <p><strong>Post-election:</strong> Sensitivity increases slightly, especially in sectors tied to economic cycles or policy-driven demand. Once the election result is known, changes in expected fiscal or regulatory policies may affect these growth-oriented industries more noticeably, though still generally less volatile than defensive sectors at their peak.</p>
                  </div>
                </div>
              </div>
 
            </div>
          </div>
        </div>
      </Section>



      {/* Chapter 3: Political Leanings */}
      <Section id="leaning" title="The Secret Ballot" subtitle="Stock Partisanship" dark chapterNumber="03">
        <p style={{ marginBottom: '1rem' }} >
        <span className="float-left text-7xl font-serif font-bold text-slate-200 leading-[0.8] mr-4 -ml-2 mb-2">I</span>ndividuals can have political leanings, but can stocks? That’s a fascinating thought. Imagine your vote for your favorite candidate and finally it wins, you may be happy and feel optimistic about the future. May be the same thing happens to stocks! When a candidate wins, certain stocks tend to rise while others fall. This suggests that stocks have their own "political leanings," influenced by how different policies might affect their business. The underlying logic is if the stakeholders believe that a certain candidate's policies will benefit their industry or company, they will buy more of that stock, driving up its price.
             </p>
              <p>
        Given that, stock can also have their own "partisanship", or "color":
        </p>

        <div className="grid md:grid-cols-2 gap-6 my-12">
          <div className="bg-slate-800 p-8 rounded-xl border border-blue-900/30">
            <h4 className="text-blue-400 font-bold mb-3 font-serif text-xl">The "Blue" Stock</h4>
            <p className="text-slate-400 text-sm leading-relaxed">A stock that tends to rise when the Democratic candidate wins the presidential election.</p>
          </div>
          <div className="bg-slate-800 p-8 rounded-xl border border-red-900/30">
            <h4 className="text-red-400 font-bold mb-3 font-serif text-xl">The "Red" Stock</h4>
            <p className="text-slate-400 text-sm leading-relaxed">A stock that tends to rise when the Republican candidate wins the presidential election.</p>
          </div>
        </div>
          

          But a stock's political leaning is secretly hidden, the only way to uncover it is through their behaviors. Different stock's price rises or falls differently in two scenarios: when the Democratic candidate wins and when the Republican candidate wins. By calculating the difference in average returns in these two scenarios, a "political score" can be assinged to each stock. A positive score indicates a Democratic lean, while a negative score indicates a Republican lean. <p>
          Here are the rankings of the top 100 stocks that lean Democratic and Republican, respectively.
          </p>
        <TabIframe 
          tabs={[
            { label: 'Democratic Top 100', src: './p3/democratic_top100.html' },
            { label: 'Republican Top 100', src: './p3/republican_top100.html' },
          ]}
        />

        <p>
          Do you still remember we have the Sensitivity metric from the previous part? Sensitivity, together with the Political Leaning score, produces a complete picture of each stock’s political behavior. The hidden political landscape is represented along two key dimensions: <strong>Sensitivity</strong> (how much the stock reacts to polling changes) and <strong>Inclination</strong> (which party it leans toward). The stocks on the left side tend to rise more when Democrats win, and those on the right side tend to rise more when Republicans win. The result?
        </p>

        <p>
          To make this abstract concept tangible, we plotted the logos of the <strong>top 15 NASDAQ-100 companies</strong> by market weight onto this political map. These aren't just random stocks—they're the giants of American capitalism: your Apples, your Microsofts, your Teslas.
        </p>

          <div className="my-8 flex justify-center">
            <img src="./p3/leaning.png" alt="Political Sensitivity and Inclination Map" className="max-w-full h-auto rounded-lg shadow-lg" />
          </div>

        <p>
          The pattern is striking. The giants of the NASDAQ cluster <strong>heavily on the Republican side or dead center</strong>. Few lean Democratic. It's as if Wall Street's biggest players are quietly placing their bets with their stock price reactions. The invisible hand, it turns out, has a political preference.</p>
      </Section>










      {/* Chapter 4: Events */}
      <Section id="events" title="The Shockwave" subtitle="Event Studies" chapterNumber="04">
        <p>
          <span className="float-left text-7xl font-serif font-bold text-slate-200 leading-[0.8] mr-4 -ml-2 mb-2">E</span>lections are not just slow, grinding trends. They are punctuated by "Black Swans"—sudden, shocking events that rewrite history in an instant.
        </p>

        <h3 className="text-3xl font-bold mb-6 font-serif mt-8">Defining the Moments That Matter</h3>


        <p>
          Our analysis focuses on the <strong>election cycle</strong>—the intense period around each presidential election, roughly 180 days before and after Election Day. During this window, we track specific political shocks: scandals, major announcements, and unexpected events that jolt the race. Not all events are created equal. Some are <strong>policy-driven</strong> (tax reform announcements), others are <strong>scandal-driven</strong> (leaked emails, legal troubles), and some are pure <strong>black swans</strong> (health crises, violent incidents). Each type sends different signals to different sectors.
        </p>

        <h3 className="text-3xl font-bold mb-6 font-serif mt-12">Why Start in 1992? The Data Speaks</h3>

        <div className="w-full flex justify-center my-8">
          <div style={{ width: '70%' }}>
            <img
              src="./p4/year_wise_available_stocks.png"
              alt="Year-wise available stocks"
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </div>
        </div>

        <p>
          You might wonder: why not analyze elections going back to the 1960s or earlier? The answer lies in the quality and quantity of data available.
        </p>

        <p>
          Before 1992, the number of continuously traded stocks on the NASDAQ was surprisingly thin. If we look at the <strong>cumulative percentage of available stocks</strong> over time, we see a stark pattern: the market was far less liquid and diverse in earlier decades. Many companies that exist today simply weren't public yet, and electronic trading was still in its infancy.
        </p>

        <p>
          The end of the <strong>Cold War in 1991</strong> marked a turning point—not just geopolitically, but economically. The 1990s saw an explosion of tech IPOs, globalization, and the modern information economy taking shape. By focusing on the <strong>modern era</strong> (1992 onward), we ensure our analysis rests on a robust foundation of consistently traded stocks, giving us the statistical power to detect meaningful patterns.
        </p>

        <p>
          In short: fewer stocks before 1992 means noisier signals. More stocks after 1992 means clearer stories. And clear stories are what we're after.
        </p>

        <h3 className="text-3xl font-bold mb-6 font-serif mt-12">The Drama Timeline: 1992–2024</h3>

        <p className="mb-4">
          <strong>July 13, 2024.</strong> A rally in Pennsylvania. A gunshot. In seconds, the probability of the election outcome shifted violently. But here's the thing: <em>every</em> election cycle seems to have its own "drama moment" that shakes the market. We carefully selected one remarkable event for each of the election cycles from 1992 to 2024:
        </p>
          
          <div className="flex justify-center my-8">
            <iframe src="./p4/events.html" className="w-full max-w-[75%]" height="700px"></iframe>
          </div>

        <p className="mt-8">
          From the 1992 Gennifer Flowers scandal to Bush's 2000 DUI exposure, from the 2008 Lehman Brothers bankruptcy to the 2016 Comey letter bombshell—each cycle delivered a moment that forced Wall Street to recalibrate overnight.
        </p>

        <h3 className="text-3xl font-bold mb-8 font-serif mt-12">Measuring the Shockwaves</h3>
        
        <p>
          Do the events hit equally? No! Through the lens of <strong>volatility</strong>—the amount of chaos and uncertainty reflected in wild price swings, we can know how the average NASDAQ's uncertainty changed in the <strong>30 days before and after</strong> each event. Think of it as measuring the "tremor intensity" of each political earthquake.
        </p>

        {/* <div className="w-full flex justify-center my-8">
          <div style={{ width: '60%' }}>
            <img
              src="./p4/event_volatility_rank.png"
              alt="Event volatility rank"
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </div>
        </div> */}

        <div className="w-full flex justify-center my-8">
          <iframe src="./p4/event_volatility_rank.html" width="85%" height="500px"></iframe>
        </div>

        <p className="mb-8">
          The results are striking. Some events barely moved the needle, while others sent volatility soaring. For instance, the <strong>2008 financial crisis</strong> during the election cycle created a perfect storm—markets were already fragile, and political uncertainty amplified the panic. In contrast, some debate performances or endorsements that dominated headlines had surprisingly muted market reactions.
        </p>

        <p>
          Zooming in further into how volatility evolves day by day using a <strong>rolling volatility</strong>, it gives us a real-time heartbeat of market anxiety:
        </p>
        
        <div className="w-full flex justify-center my-8">
          <iframe src="./p4/event_rolling_vol.html" width="85%" height="500px"></iframe>
        </div>

        <p className="mt-8">
          Notice how volatility doesn't spike and immediately return to normal—it often <strong>lingers</strong>. A major scandal breaks on a Monday, but the market keeps digesting it all week. Some events create sharp spikes that fade quickly (a debate gaffe), while others trigger sustained elevated volatility (a fundamental shift in polling or policy expectations).
        </p>

        <p>
          What's the story behind these patterns? Events that genuinely change <strong>expected policy outcomes</strong> tend to have longer-lasting impacts. A viral debate moment might create a 24-hour frenzy, but a major shift in polling or a critical endorsement that alters the electoral map keeps investors on edge for weeks.
        </p>

        <div className="my-16 pl-8 border-l-4 border-blue-600 italic text-2xl md:text-3xl font-serif text-slate-800 leading-tight">
          "The market doesn't just react to what happened—it reacts to what might happen next."
        </div>



        <p>
          But how do we know the impact of such a chaotic moment on the stock market? We can't just look at the stock price the next day, because stocks move for a million reasons. Maybe it rained in New York. Maybe interest rates changed. To isolate the impact of the shooting, we needed a <strong>Time Machine</strong>.
        </p>

        <div className="my-12">
          <h3 className="text-3xl font-bold mb-8 font-serif">Building the "Time Machine"</h3>
          <p className="mb-8 text-xl text-slate-600 font-light">
            We used an AI technique called <strong>Counterfactual Analysis</strong>. Here is how it works:
          </p>

          <div className="space-y-6">
            <div className="flex gap-6 items-start group">
              <div className="shrink-0 w-12 h-12 rounded-full border-2 border-slate-100 bg-white flex items-center justify-center font-bold text-slate-300 group-hover:border-blue-500 group-hover:text-blue-500 transition-colors">
                1
              </div>
              <div className="pt-2">
                <h4 className="font-bold text-slate-900 text-lg mb-1">Teaching the Model What “Normal” Looks Like</h4>
                <p className="text-slate-600">
                  We trained an ARIMA-based forecasting model on the <strong>real market data before the event</strong>, so it could learn the
                  “business-as-usual” pattern and project what would likely happen next in a calm world.
                </p>

                {/* Note: Why ARIMA? */}
                <div className="mt-4">
                <AnalogyBox title="Why ARIMA?">
                  <ul className="space-y-3 text-slate-600">
                    <li>
                      <strong>Stocks are time series.</strong> Today is not independent of yesterday—prices have memory.
                      That’s why a <strong>time-series model</strong> is the most natural “first guess” for what normal looks like.
                    </li>
                    <li>
                      <strong>ARIMA is a lightweight short-horizon autopilot.</strong> It captures the core rhythm of the market
                      (trend + autocorrelation) without heavy feature engineering—perfect when we just need a solid baseline.
                    </li>
                    <li>
                      <strong>Clear, interpretable, reproducible.</strong> For an event study, we don’t want a mysterious black box—
                      we want a transparent counterfactual we can trust. ARIMA gives us that “peaceful timeline” to compare against.
                    </li>
                  </ul>
                </AnalogyBox>
                </div>

                
              </div>
            </div>

            <div className="flex gap-6 items-start group">
              <div className="shrink-0 w-12 h-12 rounded-full border-2 border-slate-100 bg-white flex items-center justify-center font-bold text-slate-300 group-hover:border-blue-500 group-hover:text-blue-500 transition-colors">
                2
              </div>
              <div className="pt-2">
                <h4 className="font-bold text-slate-900 text-lg mb-1">Simulating the Alternate Reality</h4>
                <p className="text-slate-600">
                  We asked the model: <em>"Given everything we saw before, what would the stock price be if the shooting had never happened?"</em>
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start group">
              <div className="shrink-0 w-12 h-12 rounded-full border-2 border-slate-100 bg-white flex items-center justify-center font-bold text-slate-300 group-hover:border-blue-500 group-hover:text-blue-500 transition-colors">
                3
              </div>
              <div className="pt-2">
                <h4 className="font-bold text-slate-900 text-lg mb-1">Measuring the Gap</h4>
                <p className="text-slate-600">
                  The difference between the model’s <strong>"Peaceful Timeline"</strong> and the chaotic <strong>"Real Timeline"</strong> is our estimate of the
                  event’s true economic impact.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* <ChartPlaceholder 
          title="Reality vs. Simulation: The Trump Shooting" 
          type="Diverging Line Chart" 
          caption="The blue line shows the 'Counterfactual' (what should have happened). The red line shows reality. The massive gap that opens up represents the market's instant pricing of political chaos."
        /> */}


        <h3 className="text-3xl font-bold mb-6 font-serif">"Time Machine" on a Real-World Shock: Trump’s assassination attempt</h3>

        <p className="text-slate-600 text-lg leading-relaxed">
          Now we zoom in on one of the most dramatic election-related moments of the 2024 cycle: Trump’s assassination attempt on July 13, 2024:
        </p>

        <p className="mt-6 text-slate-600 text-lg leading-relaxed">
          From a market perspective, this is more than breaking news—it can <strong>rewire expectations</strong> about the election:
          perceived win probabilities, campaign momentum, and policy outlook can all shift in a single weekend.
        </p>

        <p className="mt-4 text-slate-600 text-lg leading-relaxed">
          The incident occurred on a <strong>Saturday</strong> (when U.S. equity markets are closed), but the market doesn’t forget.
          Any reassessment of political risk has to wait until the opening bell—then it shows up in prices.
          That makes this a clean setup for an <strong>event study</strong> over the next trading days.
        </p>

        <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-6">
          <h4 className="mb-4 text-slate-900 text-lg font-semibold">
            Data choices (so our comparisons are fair)
          </h4>

          <div className="space-y-4">
            <div className="grid grid-cols-[140px_1fr] items-start gap-4">
              <span className="inline-flex h-10 items-center justify-center rounded-lg bg-slate-200 px-3 text-sm font-semibold text-slate-900">
                Closing Price
              </span>
              <p className="text-slate-700 leading-relaxed">
                We start from the <span className="font-semibold text-slate-900">daily closing price</span>, the standard “end-of-day verdict”
                that reflects how the market has digested new information by the session’s close.
              </p>
            </div>

            <div className="grid grid-cols-[140px_1fr] items-start gap-4">
              <span className="inline-flex h-10 items-center justify-center rounded-lg bg-slate-200 px-3 text-sm font-semibold text-slate-900">
                Log Close
              </span>
              <p className="text-slate-700 leading-relaxed">
                To compare assets on the same scale, we convert prices to <span className="font-semibold text-slate-900">log close</span>. This turns
                moves into percentage-like changes, reduces scale effects, and makes patterns across different stocks easier to interpret.
              </p>
            </div>
          </div>
        </div>



        <p className="mt-8 text-slate-700 text-lg">
          The chart below shows NASDAQ log(close) from 2019 to 2025 and when the Trump assassination attempt happened:
        </p>

        <div className="my-6 flex justify-center">
          <img
            src="./p4/NASDAQ_trump.png"
            alt="NASDAQ around the Trump assassination attempt"
            className="max-w-full h-auto rounded-lg shadow-lg"
          />
        </div>

        <h3 className="mt-8 text-slate-900 text-xl font-semibold">
          Analysis for NASDAQ (what happens as a whole?)
        </h3>

        <p className="mt-4 text-slate-600 text-lg leading-relaxed">
          To see the <strong>big picture</strong>, we start at the top: the NASDAQ index.
          Since NASDAQ is a broad market barometer, it gives us a clean, high-level reference before we zoom in on individual stocks.
        </p>

        <p className="mt-4 text-slate-600 text-lg leading-relaxed">
          We fit an ARIMA model to estimate the counterfactual—<em>what the market would have looked like if the event had never happened</em>.
          Concretely, we train ARIMA on the <strong>20 weeks of pre-event data</strong> and forecast the <strong>following 1 week</strong>.
          We keep this exact window for every single stock later on, so all results are directly comparable—same “time machine,” same settings.
        </p>

        <div className="flex justify-center mt-6">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800"
            aria-expanded={open}
          >
            {open ? "Stop time machine" : "Start time machine"}
          </button>
        </div>

        {open && (
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
            <div className="my-6 flex justify-center">
              <img
                src="./p4/NASDAQ_trump_arima.png"
                alt="NASDAQ around the Trump assassination attempt with ARIMA model (real vs. counterfactual)"
                className="max-w-full h-auto rounded-lg shadow-lg"
              />
            </div>

            <p className="text-slate-700 leading-relaxed">
              As shown in the figure above, the ARIMA forecast suggests a relatively stable continuation of the previous upward trend.
              However, the actual log(NASDAQ Close) drops noticeably after the market reopens, falling below the no-event
              counterfactual implied by ARIMA.
            </p>

            <p className="mt-4 text-slate-700 leading-relaxed">
              Moreover, the 95% prediction interval widens, and the observed drop lies in the tail of what the model considers
              plausible. This suggests that the decline is unlikely to be explained by normal volatility alone.
            </p>

            <p className="mt-4 text-slate-700 leading-relaxed">
              This pattern is consistent with contemporaneous market commentary: the assassination attempt increased political
              uncertainty, and media reports described a short-term risk-off mood when trading resumed. While the event did not
              lead to a major crash, it still caused a clear deviation from the expected trajectory.
            </p>
          </div>
        )}


        <h3 className="mt-8 text-slate-900 text-xl font-semibold">
          Analysis for Individual Stocks (what happens to each stock?)
        </h3>

        <p className="mt-4 text-slate-700 text-lg leading-relaxed">
          However, does <em>every</em> stock drop more than expected after the event?
        </p>

        <p className="mt-4 text-slate-700 text-lg leading-relaxed">
          We now apply the same ARIMA-based procedure to <strong>each individual stock</strong>.
          To keep the comparison consistent, we use the <strong>same window as before</strong> (20 weeks pre-event to forecast the following 1 week).
        </p>

        <p className="mt-4 text-slate-700 text-lg leading-relaxed">
          We find that while the overall market trends downward, stock-level responses vary: some tickers deviate negatively,
          while others perform better than the counterfactual.
        </p>

        <div className="flex justify-center mt-6">
          <button
            type="button"
            onClick={() => setOpenABM((v) => !v)}
            className="inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800"
            aria-expanded={openABM}
          >
            {openABM ? "Stop time machine" : "Start time machine"}
          </button>
        </div>

        {openABM && (
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
            <StockCarousel />

            <p className="mt-4 text-slate-700 text-lg leading-relaxed">
              For example, the figures above show different stocks, some of which perform better than expected relative to the no-event
              counterfactual implied by ARIMA (eg:ABM).
            </p>
            <p className="mt-4 text-slate-700 text-base leading-relaxed">
              If you want to explore the results for each individual stock, you can find an interactive explorer{' '}
              <a 
                href="#stock-explorer" 
                className="text-blue-600 hover:text-blue-800 underline font-semibold"
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.getElementById('stock-explorer');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
              >
                below
              </a>
              , where you can search for any ticker and view its residual plot.
            </p>
          </div>
        )}

        <p className="mt-4 text-slate-700 text-lg leading-relaxed">
          This naturally motivates a <strong>clustering step</strong>: by grouping stocks with similar post-event deviations, we can summarize
          heterogeneous reactions and identify representative response patterns.
        </p>

        <h3 className="mt-8 text-slate-900 text-xl font-semibold">
          Clustering the Stock Responses
        </h3>

        <p className="mt-4 text-slate-700 text-lg leading-relaxed">
          The goal is simple: group together stocks that “reacted” in a similar way, so we can spot a few common response
          patterns instead of staring at hundreds of individual charts. So we run clustering on these “Gaps” between the actual and predicted prices to discover a small number of typical reaction patterns. The figure below shows our clustering results.
        </p>
        
        {/*
        --But what exactly should we cluster for each stock?
          That takes us back to what we truly care about: the gap between what actually happened and what would have happened
          without the event.



        <p className="mt-4 text-slate-700 text-lg leading-relaxed">
          Here’s the idea: for each stock, we use ARIMA to build a no-event baseline, then measure how the real price path
          diverges from that baseline. That divergence is our signal.
        </p>

        <p className="mt-4 text-slate-700 text-lg leading-relaxed">
          Conveniently, this gap is exactly what a <strong>residual</strong> captures. Concretely, for every stock we compute a short
          <strong> residual series</strong> around the event window:
          <strong> residual = actual − forecast</strong>. You can think of it as the stock’s “surprise signal.”
        </p>

        <p className="mt-4 text-slate-700 text-lg leading-relaxed">
          Finally, we run clustering on these “surprise signal” to discover a small number of typical reaction patterns. The figure below shows our clustering results on the residual time series.
        </p>
        */}
        {/*
        <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-6">
          <h4 className="mb-4 text-slate-900 text-lg font-semibold">
            Still, this alone isn't enough. We add two more tricks so the clustering captures how stocks react (the shape over time).
          </h4>

          <div className="space-y-4">
            <div className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md hover:border-blue-400">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-8 items-center rounded-full bg-slate-900 px-3 text-sm font-semibold text-white">
                  Trick 1
                </span>
                <h5 className="text-slate-900 text-base font-semibold">
                  Normalize each residual series
                </h5>
              </div>

              <p className="mt-3 text-slate-700 text-lg leading-relaxed">
                We standardize each residual series (e.g., zero mean and unit variance) so large-cap and small-cap stocks live on a comparable
                scale. This makes clustering focus on the <em>direction</em> and <em>shape</em> of the response, rather than absolute magnitude.
              </p>
            </div>

            <div className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md hover:border-blue-400">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-8 items-center rounded-full bg-slate-900 px-3 text-sm font-semibold text-white">
                  Trick 2
                </span>
                <h5 className="text-slate-900 text-base font-semibold">
                  Use DTW distance instead of Euclidean distance
                </h5>
              </div>

              <ul className="mt-3 list-disc pl-6 text-slate-700 text-lg leading-relaxed space-y-2">
                <li>
                  With Euclidean distance, two stocks that react in the same way but with a <strong>1–2 day delay</strong> can look very different,
                  because peaks and dips are compared point-by-point.
                </li>
                <li>
                  DTW allows small <strong>time shifts</strong> and local stretching/compression. It "warps" the time axis so patterns that happen
                  slightly earlier or later can still be matched.
                </li>
              </ul>

              <div className="my-6 flex justify-center">
                <img
                  src="./p4/DTW.png"
                  alt="Dynamic Time Warping (DTW)"
                  className="max-w-full h-auto rounded-lg shadow-lg"
                />
              </div>

              <div className="mt-3 rounded-lg border-l-4 border-slate-400 bg-slate-50 px-4 py-3">
                <p className="text-slate-700 text-lg leading-relaxed">
                  In the example above, the two sequences share the same overall pattern but are slightly misaligned in time. Under Euclidean
                  distance they look far apart, while DTW aligns the shapes and yields a much smaller distance.
                </p>
              </div>
            </div>
          </div>

          <p className="mt-4 text-slate-700 text-lg leading-relaxed">
            With normalization + DTW-based K-means, we cluster stocks by their <strong>reaction pattern</strong>, instead of being driven by
            differences in scale or small timing lags.
          </p>
        </div>

        */}

        <div className="my-6 flex justify-center">
          <img
            src="./p4/Cluster_center.png"
            alt="Clustering results for the residual time series"
            className="max-w-full h-auto rounded-lg shadow-lg"
          />
        </div>

        <p className="mt-4 text-slate-700 text-lg leading-relaxed">
          With three clusters, the average residual patterns are easy to read:
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {/* Cluster 0 - blue */}
          <div className="group rounded-xl border border-blue-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md hover:border-blue-400">
            <div className="mb-3 flex items-center justify-between">
              <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                Cluster 0
              </span>
              <span className="h-3 w-3 rounded-full bg-blue-500" aria-hidden="true" />
            </div>
            <h5 className="text-slate-900 font-semibold">Downward pattern (46.6%)</h5>
            <p className="mt-2 text-slate-700 leading-relaxed">
              Residuals drift lower after the event, meaning these stocks <span className="font-semibold text-slate-900">underperform</span> their
              no-event counterfactual.
            </p>
          </div>

          {/* Cluster 1 - green */}
          <div className="group rounded-xl border border-emerald-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md hover:border-emerald-400">
            <div className="mb-3 flex items-center justify-between">
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                Cluster 1
              </span>
              <span className="h-3 w-3 rounded-full bg-emerald-500" aria-hidden="true" />
            </div>
            <h5 className="text-slate-900 font-semibold">Upward pattern (31.2%)</h5>
            <p className="mt-2 text-slate-700 leading-relaxed">
              Residuals rise overall, corresponding to stocks that <span className="font-semibold text-slate-900">outperform</span> the counterfactual
              after the event.
            </p>
          </div>

          {/* Cluster 2 - red */}
          <div className="group rounded-xl border border-rose-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md hover:border-rose-400">
            <div className="mb-3 flex items-center justify-between">
              <span className="inline-flex items-center rounded-full bg-rose-50 px-3 py-1 text-sm font-semibold text-rose-700">
                Cluster 2
              </span>
              <span className="h-3 w-3 rounded-full bg-rose-500" aria-hidden="true" />
            </div>
            <h5 className="text-slate-900 font-semibold">Moderate / stable pattern (22.2%)</h5>
            <p className="mt-2 text-slate-700 leading-relaxed">
              Residuals hover around zero with smaller swings, suggesting a <span className="font-semibold text-slate-900">muted</span> reaction.
            </p>
          </div>
        </div>


        <p className="mt-4 text-slate-700 text-lg leading-relaxed">
          Together, these three groups summarize the main ways stocks deviate from their no-event trajectories: clear losers, clear winners,
          and names that are close to “business as usual.”
        </p>

        <div className="mt-4 rounded-lg border-l-4 border-slate-400 bg-slate-50 px-4 py-3">
          <p className="text-slate-700 text-lg leading-relaxed">
            Notably, the downward cluster contains the largest share of stocks (46.6%), which matches the overall decline we observed in the NASDAQ index.
          </p>
        </div>

        <p className="mt-4 text-slate-700 text-lg leading-relaxed">
          For a more intuitive view, we also project the residual time series into 3D using PCA and color each point by its cluster label.
          In the interactive plot, you can filter stocks by selecting a cluster and hover over any point to see the
          corresponding ticker. 
        </p>
        <p className="mt-4 text-slate-700 text-lg leading-relaxed">
          If you want to see the residual plot for each stock, you can find an interactive explorer below.
        </p>

        <div id="stock-explorer">
          <StockExplorer />
        </div>


      </Section>

      {/* Chapter 5: Conclusion */}
      <Section id="conclusion" title="The Listening Market" subtitle="Conclusion" chapterNumber="05">
        <p>
          <span className="float-left text-7xl font-serif font-bold text-slate-200 leading-[0.8] mr-4 -ml-2 mb-2">W</span>hen you step back from the charts, a simple picture emerges. Markets don’t react to politics because of party colors alone—they react to shifting expectations about what tomorrow might look like. In quiet times, the market hums. In loud times, it listens harder. And in the rare moments when the story suddenly bends, prices move fast to catch up.
        </p>
        <p>
          We saw this in the broader mood of the NASDAQ: election seasons carry more uncertainty, but not all years are equal. Some cycles feel like a steady walk; others feel like crossing a river on moving stones. We watched sensitivity by industry and learned that some corners of the market tighten first—finance and health often watch the scoreboard closely, while technology sometimes keeps building through the noise.
        </p>
        <p>
          We noticed how individual companies quietly signal their comfort zones. It isn’t about slogans. It’s about how their prices lean when the wind changes. Many of the biggest names seemed steadier or slightly right-leaning in their reactions—less a declaration, more a pattern of behavior, shaped by how they see policy, taxes, regulation, and growth.
        </p>
        <p>
          And then there are the nights that write their own chapters. A scandal. A collapse. A letter. An attempt that stops time for a moment. On those nights, the market doesn’t wait for speeches. It sketches its own alternate path—what would have happened—then measures the gap. Some stocks stumble, some hold their ground, and a few step forward. The story is never one-size-fits-all.
        </p>
        <p>
          If there’s a lesson here, it’s this: the market is a listener. It hears what might happen next and prices it quickly, then keeps listening as the story unfolds. For investors, that means paying attention not just to the destination, but to the turns in the road—the small signals, the sudden bends, the way different travelers handle the terrain.
        </p>
        <p>
          This isn’t a map to certainty. It’s a way to read the room. Elections make the room louder, and the market responds with its own voice—sometimes cautious, sometimes confident, always honest. Our hope is that this story helps you hear that voice more clearly. The next cycle will come soon enough. When it does, you’ll know where to look, and what to listen for.
        </p>
      </Section>

      {/* Footer with Bonus */}
      <footer className="bg-slate-900 text-slate-400 py-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Congrats Message */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-red-400 mb-4">
              Congratulations!
            </h2>
            <p className="text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Thank you for exploring <strong className="text-slate-200">34 years of market data</strong>, diving into political sensitivity, and uncovering the hidden patterns between elections and stock movements. Really a Bumpy Road!
            </p>
          </div>

          {/* Bonus: Compact Reading Flow */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6 mb-12 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="text-amber-400">✨</span>
              <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Bonus: Your "Reading Flow" Stock</h4>
            </div>
            
            {/* Ultra-compact SVG Chart */}
            <div className="bg-slate-950/50 rounded-lg p-3 mb-3">
              <svg width="100%" height="80" viewBox="0 0 400 80" preserveAspectRatio="xMidYMid meet">
                {/* Simple Grid */}
                <defs>
                  <pattern id="footer-grid" width="40" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 10" fill="none" stroke="#1e293b" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="400" height="80" fill="url(#footer-grid)" />
                
                {/* Area */}
                {scrollPath.length > 1 && (
                  <path
                    d={`${(() => {
                      const points = scrollPath.map((value, index) => {
                        const x = (index / Math.max(scrollPath.length - 1, 1)) * 400;
                        const y = 80 - (value / 100) * 80;
                        return { x, y };
                      });
                      let path = `M ${points[0].x} ${points[0].y}`;
                      for (let i = 1; i < points.length; i++) {
                        path += ` L ${points[i].x} ${points[i].y}`;
                      }
                      return path;
                    })()} L 400 80 L 0 80 Z`}
                    fill="url(#footer-gradient)"
                    opacity="0.3"
                  />
                )}
                
                <defs>
                  <linearGradient id="footer-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Line */}
                {scrollPath.length > 1 && (
                  <path
                    d={(() => {
                      const points = scrollPath.map((value, index) => {
                        const x = (index / Math.max(scrollPath.length - 1, 1)) * 400;
                        const y = 80 - (value / 100) * 80;
                        return { x, y };
                      });
                      let path = `M ${points[0].x} ${points[0].y}`;
                      for (let i = 1; i < points.length; i++) {
                        path += ` L ${points[i].x} ${points[i].y}`;
                      }
                      return path;
                    })()}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                )}

                {/* End point */}
                {scrollPath.length > 0 && (() => {
                  const currentValue = scrollPath[scrollPath.length - 1] || 0;
                  return (
                    <circle
                      cx={400}
                      cy={80 - (currentValue / 100) * 80}
                      r="3"
                      fill="#3b82f6"
                      className="animate-pulse"
                    />
                  );
                })()}
              </svg>

              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>0%</span>
                <span className="text-sm font-bold text-blue-400">
                  {(scrollPath[scrollPath.length - 1] || 0).toFixed(1)}%
                </span>
                <span>100%</span>
              </div>
            </div>

            {/* Compact Download button */}
            <button
              onClick={() => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) return;

                const width = 800;
                const height = 450;
                canvas.width = width;
                canvas.height = height;

                // Background
                const gradient = ctx.createLinearGradient(0, 0, width, height);
                gradient.addColorStop(0, '#1e293b');
                gradient.addColorStop(1, '#0f172a');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, width, height);

                // Title
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 32px serif';
                ctx.textAlign = 'center';
                ctx.fillText('My Reading Journey', width / 2, 50);

                ctx.fillStyle = '#94a3b8';
                ctx.font = '16px sans-serif';
                ctx.fillText("The Market's Vote - Data Story", width / 2, 80);

                // Chart area
                const chartX = 50;
                const chartY = 120;
                const chartWidth = width - 100;
                const chartHeight = height - 180;

                // Grid
                ctx.strokeStyle = '#334155';
                ctx.lineWidth = 0.5;
                for (let i = 0; i <= 10; i++) {
                  const y = chartY + (chartHeight / 10) * i;
                  ctx.beginPath();
                  ctx.moveTo(chartX, y);
                  ctx.lineTo(chartX + chartWidth, y);
                  ctx.stroke();
                }

                // Draw path
                if (scrollPath.length > 1) {
                  const points = scrollPath.map((value, index) => {
                    const x = chartX + (index / Math.max(scrollPath.length - 1, 1)) * chartWidth;
                    const y = chartY + chartHeight - (value / 100) * chartHeight;
                    return { x, y };
                  });

                  // Area
                  ctx.beginPath();
                  ctx.moveTo(points[0].x, chartY + chartHeight);
                  points.forEach(p => ctx.lineTo(p.x, p.y));
                  ctx.lineTo(points[points.length - 1].x, chartY + chartHeight);
                  ctx.closePath();
                  const areaGradient = ctx.createLinearGradient(0, chartY, 0, chartY + chartHeight);
                  areaGradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
                  areaGradient.addColorStop(1, 'rgba(59, 130, 246, 0.05)');
                  ctx.fillStyle = areaGradient;
                  ctx.fill();

                  // Line
                  ctx.beginPath();
                  ctx.moveTo(points[0].x, points[0].y);
                  points.forEach(p => ctx.lineTo(p.x, p.y));
                  ctx.strokeStyle = '#3b82f6';
                  ctx.lineWidth = 3;
                  ctx.stroke();

                  // End point
                  const lastPoint = points[points.length - 1];
                  ctx.beginPath();
                  ctx.arc(lastPoint.x, lastPoint.y, 5, 0, Math.PI * 2);
                  ctx.fillStyle = '#3b82f6';
                  ctx.fill();
                }

                // Labels
                ctx.fillStyle = '#64748b';
                ctx.font = '12px sans-serif';
                ctx.textAlign = 'left';
                ctx.fillText('Start: 0%', chartX, chartY + chartHeight + 20);
                ctx.textAlign = 'right';
                ctx.fillText('End: 100%', chartX + chartWidth, chartY + chartHeight + 20);
                
                const currentValue = scrollPath[scrollPath.length - 1] || 0;
                ctx.textAlign = 'center';
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 20px sans-serif';
                ctx.fillText(`Completion: ${currentValue.toFixed(1)}%`, width / 2, height - 20);

                // Download
                const link = document.createElement('a');
                link.download = 'my-reading-journey.png';
                link.href = canvas.toDataURL();
                link.click();
              }}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Save & Share
            </button>
          </div>

          {/* Footer Credits */}
          <div className="text-center border-t border-slate-800 pt-8">
            <Activity className="w-6 h-6 text-slate-700 mx-auto mb-4" />
            <h3 className="text-2xl font-serif text-slate-200 mb-4">The Market's Vote</h3>
            <div className="flex flex-col gap-2 text-xs font-medium tracking-wide uppercase text-slate-600">
              <p>© Penta Data: a 2025 EPFL ADA Project Team</p>
              <p>Data Sources: Kaggle, FiveThirtyEight</p>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Animation Styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);