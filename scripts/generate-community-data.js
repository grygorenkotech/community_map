import fs from 'fs';
import path from 'path';

// Отримуємо дані з змінної середовища
const communityData = process.env.COMMUNITY_DATA;

if (!communityData) {
  console.error('COMMUNITY_DATA environment variable is not set');
  process.exit(1);
}

try {
  // Створюємо директорію якщо її немає
  const dir = path.join(process.cwd(), 'src', 'data');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Записуємо дані у файл
  fs.writeFileSync(
    path.join(dir, 'community.json'),
    communityData
  );

  console.log('Successfully generated community.json');
} catch (error) {
  console.error('Error generating community.json:', error);
  process.exit(1);
} 