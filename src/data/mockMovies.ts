import { MovieItem, MovieRequestItem } from '../types';

export const generateRandomToken = (length: number = 8): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  let token = '';
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
};

export const INITIAL_MOVIES: MovieItem[] = [
  {
    id: 'mov_oppenheimer_2023',
    title: 'Oppenheimer (2023)',
    thumbnail: 'https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=600&auto=format&fit=crop&q=80',
    description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.',
    genre: ['Biography', 'Drama', 'History'],
    releaseYear: 2023,
    duration: '3h 00m',
    language: 'English (Dual Audio / Sub BD)',
    rating: 8.9,
    isFeatured: true,
    status: 'active',
    adSettings: {
      enableTimerGateway: true,
      gatewayTimerSeconds: 4,
      sponsorNote: 'Support Link Box Community Movie Hub'
    },
    links: [
      {
        id: 'lnk_opp_480',
        quality: '480p SD',
        serverName: 'Pixeldrain',
        destinationUrl: 'https://pixeldrain.com/u/sample_opp_480',
        downloadToken: '7Kx92LmQ',
        fileSize: '520 MB',
        status: 'active',
        clickCount: 142,
        createdAt: '2026-03-01T10:00:00Z'
      },
      {
        id: 'lnk_opp_720',
        quality: '720p HD',
        serverName: 'GDFlex Fast',
        destinationUrl: 'https://gdflex.xyz/file/oppenheimer-720p-webdl',
        downloadToken: '3Nx91VwB',
        fileSize: '1.2 GB',
        status: 'active',
        clickCount: 384,
        createdAt: '2026-03-01T10:00:00Z'
      },
      {
        id: 'lnk_opp_1080',
        quality: '1080p FHD 10bit',
        serverName: 'GDFile Cloud',
        destinationUrl: 'https://gdfile.site/d/oppenheimer-1080p-bluray',
        downloadToken: '9Pq44ZkM',
        fileSize: '2.8 GB',
        status: 'active',
        clickCount: 512,
        createdAt: '2026-03-01T10:00:00Z'
      }
    ],
    totalViews: 1420,
    totalDownloads: 1038,
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-03-01T10:00:00Z'
  },
  {
    id: 'mov_interstellar_2014',
    title: 'Interstellar (2014)',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    description: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.',
    genre: ['Sci-Fi', 'Adventure', 'Drama'],
    releaseYear: 2014,
    duration: '2h 49m',
    language: 'English & Bangla Dubbed',
    rating: 8.7,
    isFeatured: true,
    status: 'active',
    adSettings: {
      enableTimerGateway: true,
      gatewayTimerSeconds: 3,
      sponsorNote: 'Fast High-Speed Mirror Link'
    },
    links: [
      {
        id: 'lnk_inte_720',
        quality: '720p HD',
        serverName: 'Pixeldrain',
        destinationUrl: 'https://pixeldrain.com/u/interstellar_720p',
        downloadToken: '5Mt88LpX',
        fileSize: '1.4 GB',
        status: 'active',
        clickCount: 290,
        createdAt: '2026-03-02T12:00:00Z'
      },
      {
        id: 'lnk_inte_1080',
        quality: '1080p FHD 60FPS',
        serverName: 'GDFile Cloud',
        destinationUrl: 'https://gdfile.site/d/interstellar_1080p_remux',
        downloadToken: '2Rt19JqW',
        fileSize: '3.1 GB',
        status: 'active',
        clickCount: 470,
        createdAt: '2026-03-02T12:00:00Z'
      },
      {
        id: 'lnk_inte_4k',
        quality: '4K UHD HDR',
        serverName: 'GDFlex Fast',
        destinationUrl: 'https://gdflex.xyz/file/interstellar-4k-uhd',
        downloadToken: '6Wy77AcZ',
        fileSize: '8.4 GB',
        status: 'active',
        clickCount: 180,
        createdAt: '2026-03-02T12:00:00Z'
      }
    ],
    totalViews: 980,
    totalDownloads: 940,
    createdAt: '2026-03-02T12:00:00Z',
    updatedAt: '2026-03-02T12:00:00Z'
  },
  {
    id: 'mov_hawa_2022',
    title: 'Hawa (হাওয়া) 2022',
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
    description: 'A deep-sea fishing trawler crew navigates superstition, human greed, and mystery when an enigmatic young woman is caught in their fishing net in the middle of the sea.',
    genre: ['Mystery', 'Drama', 'Thriller', 'Bangla'],
    releaseYear: 2022,
    duration: '2h 11m',
    language: 'Bangla (Original)',
    rating: 8.1,
    isFeatured: true,
    status: 'active',
    adSettings: {
      enableTimerGateway: true,
      gatewayTimerSeconds: 4
    },
    links: [
      {
        id: 'lnk_hawa_480',
        quality: '480p SD',
        serverName: 'Pixeldrain',
        destinationUrl: 'https://pixeldrain.com/u/hawa_bangla_480p',
        downloadToken: '4Ab88KzD',
        fileSize: '410 MB',
        status: 'active',
        clickCount: 310,
        createdAt: '2026-03-03T15:00:00Z'
      },
      {
        id: 'lnk_hawa_720',
        quality: '720p HD Web-DL',
        serverName: 'GDFlex Fast',
        destinationUrl: 'https://gdflex.xyz/file/hawa-2022-720p-webdl',
        downloadToken: '8Kp44LmT',
        fileSize: '950 MB',
        status: 'active',
        clickCount: 620,
        createdAt: '2026-03-03T15:00:00Z'
      },
      {
        id: 'lnk_hawa_1080',
        quality: '1080p Full HD',
        serverName: 'GDFile Cloud',
        destinationUrl: 'https://gdfile.site/d/hawa-2022-1080p',
        downloadToken: '1Xz99VbQ',
        fileSize: '2.1 GB',
        status: 'active',
        clickCount: 840,
        createdAt: '2026-03-03T15:00:00Z'
      }
    ],
    totalViews: 2150,
    totalDownloads: 1770,
    createdAt: '2026-03-03T15:00:00Z',
    updatedAt: '2026-03-03T15:00:00Z'
  },
  {
    id: 'mov_dune2_2024',
    title: 'Dune: Part Two (2024)',
    thumbnail: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
    description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family, facing a choice between love and the fate of the universe.',
    genre: ['Sci-Fi', 'Adventure', 'Action'],
    releaseYear: 2024,
    duration: '2h 46m',
    language: 'English (Dual Audio / Bangla Sub)',
    rating: 8.6,
    isFeatured: false,
    status: 'active',
    adSettings: {
      enableTimerGateway: true,
      gatewayTimerSeconds: 5
    },
    links: [
      {
        id: 'lnk_dune_720',
        quality: '720p HD',
        serverName: 'Pixeldrain',
        destinationUrl: 'https://pixeldrain.com/u/dune_part2_720p',
        downloadToken: '9Ty33KxL',
        fileSize: '1.3 GB',
        status: 'active',
        clickCount: 195,
        createdAt: '2026-03-04T08:00:00Z'
      },
      {
        id: 'lnk_dune_1080',
        quality: '1080p IMAX Web-DL',
        serverName: 'GDFlex Fast',
        destinationUrl: 'https://gdflex.xyz/file/dune-part2-1080p-imax',
        downloadToken: '3Fk77WpZ',
        fileSize: '2.9 GB',
        status: 'active',
        clickCount: 420,
        createdAt: '2026-03-04T08:00:00Z'
      }
    ],
    totalViews: 810,
    totalDownloads: 615,
    createdAt: '2026-03-04T08:00:00Z',
    updatedAt: '2026-03-04T08:00:00Z'
  }
];

