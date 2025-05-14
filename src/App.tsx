import { useState } from 'react'
import { ThemeProvider, CssBaseline, AppBar, Toolbar, Typography, IconButton, Box } from '@mui/material'
import { Brightness4, Brightness7 } from '@mui/icons-material'
import { lightTheme, darkTheme } from './theme'
import { CommunityMap } from './components/CommunityMap'

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false)

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Community Map
            </Typography>
            <IconButton color="inherit" onClick={toggleTheme}>
              {isDarkMode ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Toolbar>
        </AppBar>
        <Box sx={{ flex: 1, width: '100%' }}>
          <CommunityMap />
        </Box>
      </Box>
    </ThemeProvider>
  )
}

export default App
