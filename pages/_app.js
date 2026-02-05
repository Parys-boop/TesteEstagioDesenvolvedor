import '../styles/variables.css';
import '../styles/globals.css';

/**
 * Custom App Component
 * Wraps all pages with global styles and providers
 *
 * Componente App Customizado
 * Envolve todas as páginas com estilos globais e providers
 *
 * @param {Object} props - Next.js app props
 * @param {React.Component} props.Component - The active page component / O componente da página ativa
 * @param {Object} props.pageProps - Props passed to the page / Props passadas para a página
 */
function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;