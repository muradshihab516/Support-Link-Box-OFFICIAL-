import React from 'react';
import { PlaylistSupportSession } from './PlaylistSupportSession';

export interface YouTubeStyleSupportSessionProps {
  initialLinkId?: string;
  onClose?: () => void;
}

export const YouTubeStyleSupportSession: React.FC<YouTubeStyleSupportSessionProps> = (props) => {
  return <PlaylistSupportSession {...props} />;
};

export default PlaylistSupportSession;
