
import { v4 as uuidv4 } from 'uuid';

// Local storage keys
const COMMUNITIES_DATA_KEY = 'communities_data';
const JOINED_COMMUNITIES_KEY = 'joinedCommunities';

// Default university logos and cover images (for demo purposes)
const DEFAULT_LOGOS = [
  '/logos/university-logo-1.png',
  '/logos/university-logo-2.png',
  '/logos/university-logo-3.png',
  '/logos/university-logo-4.png',
];

const DEFAULT_COVERS = [
  '/covers/university-cover-1.jpg',
  '/covers/university-cover-2.jpg',
  '/covers/university-cover-3.jpg',
  '/covers/university-cover-4.jpg',
];

// Initialize mock data if nothing exists
export const initializeMockData = () => {
  const existingData = localStorage.getItem(COMMUNITIES_DATA_KEY);
  if (!existingData) {
    const mockCommunityData = {
      indiana: {
        id: 'indiana',
        name: 'IndianaUniversity',
        description: 'The official community for Indiana University students, alumni, and staff. Discuss campus life, academics, events, and more.',
        members: 15243,
        online: 243,
        logo: DEFAULT_LOGOS[0],
        coverImage: DEFAULT_COVERS[0],
        createdAt: 'Sep 2018',
        pinnedPosts: [
          {
            id: 'pinned1',
            title: 'Everything You Need to Know: Costs, Fees, and Visa Steps for IU',
            content: 'This is a comprehensive guide to help international students understand the costs associated with studying at Indiana University and navigate the visa process successfully.',
            upvotes: 852,
            comments: 156,
            community: { id: 'indiana', name: 'IndianaUniversity' },
            author: { username: 'IU_Admin', avatar: '' },
            createdAt: '3 months ago',
            isPinned: true,
            commentsList: [],
            tags: ['visa', 'finance']
          }
        ],
        posts: [
          {
            id: '1',
            title: 'Just got my F-1 visa for Indiana University—any tips for the interview?',
            content: 'I finally got my interview scheduled for next week, but I\'m nervous. What questions should I prepare for? What documents should I bring beyond the basics?',
            upvotes: 125,
            comments: 28,
            community: { id: 'indiana', name: 'IndianaUniversity' },
            author: { username: 'VisaWarrior', avatar: '' },
            createdAt: '2 hours ago',
            commentsList: [
              {
                id: 'c1',
                author: { username: 'GlobalExplorer', avatar: '' },
                content: 'Congrats on getting the interview! I went through this last year. Be confident but polite. They mainly want to confirm that you\'re genuinely going to study, not looking to immigrate permanently.',
                upvotes: 42,
                createdAt: '1 hour ago',
                replies: []
              }
            ],
            tags: ['visa']
          },
          {
            id: '3',
            title: 'Is $800/month for a room near IU campus a good deal?',
            content: 'Found a room in a 3-bedroom apartment about 10 minutes walk from campus for $800/month, utilities included. Is this reasonable or should I keep looking?',
            upvotes: 94,
            comments: 32,
            community: { id: 'indiana', name: 'IndianaUniversity' },
            author: { username: 'HoosierDreamer', avatar: '' },
            createdAt: '1 day ago',
            commentsList: [],
            tags: ['housing']
          }
        ]
      },
      asu: {
        id: 'asu',
        name: 'ArizonaStateUniversity',
        description: 'Connect with fellow Sun Devils to share experiences, ask questions, and stay updated on campus news.',
        members: 24567,
        online: 342,
        logo: DEFAULT_LOGOS[1],
        coverImage: DEFAULT_COVERS[1],
        createdAt: 'Nov 2017',
        pinnedPosts: [],
        posts: [
          {
            id: '2',
            title: 'Found a $50 couch near ASU—who wants it?',
            content: 'Moving out and selling this barely used couch for $50. Perfect for a dorm room or small apartment. Located near the campus, pickup only. First come, first served!',
            upvotes: 76,
            comments: 15,
            community: { id: 'asu', name: 'ArizonaStateUniversity' },
            author: { username: 'SunDevilGrad', avatar: '' },
            createdAt: '5 hours ago',
            commentsList: [],
            tags: ['housing']
          }
        ]
      },
      ucla: {
        id: 'ucla',
        name: 'UCLA',
        description: 'University of California, Los Angeles community. For discussions about academics, campus life, and Bruin pride.',
        members: 31892,
        online: 523,
        logo: DEFAULT_LOGOS[2],
        coverImage: DEFAULT_COVERS[2],
        createdAt: 'Jan 2016',
        pinnedPosts: [],
        posts: [
          {
            id: '4',
            title: 'Anyone taking CS 101 at UCLA this semester?',
            content: 'Looking to form a study group for CS 101. The professor is known to be tough, and I think it would be helpful if we could meet weekly to go over problem sets.',
            upvotes: 58,
            comments: 23,
            community: { id: 'ucla', name: 'UCLA' },
            author: { username: 'BruinCoder', avatar: '' },
            createdAt: '4 hours ago',
            commentsList: [],
            tags: ['academics']
          }
        ]
      },
      nyu: {
        id: 'nyu',
        name: 'NYU',
        description: 'New York University\'s global community. Share experiences and navigate life in the heart of NYC.',
        members: 19654,
        online: 287,
        logo: DEFAULT_LOGOS[3],
        coverImage: DEFAULT_COVERS[3],
        createdAt: 'Mar 2017',
        pinnedPosts: [],
        posts: [
          {
            id: '5',
            title: 'Best coffee shops to study near NYU?',
            content: 'I\'m looking for quiet coffee shops with good WiFi near campus. Bonus points if they have student discounts or don\'t mind if you stay for a few hours.',
            upvotes: 112,
            comments: 47,
            community: { id: 'nyu', name: 'NYU' },
            author: { username: 'NYUGrad2023', avatar: '' },
            createdAt: '3 hours ago',
            commentsList: [],
            tags: ['campus']
          }
        ]
      }
    };
    
    localStorage.setItem(COMMUNITIES_DATA_KEY, JSON.stringify(mockCommunityData));
  }
};

