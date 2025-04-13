'use client';

import { toasterExpandAtom, toasterPositionAtom } from './atoms';
import Show from './home.mdx';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import MuiLink from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useAtom } from 'jotai';
import { Toaster, toaster } from 'material-ui-toaster';
import Link from 'next/link';

export default function Home() {
  const [position] = useAtom(toasterPositionAtom);
  const [expand] = useAtom(toasterExpandAtom);

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 4,
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <Toaster position={position} expand={expand} />

        <Paper
          elevation={0}
          sx={{
            p: 4,
            width: '100%',
          }}
        >
          <Typography
            component="h1"
            gutterBottom
            sx={{ fontSize: { xs: '2rem', md: '3rem' }, fontWeight: 'bold' }}
          >
            Material UI Toaster
          </Typography>

          <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 4 }}>
            Toast Component Based on Material UI
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, mb: 4, justifyContent: 'center' }}>
            <Button
              variant="contained"
              onClick={() => toaster.toast({ message: 'This is a Toast notification!' })}
              sx={{
                borderRadius: '8px',
                padding: '10px 24px',
                textTransform: 'none',
                fontWeight: 'medium',
                fontSize: '1rem',
              }}
            >
              Show Toast
            </Button>

            <Button
              variant="outlined"
              component={Link}
              href="https://github.com/wh5938316/material-ui-toaster"
              target="_blank"
              sx={{
                borderRadius: '8px',
                padding: '10px 24px',
                textTransform: 'none',
                fontWeight: 'medium',
                fontSize: '1rem',
              }}
            >
              GitHub
            </Button>
          </Box>

          <Link href="/docs" passHref>
            <MuiLink variant="body1" component="span" color="text.secondary">
              Documentation
            </MuiLink>
          </Link>
        </Paper>
      </Box>

      <Show />
    </Container>
  );
}
