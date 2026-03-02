import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  ProfileData, 
  PostData, 
  DirectMessageData, 
  NotificationData,
  NotificationType
} from '@vco/vco-schemas';
import { MockSocialService } from '@/lib/MockSocialService';
import { FeedService } from '@/lib/FeedService';
import { E2EEService } from '@/lib/E2EEService';
import { ProfileService } from '@/lib/ProfileService';

interface SocialContextType {
  profile: ProfileData | null;
  feed: { cid: Uint8Array, data: PostData }[];
  messages: { channelCid: Uint8Array, lastMessage: DirectMessageData, unread: number }[];
  notifications: NotificationData[];
  isLoading: boolean;
  
  // Actions
  createPost: (content: string, mediaFiles?: File[]) => Promise<void>;
  sendDM: (recipientProfile: ProfileData, content: string) => Promise<void>;
  updateProfile: (data: Partial<ProfileData>) => Promise<void>;
  markNotificationAsRead: (cid: Uint8Array) => void;
}

const SocialContext = createContext<SocialContextType | undefined>(undefined);

export function SocialProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [feed, setFeed] = useState<{ cid: Uint8Array, data: PostData }[]>([]);
  const [messages, setMessages] = useState<{ channelCid: Uint8Array, lastMessage: DirectMessageData, unread: number }[]>([]);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initial bootstrap simulation
    const bootstrap = async () => {
      setIsLoading(true);
      // Simulate network delay
      await new Promise(r => setTimeout(r, 1000));
      
      setProfile(MockSocialService.getMockProfile());
      setFeed(MockSocialService.getMockFeed());
      setMessages([]);
      setNotifications([]);
      setIsLoading(false);
    };

    bootstrap();
  }, []);

  const createPost = async (content: string, _mediaFiles?: File[]) => {
    const encoded = await FeedService.publishPost(content);
    // In a real app, we'd wait for a CID from the node. Mocking here.
    const mockCid = new Uint8Array(32).fill(Math.random() * 255);
    const postData = await import('@vco/vco-schemas').then(m => m.decodePost(encoded));
    
    setFeed([{ cid: mockCid, data: postData }, ...feed]);
  };

  const sendDM = async (recipientProfile: ProfileData, content: string) => {
    if (!recipientProfile.encryptionPubkey) {
      throw new Error("Recipient does not have an encryption key.");
    }

    const { ephemeralPubkey, nonce, encryptedPayload } = await E2EEService.encryptMessage(
      recipientProfile.encryptionPubkey,
      content
    );

    console.log("DM Encrypted:", { ephemeralPubkey, nonce, encryptedPayload });
    // In a real app, publish the DM manifest to the network.
  };

  const updateProfile = async (data: Partial<ProfileData>) => {
    if (profile) {
      setProfile({ ...profile, ...data });
    }
  };

  const markNotificationAsRead = (_cid: Uint8Array) => {
    // Filter out or update status
  };

  return (
    <SocialContext.Provider value={{
      profile,
      feed,
      messages,
      notifications,
      isLoading,
      createPost,
      sendDM,
      updateProfile,
      markNotificationAsRead
    }}>
      {children}
    </SocialContext.Provider>
  );
}

export function useSocial() {
  const context = useContext(SocialContext);
  if (!context) throw new Error("useSocial must be used within a SocialProvider");
  return context;
}