// Get all communities
export const getAllCommunities = async () => {
  try {
    // Initialize mock data if needed
    initializeMockData();
    
    const communitiesData = JSON.parse(localStorage.getItem(COMMUNITIES_DATA_KEY) || '{}');
    return communitiesData;
  } catch (error) {
    console.error('Error getting communities:', error);
    return {};
  }
};

// Get a specific community by ID
export const getCommunityData = async (communityId?: string) => {
  try {
    if (!communityId) return null;
    
    // Initialize mock data if needed
    initializeMockData();
    
    const communitiesData = JSON.parse(localStorage.getItem(COMMUNITIES_DATA_KEY) || '{}');
    return communitiesData[communityId] || null;
  } catch (error) {
    console.error(`Error getting community ${communityId}:`, error);
    return null;
  }
};

// Update a community's data
export const updateCommunityData = async (communityId: string, data: any) => {
  try {
    // Initialize mock data if needed
    initializeMockData();
    
    const communitiesData = JSON.parse(localStorage.getItem(COMMUNITIES_DATA_KEY) || '{}');
    communitiesData[communityId] = data;
    
    localStorage.setItem(COMMUNITIES_DATA_KEY, JSON.stringify(communitiesData));
    return data;
  } catch (error) {
    console.error(`Error updating community ${communityId}:`, error);
    throw error;
  }
};

// Join or leave a community
export const joinCommunity = async (communityId: string) => {
  try {
    // Get current joined communities
    const joinedCommunities = JSON.parse(localStorage.getItem(JOINED_COMMUNITIES_KEY) || '[]');
    
    // Check if already joined
    const isJoined = joinedCommunities.includes(communityId);
    
    if (isJoined) {
      // Leave community
      const updatedJoined = joinedCommunities.filter((id: string) => id !== communityId);
      localStorage.setItem(JOINED_COMMUNITIES_KEY, JSON.stringify(updatedJoined));
      
      // Update community members count
      const community = await getCommunityData(communityId);
      if (community) {
        community.members = Math.max(0, community.members - 1);
        await updateCommunityData(communityId, community);
      }
      
      return { joined: false };
    } else {
      // Join community
      joinedCommunities.push(communityId);
      localStorage.setItem(JOINED_COMMUNITIES_KEY, JSON.stringify(joinedCommunities));
      
      // Update community members count
      const community = await getCommunityData(communityId);
      if (community) {
        community.members += 1;
        await updateCommunityData(communityId, community);
      }
      
      return { joined: true };
    }
  } catch (error) {
    console.error(`Error joining/leaving community ${communityId}:`, error);
    throw error;
  }
};

// Create a new community
export const createCommunity = async (name: string, description: string, logo?: string, coverImage?: string) => {
  try {
    // Generate a unique ID for the community (simplified version)
    const id = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // Check if community already exists
    const existingCommunity = await getCommunityData(id);
    if (existingCommunity) {
      throw new Error('A community with this name already exists');
    }
    
    // Assign default images if none provided
    const communityLogo = logo || DEFAULT_LOGOS[Math.floor(Math.random() * DEFAULT_LOGOS.length)];
    const communityCover = coverImage || DEFAULT_COVERS[Math.floor(Math.random() * DEFAULT_COVERS.length)];
    
    // Create new community
    const newCommunity = {
      id,
      name,
      description,
      members: 1, // Creator is first member
      online: 1,
      logo: communityLogo,
      coverImage: communityCover,
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      pinnedPosts: [],
      posts: []
    };
    
    // Save new community
    await updateCommunityData(id, newCommunity);
    
    // Auto-join the creator to this community
    await joinCommunity(id);
    
    return newCommunity;
  } catch (error) {
    console.error('Error creating community:', error);
    throw error;
  }
};

// Get community tags
export const getCommunityTags = async (communityId: string) => {
  try {
    const community = await getCommunityData(communityId);
    if (!community) return [];
    
    // Extract tags from posts
    const allTags = new Set<string>();
    
    // From regular posts
    if (community.posts) {
      community.posts.forEach((post: any) => {
        if (post.tags) {
          post.tags.forEach((tag: string) => allTags.add(tag));
        }
      });
    }
    
    // From pinned posts
    if (community.pinnedPosts) {
      community.pinnedPosts.forEach((post: any) => {
        if (post.tags) {
          post.tags.forEach((tag: string) => allTags.add(tag));
        }
      });
    }
    
    return Array.from(allTags);
  } catch (error) {
    console.error(`Error getting community tags ${communityId}:`, error);
    return [];
  }
};

// Check if user has joined a community
export const hasJoinedCommunity = async (communityId: string) => {
  try {
    const joinedCommunities = JSON.parse(localStorage.getItem(JOINED_COMMUNITIES_KEY) || '[]');
    return joinedCommunities.includes(communityId);
  } catch (error) {
    console.error(`Error checking joined status for ${communityId}:`, error);
    return false;
  }
};
