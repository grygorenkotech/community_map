import { ThemeProvider, CssBaseline, Box } from '@mui/material'
import { CommunityMap } from './components/CommunityMap'
import { theme } from './theme'
import './App.css'

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          height: '100vh',
          width: '100vw',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        <CommunityMap />
      </Box>
    </ThemeProvider>
  )
}

export default App
