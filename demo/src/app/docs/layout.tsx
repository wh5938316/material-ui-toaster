import { Footer, Layout, Navbar } from 'nextra-theme-docs';
import { getPageMap } from 'nextra/page-map';

const navbar = (
  <Navbar
    logo={<b>Material UI Toaster</b>}
    // ... Your additional navbar options
  />
);
const footer = <Footer>MIT {new Date().getFullYear()} © Nextra.</Footer>;

export default async function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <Layout
      navbar={navbar}
      pageMap={await getPageMap()}
      sidebar={{ defaultMenuCollapseLevel: 1 }}
      docsRepositoryBase="https://github.com/wh5938316/material-ui-toaster"
      footer={footer}
    >
      {children}
    </Layout>
  );
}
