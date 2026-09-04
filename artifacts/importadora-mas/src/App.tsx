import { useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ShoppingBag, Search, Menu, X, MapPin, Truck, ShieldCheck, MessageCircle, ChevronRight, ChevronDown, Minus, Plus, Trash2, Star, SlidersHorizontal, Flame, Sparkles, PackageCheck, Clock3, Instagram, Facebook, ArrowRight, Heart, CircleHelp } from 'lucide-react';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient();

type Category = 'Todos' | 'Ofertas' | 'Hogar' | 'Herramientas' | 'Aire libre' | 'Organización';
type Product = { id: number; name: string; category: Exclude<Category, 'Todos' | 'Ofertas'>; price: number; oldPrice?: number; rating: number; reviews: number; image: string; badge?: string; isNew?: boolean; stock: number; description: string; features: string[] };
type CartItem = { product: Product; quantity: number };

const products: Product[] = [
  { id: 1, name: 'Taladro inalámbrico 12V + accesorios', category: 'Herramientas', price: 24990, oldPrice: 34990, rating: 4.8, reviews: 34, image: 'https://images.pexels.com/photos/569163/pexels-photo-569163.jpeg?auto=compress&cs=tinysrgb&w=700', badge: 'Oferta', stock: 8, description: 'El aliado preciso para reparaciones y proyectos en casa. Compacto, potente y fácil de usar.', features: ['Batería recargable 12V', 'Set de 10 puntas incluido', 'Luz LED de trabajo'] },
  { id: 2, name: 'Set de 3 cajas organizadoras', category: 'Organización', price: 12990, oldPrice: 16990, rating: 4.7, reviews: 18, image: 'https://images.pexels.com/photos/4246120/pexels-photo-4246120.jpeg?auto=compress&cs=tinysrgb&w=700', badge: 'Oferta', stock: 12, description: 'Orden simple para cada espacio. Cajas apilables con tapa segura y diseño que se adapta a tu hogar.', features: ['3 tamaños complementarios', 'Plástico resistente', 'Apilables y lavables'] },
  { id: 3, name: 'Linterna recargable de camping', category: 'Aire libre', price: 8990, rating: 4.9, reviews: 42, image: 'https://images.pexels.com/photos/6271625/pexels-photo-6271625.jpeg?auto=compress&cs=tinysrgb&w=700', badge: 'Más vendido', isNew: true, stock: 24, description: 'Luz confiable para el patio, la carpa o ese corte de luz inesperado.', features: ['Hasta 8 horas de autonomía', 'Carga USB-C', 'Gancho para colgar'] },
  { id: 4, name: 'Silla plegable multipropósito', category: 'Hogar', price: 15990, oldPrice: 19990, rating: 4.6, reviews: 27, image: 'https://images.pexels.com/photos/276583/pexels-photo-276583.jpeg?auto=compress&cs=tinysrgb&w=700', badge: 'Oferta', stock: 6, description: 'Una silla extra siempre viene bien. Liviana, firme y lista para guardar cuando no la necesitas.', features: ['Estructura de acero', 'Soporta hasta 100 kg', 'Cierre compacto'] },
  { id: 5, name: 'Mochila térmica para paseo 18L', category: 'Aire libre', price: 19990, rating: 4.8, reviews: 11, image: 'https://images.pexels.com/photos/1687845/pexels-photo-1687845.jpeg?auto=compress&cs=tinysrgb&w=700', isNew: true, stock: 9, description: 'Mantén tus bebidas y colaciones frescas durante la salida completa.', features: ['Aislación térmica', 'Capacidad 18 litros', 'Correas acolchadas'] },
  { id: 6, name: 'Escurridor de loza extensible', category: 'Hogar', price: 10990, rating: 4.5, reviews: 16, image: 'https://images.pexels.com/photos/4239013/pexels-photo-4239013.jpeg?auto=compress&cs=tinysrgb&w=700', stock: 14, description: 'Más espacio para secar sin ocupar toda la cubierta de tu cocina.', features: ['Se extiende hasta 48 cm', 'Bandeja recoge gotas', 'Acero anticorrosivo'] },
  { id: 7, name: 'Manguera flexible 15 metros', category: 'Aire libre', price: 13990, oldPrice: 18990, rating: 4.4, reviews: 9, image: 'https://images.pexels.com/photos/450516/pexels-photo-450516.jpeg?auto=compress&cs=tinysrgb&w=700', badge: 'Oferta', stock: 4, description: 'Riego y limpieza más cómodos, sin enredos ni peso innecesario.', features: ['Conector universal', 'Se expande con el agua', 'Incluye boquilla'] },
  { id: 8, name: 'Organizador de herramientas mural', category: 'Herramientas', price: 18990, rating: 4.7, reviews: 13, image: 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=700', isNew: true, stock: 10, description: 'Tu espacio de trabajo, despejado y listo para el próximo proyecto.', features: ['Panel perforado', 'Ganchos incluidos', 'Instalación sencilla'] },
];

const categories: { name: Exclude<Category, 'Todos' | 'Ofertas'>; icon: string; copy: string }[] = [
  { name: 'Hogar', icon: '⌂', copy: 'Pequeñas mejoras' },
  { name: 'Herramientas', icon: '✣', copy: 'Manos a la obra' },
  { name: 'Aire libre', icon: '◌', copy: 'Salidas con ganas' },
  { name: 'Organización', icon: '▦', copy: 'Todo en su lugar' },
];

const money = (value: number) => `$${value.toLocaleString('es-CL')}`;

function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [detail, setDetail] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [query, setQuery] = useState('');
  const [searchFocus, setSearchFocus] = useState(false);
  const [category, setCategory] = useState<Category>('Todos');
  const [filter, setFilter] = useState<'all' | 'offer' | 'new' | 'stock'>('all');
  const [sort, setSort] = useState('featured');
  const [toast, setToast] = useState('');

  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(''), 2600); };
  const addToCart = (product: Product) => {
    setCart(current => {
      const found = current.find(item => item.product.id === product.id);
      return found ? current.map(item => item.product.id === product.id ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) } : item) : [...current, { product, quantity: 1 }];
    });
    notify(`${product.name} se agregó al carrito`);
  };
  const updateQuantity = (id: number, delta: number) => setCart(current => current.map(item => item.product.id === id ? { ...item, quantity: Math.max(0, Math.min(item.quantity + delta, item.product.stock)) } : item).filter(item => item.quantity > 0));
  const removeFromCart = (id: number) => setCart(current => current.filter(item => item.product.id !== id));
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const visibleProducts = useMemo(() => {
    const normalized = query.toLowerCase().trim();
    const result = products.filter(product => {
      const matchesQuery = !normalized || `${product.name} ${product.category}`.toLowerCase().includes(normalized);
      const matchesCategory = category === 'Todos' || (category === 'Ofertas' ? !!product.oldPrice : product.category === category);
      const matchesFilter = filter === 'all' || (filter === 'offer' ? !!product.oldPrice : filter === 'new' ? !!product.isNew : product.stock > 0);
      return matchesQuery && matchesCategory && matchesFilter;
    });
    return [...result].sort((a, b) => sort === 'price-low' ? a.price - b.price : sort === 'price-high' ? b.price - a.price : sort === 'rating' ? b.rating - a.rating : a.id - b.id);
  }, [category, filter, query, sort]);

  return (
    <div className="min-h-[100dvh] bg-[#fbfaf7] text-[#26262a]">
      <div className="bg-[#26262a] text-[#fbfaf7] text-[11px] sm:text-xs tracking-wide">
        <div className="container-shop flex h-9 items-center justify-between">
          <span className="flex items-center gap-2"><MapPin size={13} className="text-[#f6b83f]" /> Linares, Región del Maule</span>
          <span className="hidden sm:flex items-center gap-2"><Truck size={13} className="text-[#f6b83f]" /> Envíos a todo Chile · Retiro gratis en tienda</span>
          <span className="sm:hidden">Envíos a todo Chile</span>
        </div>
      </div>

      <header className="sticky top-0 z-30 border-b border-[#ebe5dc] bg-[#fbfaf7]/95 backdrop-blur-md">
        <div className="container-shop flex h-[74px] items-center gap-4">
          <button data-testid="button-mobile-menu" aria-label="Abrir menú" className="rounded-lg p-2 hover:bg-[#f1ece4] md:hidden" onClick={() => setMenuOpen(true)}><Menu size={23} /></button>
          <a data-testid="link-home" href="#inicio" className="flex items-center gap-2.5 shrink-0">
            <img src="/importadora-mas-logo.jpg" alt="Importadora Más Linares" className="h-12 w-12 rounded-xl object-cover shadow-sm sm:h-[54px] sm:w-[61px]" />
          </a>
          <nav className="ml-5 hidden items-center gap-7 text-[13px] font-semibold lg:flex">
            {['Hogar', 'Herramientas', 'Aire libre', 'Organización'].map(name => <button data-testid={`button-nav-${name.toLowerCase().replace(' ', '-')}`} key={name} onClick={() => { setCategory(name as Category); document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' }); }} className="transition-colors hover:text-[#c9362b]">{name}</button>)}
          </nav>
          <div className="relative ml-auto flex max-w-[410px] flex-1">
            <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8b8885]" />
            <input data-testid="input-search-products" type="search" value={query} onChange={event => setQuery(event.target.value)} onFocus={() => setSearchFocus(true)} onBlur={() => window.setTimeout(() => setSearchFocus(false), 140)} placeholder="¿Qué estás buscando?" className="h-11 w-full rounded-xl border border-[#ded8ce] bg-white pl-10 pr-4 text-sm outline-none transition focus:border-[#c9362b] focus:ring-4 focus:ring-[#c9362b]/10" />
            {searchFocus && query.length > 0 && <div className="absolute left-0 right-0 top-[51px] z-40 rounded-xl border border-[#ebe5dc] bg-white p-2 shadow-warm"><p className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-[#a09a92]">Buscando en el catálogo</p>{visibleProducts.slice(0, 3).map(product => <button data-testid={`suggestion-product-${product.id}`} key={product.id} onMouseDown={() => { setDetail(product); setSearchFocus(false); }} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-[#fbf3e4]"><span className="h-9 w-9 overflow-hidden rounded-md bg-[#f7f3ed]"><img src={product.image} alt="" className="h-full w-full object-cover" /></span><span className="flex-1 truncate">{product.name}</span><ChevronRight size={15} /></button>)}{visibleProducts.length === 0 && <p className="px-3 py-3 text-sm text-[#77716b]">No encontramos productos con ese nombre.</p>}</div>}
          </div>
          <button data-testid="button-help" aria-label="Ayuda" className="hidden rounded-lg p-2 text-[#5e5a56] hover:bg-[#f1ece4] md:block" onClick={() => notify('Escríbenos por WhatsApp y te ayudamos')}><CircleHelp size={21} /></button>
          <button data-testid="button-cart" aria-label={`Carrito con ${cartCount} productos`} className="relative rounded-xl p-2.5 transition hover:bg-[#f1ece4]" onClick={() => setCartOpen(true)}><ShoppingBag size={22} /><span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#c9362b] px-1 text-[10px] font-bold text-white">{cartCount}</span></button>
        </div>
        <div className="container-shop flex gap-2 overflow-x-auto border-t border-[#ebe5dc] py-2.5 lg:hidden">
          {['Todos', 'Ofertas', 'Hogar', 'Herramientas', 'Aire libre'].map(item => <button data-testid={`button-mobile-category-${item.toLowerCase().replace(' ', '-')}`} key={item} onClick={() => { setCategory(item as Category); document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' }); }} className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold ${category === item ? 'bg-[#c9362b] text-white' : 'bg-[#f1ece4] text-[#5e5a56]'}`}>{item}</button>)}
        </div>
      </header>

      {menuOpen && <div className="fixed inset-0 z-50 bg-[#26262a]/30 md:hidden" onClick={() => setMenuOpen(false)}><aside className="h-full w-[85%] max-w-[330px] bg-[#fbfaf7] p-6 shadow-warm" onClick={event => event.stopPropagation()}><div className="flex items-center justify-between border-b border-[#ebe5dc] pb-5"><span className="font-display font-bold">Explora Importadora Más</span><button data-testid="button-close-menu" onClick={() => setMenuOpen(false)}><X /></button></div><div className="space-y-1 pt-5">{['Todos', 'Ofertas', 'Hogar', 'Herramientas', 'Aire libre', 'Organización'].map(item => <button data-testid={`menu-category-${item.toLowerCase().replace(' ', '-')}`} key={item} onClick={() => { setCategory(item as Category); setMenuOpen(false); document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' }); }} className="flex w-full items-center justify-between rounded-xl px-3 py-3.5 text-left font-semibold hover:bg-[#f1ece4]">{item}<ChevronRight size={17} /></button>)}</div><div className="mt-8 rounded-xl bg-[#f8e8d6] p-4 text-sm"><MapPin size={18} className="mb-2 text-[#c9362b]" /><strong>Visítanos en Linares</strong><p className="mt-1 text-[#6d5b4e]">Freire 482, lunes a sábado.</p></div></aside></div>}

      <main id="inicio">
        <section className="texture overflow-hidden border-b border-[#eadfd3] bg-[#f8e8d6]">
          <div className="container-shop grid min-h-[510px] items-center gap-10 py-14 md:grid-cols-[1.02fr_.98fr] md:py-20">
            <div className="float-in max-w-xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#e5c5a5] bg-[#fff9ef] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[.15em] text-[#9d392e]"><span className="h-1.5 w-1.5 rounded-full bg-[#c9362b]" /> Precios de tienda local</div>
              <h1 className="font-display text-[clamp(2.65rem,7vw,5.3rem)] font-bold leading-[.96] tracking-[-.06em] text-[#29282b]">Cosas útiles.<br /><span className="text-[#c9362b]">Precios justos.</span></h1>
              <p className="mt-6 max-w-md text-base leading-relaxed text-[#665b53] md:text-lg">Importamos lo que hace más fácil tu día. Encuentra ese producto que resuelve, a un precio que sí tiene sentido.</p>
              <div className="mt-8 flex flex-wrap gap-3"><button data-testid="button-hero-shop" onClick={() => document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' })} className="group inline-flex items-center gap-3 rounded-xl bg-[#c9362b] px-5 py-3.5 text-sm font-bold text-white shadow-[0_8px_18px_rgba(201,54,43,.24)] transition hover:-translate-y-0.5 hover:bg-[#a92e26]">Ver productos <ArrowRight size={17} className="transition group-hover:translate-x-1" /></button><button data-testid="button-hero-offers" onClick={() => { setCategory('Ofertas'); document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' }); }} className="rounded-xl border border-[#d7bda5] bg-[#fff9ef] px-5 py-3.5 text-sm font-bold text-[#6d3d2f] transition hover:border-[#c9362b]">Ver ofertas</button></div>
              <div className="mt-9 flex items-center gap-5 text-xs text-[#75685f]"><span className="flex items-center gap-1.5"><ShieldCheck size={17} className="text-[#c9362b]" /> Compra segura</span><span className="flex items-center gap-1.5"><Truck size={17} className="text-[#c9362b]" /> Despacho nacional</span></div>
            </div>
            <div className="relative min-h-[300px] md:min-h-[390px]">
              <div className="absolute right-4 top-2 h-[250px] w-[250px] rounded-full bg-[#f3c248] md:right-10 md:h-[360px] md:w-[360px]" />
              <div className="absolute bottom-0 left-[8%] right-0 top-[12%] overflow-hidden rounded-[2rem] rounded-br-[7rem] border-[10px] border-[#fff8eb] shadow-warm"><img src="https://images.pexels.com/photos/1084540/pexels-photo-1084540.jpeg?auto=compress&cs=tinysrgb&w=1000" alt="Productos útiles para el hogar y aire libre" className="h-full w-full object-cover" /></div>
              <div className="pulse-soft absolute bottom-2 left-0 rounded-2xl bg-[#26262a] px-4 py-3 text-white shadow-xl"><span className="block font-display text-xl font-bold">+1.200</span><span className="text-[11px] text-[#f7dcc1]">familias atendidas</span></div>
              <div className="absolute right-[-5px] top-10 rounded-2xl bg-white px-4 py-3 shadow-card md:right-0"><span className="flex items-center gap-1 text-[#e5a31c]"><Star size={14} fill="currentColor" /> <b className="text-sm text-[#26262a]">4.8</b></span><span className="text-[11px] text-[#817b75]">opiniones reales</span></div>
            </div>
          </div>
        </section>

        <section className="border-b border-[#ebe5dc] bg-white"><div className="container-shop grid grid-cols-1 divide-y divide-[#ebe5dc] py-1 sm:grid-cols-3 sm:divide-x sm:divide-y-0"><Trust icon={<Truck />} title="Envíos a todo Chile" copy="Recibe donde estés" /><Trust icon={<MapPin />} title="Retiro en Linares" copy="Gratis en nuestra tienda" /><Trust icon={<ShieldCheck />} title="Compra con respaldo" copy="Te ayudamos de verdad" /></div></section>

        <section className="container-shop py-14 md:py-20">
          <div className="mb-7 flex items-end justify-between"><div><p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-[#c9362b]">Elige tu próxima solución</p><h2 className="font-display text-3xl font-bold tracking-[-.04em] md:text-4xl">Compra por categoría</h2></div><button data-testid="button-view-all-categories" onClick={() => { setCategory('Todos'); document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' }); }} className="hidden items-center gap-1 text-sm font-bold text-[#c9362b] sm:flex">Ver todo <ArrowRight size={15} /></button></div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">{categories.map((item, index) => <button data-testid={`card-category-${item.name.toLowerCase().replace(' ', '-')}`} key={item.name} onClick={() => { setCategory(item.name); document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' }); }} className={`group relative min-h-[155px] overflow-hidden rounded-2xl p-5 text-left transition hover:-translate-y-1 hover:shadow-warm ${index % 2 === 0 ? 'bg-[#f7e4ce]' : 'bg-[#e9eee8]'}`}><span className="font-display text-4xl font-bold text-[#c9362b]">{item.icon}</span><strong className="absolute bottom-8 left-5 block font-display text-xl tracking-[-.03em]">{item.name}</strong><span className="absolute bottom-4 left-5 text-xs text-[#716b64]">{item.copy}</span><ChevronRight size={18} className="absolute bottom-5 right-5 transition group-hover:translate-x-1" /></button>)}</div>
        </section>

        <section id="catalogo" className="scroll-mt-32 border-y border-[#ebe5dc] bg-[#f5f2ec] py-14 md:py-20">
          <div className="container-shop">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between"><div><p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-[#c9362b]">Selección Importadora Más</p><h2 className="font-display text-3xl font-bold tracking-[-.04em] md:text-4xl">{category === 'Todos' ? 'Lo que todos están llevando' : category}</h2><p className="mt-2 text-sm text-[#77716b]">{visibleProducts.length} productos para resolver tu día</p></div><div className="flex items-center gap-2"><label className="hidden text-xs font-semibold text-[#77716b] sm:block" htmlFor="sort-products">Ordenar por</label><div className="relative"><select id="sort-products" data-testid="select-sort-products" value={sort} onChange={event => setSort(event.target.value)} className="h-10 appearance-none rounded-lg border border-[#dcd5cb] bg-white py-2 pl-3 pr-9 text-sm font-semibold outline-none focus:border-[#c9362b]"><option value="featured">Recomendados</option><option value="price-low">Precio menor</option><option value="price-high">Precio mayor</option><option value="rating">Mejor evaluados</option></select><ChevronDown size={15} className="pointer-events-none absolute right-3 top-3" /></div></div></div>
            <div className="mt-7 flex gap-2 overflow-x-auto pb-1">{[{ id: 'all', label: 'Todos', icon: <SlidersHorizontal size={14} /> }, { id: 'offer', label: 'Ofertas', icon: <Flame size={14} /> }, { id: 'new', label: 'Novedades', icon: <Sparkles size={14} /> }, { id: 'stock', label: 'En stock', icon: <PackageCheck size={14} /> }].map(item => <button data-testid={`button-filter-${item.id}`} key={item.id} onClick={() => setFilter(item.id as typeof filter)} className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition ${filter === item.id ? 'border-[#c9362b] bg-[#c9362b] text-white' : 'border-[#ddd6cc] bg-white text-[#5e5a56] hover:border-[#c9362b]'}`}>{item.icon}{item.label}</button>)}</div>
            {visibleProducts.length > 0 ? <div className="mt-7 grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-x-5">{visibleProducts.map((product, index) => <ProductCard key={product.id} product={product} index={index} onAdd={addToCart} onDetail={setDetail} />)}</div> : <div className="rounded-2xl border border-dashed border-[#d8cfc4] bg-white py-20 text-center"><Search className="mx-auto mb-3 text-[#c9362b]" size={28} /><h3 className="font-display text-xl font-bold">No encontramos eso todavía</h3><p className="mt-1 text-sm text-[#77716b]">Prueba con otra palabra o mira todas nuestras soluciones.</p><button data-testid="button-clear-filters" onClick={() => { setQuery(''); setFilter('all'); setCategory('Todos'); }} className="mt-5 rounded-lg bg-[#c9362b] px-4 py-2 text-sm font-bold text-white">Limpiar búsqueda</button></div>}
          </div>
        </section>

        <section className="container-shop grid gap-8 py-14 md:grid-cols-[1.1fr_.9fr] md:py-20">
          <div className="rounded-[2rem] bg-[#26262a] p-7 text-[#fbfaf7] md:p-10"><p className="mb-4 text-xs font-bold uppercase tracking-[.18em] text-[#f6b83f]">El dato de la casa</p><h2 className="max-w-lg font-display text-3xl font-bold leading-tight tracking-[-.04em] md:text-4xl">¿Necesitas una idea para regalar?</h2><p className="mt-4 max-w-md text-sm leading-relaxed text-[#d0c9c0]">Pasa por la tienda y conversemos. Sabemos qué cosas funcionan, cuáles duran y qué puede salvarte el fin de semana.</p><button data-testid="button-store-help" onClick={() => notify('Te conectamos con nuestro equipo de Linares')} className="mt-7 inline-flex items-center gap-2 rounded-lg bg-[#f6b83f] px-4 py-3 text-sm font-bold text-[#26262a] hover:bg-[#ffd06b]">Hablar con la tienda <MessageCircle size={16} /></button></div>
          <div className="rounded-[2rem] border border-[#eadfd3] bg-[#f8e8d6] p-7 md:p-10"><div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#9d392e]">Compra tranquila</p><h2 className="mt-3 font-display text-2xl font-bold tracking-[-.04em]">Te acompañamos en cada paso.</h2></div><Heart className="text-[#c9362b]" size={25} /></div><div className="mt-7 space-y-4 text-sm text-[#665b53]"><p className="flex gap-3"><Clock3 className="shrink-0 text-[#c9362b]" size={18} /> Respuesta rápida por WhatsApp.</p><p className="flex gap-3"><PackageCheck className="shrink-0 text-[#c9362b]" size={18} /> Productos revisados antes de salir.</p><p className="flex gap-3"><MapPin className="shrink-0 text-[#c9362b]" size={18} /> Retira sin costo en Freire 482.</p></div></div>
        </section>
      </main>

      <footer className="bg-[#2f2d2c] text-[#f7f1e7]"><div className="container-shop grid gap-10 py-12 md:grid-cols-[1.5fr_1fr_1fr_1fr]"><div><div className="flex items-center gap-3"><img src="/importadora-mas-logo.jpg" alt="Importadora Más Linares" className="h-12 w-[54px] rounded-xl object-cover" /><span className="font-display text-lg font-bold">IMPORTADORA MÁS</span></div><p className="mt-5 max-w-xs text-sm leading-relaxed text-[#bcb4aa]">Productos útiles, precios honestos y atención de tienda local. Desde Linares para todo Chile.</p><div className="mt-5 flex gap-2"><button data-testid="button-social-instagram" onClick={() => notify('Instagram: @importadoramas')} className="rounded-lg border border-[#514d4a] p-2.5 hover:bg-[#3a3838]"><Instagram size={17} /></button><button data-testid="button-social-facebook" onClick={() => notify('Facebook: Importadora Más')} className="rounded-lg border border-[#514d4a] p-2.5 hover:bg-[#3a3838]"><Facebook size={17} /></button><button data-testid="button-social-whatsapp" onClick={() => notify('WhatsApp: +56 9 8765 4321')} className="rounded-lg border border-[#514d4a] p-2.5 hover:bg-[#3a3838]"><MessageCircle size={17} /></button></div></div><FooterColumn title="Tienda" links={['Todos los productos', 'Ofertas de la semana', 'Novedades', 'Más vendidos']} onClick={() => { setCategory('Todos'); document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' }); }} /><FooterColumn title="Ayuda" links={['Despachos y retiros', 'Cambios y devoluciones', 'Preguntas frecuentes', 'Contáctanos']} onClick={() => notify('Nuestro equipo está listo para ayudarte')} /><div><h3 className="font-display text-sm font-bold">Visítanos</h3><p className="mt-4 flex gap-2 text-sm text-[#bcb4aa]"><MapPin className="shrink-0 text-[#d4a44a]" size={17} /> Freire 482, Linares<br />Región del Maule</p><p className="mt-3 flex gap-2 text-sm text-[#bcb4aa]"><Clock3 className="shrink-0 text-[#d4a44a]" size={17} /> Lun–Vie 09:30–19:00<br />Sáb 10:00–14:00</p></div></div><div className="border-t border-[#413e3c]"><div className="container-shop flex flex-col gap-2 py-5 text-[11px] text-[#89827c] sm:flex-row sm:items-center sm:justify-between"><span>© 2024 Importadora Más · Hecho en Linares</span><span className="flex gap-4"><button data-testid="button-privacy" onClick={() => notify('Política de privacidad')} className="hover:text-white">Privacidad</button><button data-testid="button-terms" onClick={() => notify('Términos y condiciones')} className="hover:text-white">Términos y condiciones</button></span></div></div></footer>

      <a data-testid="link-whatsapp-floating" href="https://wa.me/56987654321" target="_blank" rel="noreferrer" className="fixed bottom-5 right-5 z-20 flex items-center gap-2 rounded-full bg-[#238b59] px-4 py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(35,139,89,.3)] transition hover:-translate-y-1"><MessageCircle size={19} /> <span className="hidden sm:inline">¿Te ayudamos?</span></a>

      {cartOpen && <CartDrawer cart={cart} subtotal={subtotal} onClose={() => setCartOpen(false)} onUpdate={updateQuantity} onRemove={removeFromCart} onCheckout={() => { setCartOpen(false); notify('Tu pedido está listo para coordinar por WhatsApp'); }} />}
      {detail && <ProductDetail product={detail} onClose={() => setDetail(null)} onAdd={() => { addToCart(detail); setDetail(null); }} />}
      {toast && <div data-testid="status-toast" className="appear fixed bottom-5 left-1/2 z-[70] -translate-x-1/2 rounded-xl bg-[#26262a] px-4 py-3 text-sm font-semibold text-white shadow-xl">{toast}</div>}
    </div>
  );
}

function Trust({ icon, title, copy }: { icon: React.ReactNode; title: string; copy: string }) {
  return <div className="flex items-center gap-3 px-2 py-4 sm:justify-center sm:px-4"><span className="text-[#c9362b]">{icon}</span><span><strong className="block text-sm">{title}</strong><small className="text-xs text-[#8a837c]">{copy}</small></span></div>;
}

function ProductCard({ product, index, onAdd, onDetail }: { product: Product; index: number; onAdd: (product: Product) => void; onDetail: (product: Product) => void }) {
  const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;
  return <article data-testid={`card-product-${product.id}`} className="float-in group" style={{ animationDelay: `${index * 55}ms` }}><div className="relative aspect-square overflow-hidden rounded-2xl bg-white shadow-card"><img src={product.image} alt={product.name} loading="lazy" className="h-full w-full object-cover mix-blend-multiply transition duration-500 group-hover:scale-105" />{product.badge && <span className={`absolute left-3 top-3 rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${product.badge === 'Oferta' ? 'bg-[#c9362b] text-white' : 'bg-[#f6b83f] text-[#26262a]'}`}>{product.badge}</span>}{discount > 0 && <span className="absolute bottom-3 left-3 rounded-md bg-white/90 px-2 py-1 text-[11px] font-bold text-[#c9362b]">-{discount}%</span>}<button data-testid={`button-detail-${product.id}`} onClick={() => onDetail(product)} className="absolute bottom-3 right-3 rounded-lg bg-white/95 px-2.5 py-2 text-[11px] font-bold text-[#403a35] opacity-0 shadow transition group-hover:opacity-100 hover:text-[#c9362b] sm:block">Ver detalle</button></div><div className="pt-3"><div className="flex items-center gap-1 text-[11px] text-[#d99a19]"><Star size={12} fill="currentColor" /><span className="font-bold">{product.rating}</span><span className="text-[#99918a]">({product.reviews})</span></div><button data-testid={`button-product-name-${product.id}`} onClick={() => onDetail(product)} className="mt-1 line-clamp-2 min-h-[40px] text-left text-sm font-semibold leading-snug hover:text-[#c9362b]">{product.name}</button><div className="mt-2 flex items-end justify-between gap-2"><div><strong data-testid={`text-price-${product.id}`} className="font-display text-lg font-bold">{money(product.price)}</strong>{product.oldPrice && <del className="ml-2 text-xs text-[#9b958e]">{money(product.oldPrice)}</del>}</div><button data-testid={`button-add-cart-${product.id}`} onClick={() => onAdd(product)} aria-label={`Agregar ${product.name}`} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#c9362b] text-white transition hover:-translate-y-0.5 hover:bg-[#a92e26]"><Plus size={18} /></button></div></div></article>;
}

function CartDrawer({ cart, subtotal, onClose, onUpdate, onRemove, onCheckout }: { cart: CartItem[]; subtotal: number; onClose: () => void; onUpdate: (id: number, delta: number) => void; onRemove: (id: number) => void; onCheckout: () => void }) {
  return <div className="fixed inset-0 z-[60] bg-[#26262a]/30" onClick={onClose}><aside data-testid="panel-cart" onClick={event => event.stopPropagation()} className="absolute right-0 top-0 flex h-full w-full max-w-[430px] flex-col bg-[#fbfaf7] shadow-2xl"><div className="flex items-center justify-between border-b border-[#ebe5dc] px-5 py-5"><div><h2 className="font-display text-xl font-bold">Tu carrito</h2><p className="mt-0.5 text-xs text-[#88817a]">{cart.length ? 'Revisa tu selección' : 'Todavía no agregas productos'}</p></div><button data-testid="button-close-cart" onClick={onClose} className="rounded-lg p-2 hover:bg-[#f1ece4]"><X size={21} /></button></div>{cart.length ? <><div className="flex-1 space-y-3 overflow-y-auto p-5">{cart.map(item => <div data-testid={`cart-item-${item.product.id}`} key={item.product.id} className="flex gap-3 rounded-xl border border-[#ebe5dc] bg-white p-3"><img src={item.product.image} alt="" className="h-20 w-20 rounded-lg object-cover mix-blend-multiply" /><div className="min-w-0 flex-1"><p className="line-clamp-2 text-sm font-semibold">{item.product.name}</p><p className="mt-1 font-display text-base font-bold text-[#c9362b]">{money(item.product.price)}</p><div className="mt-2 flex items-center justify-between"><div className="flex items-center rounded-lg border border-[#ded8ce]"><button data-testid={`button-decrease-${item.product.id}`} onClick={() => onUpdate(item.product.id, -1)} className="p-1.5"><Minus size={13} /></button><span className="w-7 text-center text-xs font-bold">{item.quantity}</span><button data-testid={`button-increase-${item.product.id}`} onClick={() => onUpdate(item.product.id, 1)} className="p-1.5"><Plus size={13} /></button></div><button data-testid={`button-remove-${item.product.id}`} onClick={() => onRemove(item.product.id)} className="text-[#9b958e] hover:text-[#c9362b]"><Trash2 size={16} /></button></div></div></div>)}</div><div className="border-t border-[#ebe5dc] bg-white p-5"><div className="flex justify-between text-sm text-[#77716b]"><span>Subtotal</span><strong data-testid="text-cart-subtotal" className="font-display text-xl text-[#26262a]">{money(subtotal)}</strong></div><p className="mt-2 text-xs text-[#8d857d]">Envío se calcula según tu comuna. Retiro en Linares sin costo.</p><button data-testid="button-cart-checkout" onClick={onCheckout} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#c9362b] py-3.5 text-sm font-bold text-white hover:bg-[#a92e26]">Coordinar pedido <MessageCircle size={17} /></button></div></> : <div className="flex flex-1 flex-col items-center justify-center p-8 text-center"><div className="mb-4 rounded-full bg-[#f8e8d6] p-5 text-[#c9362b]"><ShoppingBag size={30} /></div><h3 className="font-display text-lg font-bold">Tu carrito está esperando</h3><p className="mt-2 max-w-xs text-sm text-[#77716b]">Agrega productos y aquí podrás revisar cantidades y coordinar tu compra.</p><button data-testid="button-empty-cart-close" onClick={onClose} className="mt-6 rounded-lg bg-[#c9362b] px-4 py-2.5 text-sm font-bold text-white">Seguir mirando</button></div>}</aside></div>;
}

function ProductDetail({ product, onClose, onAdd }: { product: Product; onClose: () => void; onAdd: () => void }) {
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#26262a]/45 p-0 sm:items-center sm:p-6" onClick={onClose}><div data-testid={`dialog-product-detail-${product.id}`} onClick={event => event.stopPropagation()} className="max-h-[92dvh] w-full max-w-3xl overflow-y-auto rounded-t-[2rem] bg-[#fbfaf7] shadow-2xl sm:rounded-[2rem]"><div className="grid md:grid-cols-2"><div className="relative min-h-[285px] bg-white"><img src={product.image} alt={product.name} className="h-full min-h-[285px] w-full object-cover mix-blend-multiply" /><button data-testid="button-close-detail" onClick={onClose} className="absolute right-4 top-4 rounded-full bg-white/90 p-2 shadow"><X size={18} /></button></div><div className="p-6 md:p-9"><div className="flex items-center gap-1 text-sm text-[#d99a19]"><Star size={15} fill="currentColor" /><b>{product.rating}</b><span className="text-[#88817a]">· {product.reviews} opiniones</span></div><h2 className="mt-3 font-display text-2xl font-bold leading-tight tracking-[-.03em]">{product.name}</h2><div className="mt-4 flex items-center gap-3"><strong className="font-display text-2xl text-[#c9362b]">{money(product.price)}</strong>{product.oldPrice && <del className="text-sm text-[#9b958e]">{money(product.oldPrice)}</del>}</div><p className="mt-5 text-sm leading-relaxed text-[#6d6862]">{product.description}</p><ul className="mt-5 space-y-2 text-sm text-[#4c4945]">{product.features.map(feature => <li key={feature} className="flex gap-2"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#c9362b]" />{feature}</li>)}</ul><div className="mt-7 flex items-center gap-2 text-xs text-[#6d6862]"><PackageCheck size={16} className="text-[#c9362b]" /> {product.stock} unidades disponibles</div><button data-testid={`button-detail-add-${product.id}`} onClick={onAdd} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#c9362b] py-3.5 text-sm font-bold text-white hover:bg-[#a92e26]">Agregar al carrito <ShoppingBag size={17} /></button></div></div></div></div>;
}

function FooterColumn({ title, links, onClick }: { title: string; links: string[]; onClick: () => void }) {
  return <div><h3 className="font-display text-sm font-bold">{title}</h3><div className="mt-4 space-y-3">{links.map(link => <button data-testid={`footer-link-${link.toLowerCase().replaceAll(' ', '-')}`} key={link} onClick={onClick} className="block text-left text-sm text-[#bcb4aa] hover:text-white">{link}</button>)}</div></div>;
}

function Router() {
  return <ErrorBoundary><Switch><Route path="/" component={AppShell} /><Route component={NotFound} /></Switch></ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;