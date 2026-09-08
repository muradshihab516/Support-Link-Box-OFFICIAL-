import { MovieItem } from '../types';

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
