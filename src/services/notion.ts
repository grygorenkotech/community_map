import { Client } from '@notionhq/client';

const notion = new Client({
  auth: import.meta.env.VITE_NOTION_API_KEY,
});

const DATABASE_ID = import.meta.env.VITE_NOTION_DATABASE_ID;

export interface NotionMember {
  name: string;
  location: string;
  telegram: string;
  badge?: string;
  status: 'Active' | 'Inactive';
}

export const getCommunityMembers = async (): Promise<NotionMember[]> => {
  try {
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      filter: {
        property: 'Status',
        select: {
          equals: 'Active'
        }
      }
    });

    return response.results.map((page: any) => ({
      name: page.properties.Name.title[0]?.plain_text || '',
      location: page.properties.Location.rich_text[0]?.plain_text || '',
      telegram: page.properties.Telegram.rich_text[0]?.plain_text || '',
      badge: page.properties.Badge.select?.name,
      status: page.properties.Status.select?.name as 'Active' | 'Inactive'
    }));
  } catch (error) {
    console.error('Error fetching from Notion:', error);
    return [];
  }
};

export const addCommunityMember = async (member: Omit<NotionMember, 'status'>) => {
  try {
    await notion.pages.create({
      parent: { database_id: DATABASE_ID },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: member.name
              }
            }
          ]
        },
        Location: {
          rich_text: [
            {
              text: {
                content: member.location
              }
            }
          ]
        },
        Telegram: {
          rich_text: [
            {
              text: {
                content: member.telegram
              }
            }
          ]
        },
        Badge: {
          select: member.badge ? {
            name: member.badge
          } : null
        },
        Status: {
          select: {
            name: 'Active'
          }
        }
      }
    });
  } catch (error) {
    console.error('Error adding member to Notion:', error);
    throw error;
  }
}; 