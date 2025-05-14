# Community Map

Interactive map showing the distribution of community members across different locations.

## Development Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Add your Mapbox access token to `.env`:
   ```
   VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
   ```
5. Create a `src/data/community.json` file based on `src/data/example.json`
6. Start the development server:
   ```bash
   npm run dev
   ```

## Security Notes

- Never commit `.env` file or any files containing sensitive data
- Keep your Mapbox token secure
- The `community.json` file is excluded from git tracking
- Use `example.json` as a template for the data structure

## Deployment

The project is configured for automatic deployment to GitHub Pages. When you push to the `main` branch, the site will be automatically built and deployed.

### Manual Deployment

1. Build the project:
   ```bash
   npm run build
   ```
2. The built files will be in the `dist` directory

## Embedding in Notion

To embed the map in a Notion page:

1. Deploy the project to GitHub Pages
2. In your Notion page, add an embed block
3. Use the following URL format:
   ```
   https://[your-github-username].github.io/community_map/
   ```

## Data Structure

The community data is stored in `src/data/community.json`. Each entry should follow this structure:

```json
{
  "name": "User Name",
  "location": "City, Country",
  "telegram": "@username",
  "badge": "Role" // optional
}
```

## Features

- Interactive map using Mapbox
- Dark/Light theme support
- Responsive design
- Member information popups
- Easy to update community data

## Technologies Used

- React
- TypeScript
- Mapbox GL JS
- Material-UI
- Vite
