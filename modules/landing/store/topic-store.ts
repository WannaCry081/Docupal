import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TopicStatus = "verifying" | "verified" | "not-found";

export interface Topic {
  id: string;
  name: string;
  status: TopicStatus;
  url?: string;
}

interface TopicStore {
  topics: Topic[];
  addTopic: (topic: Topic) => void;
  updateTopic: (id: string, updates: Partial<Pick<Topic, "status" | "url">>) => void;
  removeTopic: (id: string) => void;
  clearTopics: () => void;
}

const useTopicStore = create<TopicStore>()(
  persist(
    (set) => ({
      topics: [],

      addTopic: (topic) =>
        set((state) => ({ topics: [...state.topics, topic] })),

      updateTopic: (id, updates) =>
        set((state) => ({
          topics: state.topics.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),

      removeTopic: (id) =>
        set((state) => ({ topics: state.topics.filter((t) => t.id !== id) })),

      clearTopics: () => set({ topics: [] }),
    }),
    { name: "topic-storage" },
  ),
);

export default useTopicStore;
