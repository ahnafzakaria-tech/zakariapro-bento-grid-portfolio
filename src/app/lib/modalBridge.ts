type StoryListener = (milestoneId?: number) => void;

const storyListeners = new Set<StoryListener>();
const contactListeners = new Set<() => void>();

export function onOpenStory(listener: StoryListener): () => void {
  storyListeners.add(listener);
  return () => {
    storyListeners.delete(listener);
  };
}

export function onOpenContact(listener: () => void): () => void {
  contactListeners.add(listener);
  return () => {
    contactListeners.delete(listener);
  };
}

export function openStory(milestoneId?: number): void {
  storyListeners.forEach((fn) => fn(milestoneId));
}

export function openContact(): void {
  contactListeners.forEach((fn) => fn());
}