export const INITIAL_MOVIE_REQUESTS: MovieRequestItem[] = [
  {
    id: 'req_deadpool_wolverine',
    title: 'Deadpool & Wolverine',
    year: 2024,
    language: 'English (Dual Audio / Bangla Sub)',
    preferredQuality: '1080p FHD',
    imdbOrRefUrl: 'https://www.imdb.com/title/tt6263850/',
    notes: 'মার্ভেলের নতুন ডেডপুল ও উলভারিন মুভিটি ১০৮০পি বা ৭২০পিতে প্রয়োজন। বাংলা সাবটাইটেল থাকলে ভালো হয়।',
    requestedByUserId: 'user_tanzim',
    requestedByName: 'Tanzimul Islam',
    requestedByUsername: 'tanzim_islam',
    requestedByAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    status: 'available',
    upvotes: ['user_tanzim', 'user_emon', 'user_sakib', 'user_rakib', 'user_salman'],
    adminReply: '✓ মুভিটি হাই-স্পিড ক্লাউড সার্ভারে আপলোড করা হয়েছে! আমাদের মুভি বক্সের Oppenheimer বা ক্লাউড ড্রাইভ সেকশনে পেয়ে যাবেন।',
    fulfilledMovieId: 'mov_oppenheimer_2023',
    downloadLink: 'https://gdflex.xyz/file/sample-movie-link',
    createdAt: '2026-08-25T14:30:00Z',
    createdAtTimestamp: 1787668200000
  },
  {
    id: 'req_stree_2',
    title: 'Stree 2: Sarkate Ka Aatank',
    year: 2024,
    language: 'Hindi (Original Clean Audio)',
    preferredQuality: '720p HD',
    imdbOrRefUrl: 'https://www.imdb.com/title/tt27441998/',
    notes: 'স্ত্রী ২ মুভির ক্লিয়ার থিয়েটার বা ওটিটি প্রিন্ট চাই ভাইয়া।',
    requestedByUserId: 'user_rakib',
    requestedByName: 'Rakibul Hasan',
    requestedByUsername: 'rakib_hasan',
    requestedByAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
    status: 'processing',
    upvotes: ['user_rakib', 'user_emon', 'user_salman', 'user_farhan'],
    adminReply: 'আমরা ক্লিয়ার ওয়েব-ডিএল প্রিন্টের মিরর লিংক প্রসেস করছি। আগামী ২৪ ঘণ্টার মধ্যে যুক্ত হবে!',
    createdAt: '2026-08-26T18:15:00Z',
    createdAtTimestamp: 1787768100000
  },
  {
    id: 'req_toofan_shakib',
    title: 'তুফান (Toofan)',
    year: 2024,
    language: 'বাংলা (Bangla)',
    preferredQuality: '1080p Web-DL',
    imdbOrRefUrl: 'https://www.imdb.com/title/tt30419266/',
    notes: 'শাকিব খানের তুফান মুভির ফুল এইচডি প্রিন্ট কি পাওয়া যাবে?',
    requestedByUserId: 'user_emon',
    requestedByName: 'Md Emon',
    requestedByUsername: 'emon_admin',
    requestedByAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    status: 'available',
    upvotes: ['user_emon', 'user_tanzim', 'user_rakib', 'user_sakib'],
    adminReply: 'তুফান মুভির হোইচোই ওয়েব-ডিএল কপি ক্লাউড স্টোরেজে রেডি রয়েছে। ডাউনলোড করুন!',
    downloadLink: 'https://pixeldrain.com/u/sample_toofan_1080p',
    createdAt: '2026-08-27T09:40:00Z',
    createdAtTimestamp: 1787823600000
  },
  {
    id: 'req_kalki_2898',
    title: 'Kalki 2898 AD',
    year: 2024,
    language: 'Hindi / South (Dual Audio)',
    preferredQuality: '1080p FHD',
    imdbOrRefUrl: 'https://www.imdb.com/title/tt12735488/',
    notes: 'প্রভাস ও অমিতাভ বচ্চনের কালকি মুভির ফুল এইচডি ডুয়েলে অডিও প্রিন্ট চাই।',
    requestedByUserId: 'user_sakib',
    requestedByName: 'Sakib All Hasan',
    requestedByUsername: 'sakib_hasan',
    requestedByAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    status: 'pending',
    upvotes: ['user_sakib', 'user_tanzim'],
    createdAt: '2026-08-28T11:20:00Z',
    createdAtTimestamp: 1787916000000
  }
];

